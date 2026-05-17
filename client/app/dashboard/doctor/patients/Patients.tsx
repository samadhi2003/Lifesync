"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { computeMatchPercentage } from "@/lib/matching";
import { isVerified } from "@/lib/verification";
import VerifiedBadge from "@/app/components/VerifiedBadge";
import { HlaTyping, LOCI, LOCUS_LABEL, Locus, hasHla, pruneTyping } from "@/lib/hla";

type EditDraft = {
    name: string;
    urgency: string;
    bloodGroup: string;
    onDialysis: boolean;
    hla: HlaTyping;
    labReference: string;
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCY_LEVELS = ["Low", "Medium", "High", "Critical"];

function buildDraft(patient: unknown): EditDraft {
    const hla: HlaTyping = {};
    const source = (patient?.hla as HlaTyping | undefined) || {};
    for (const locus of LOCI) {
        const pair = source[locus];
        hla[locus] = [pair?.[0] || "", pair?.[1] || ""];
    }
    return {
        name: patient?.name || "",
        urgency: patient?.urgency || "Medium",
        bloodGroup: patient?.bloodGroup || "",
        onDialysis: !!patient?.onDialysis,
        hla,
        labReference: source.labReference || "",
    };
}

type SuggestedDonor = {
    id: string;
    name: string;
    bloodGroup: string;
    matchPercentage: number;
    status: "Available" | "Pending";
};

export default function Patients() {
    const [searchTerm, setSearchTerm] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [suggestedDonors, setSuggestedDonors] = useState<SuggestedDonor[]>([]);
    const [suggestedLoading, setSuggestedLoading] = useState(false);
    const [primaryPhysician, setPrimaryPhysician] = useState<string>("");
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState<EditDraft | null>(null);
    const [savingEdit, setSavingEdit] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        setIsEditing(false);
        setDraft(selectedPatient ? buildDraft(selectedPatient) : null);
    }, [selectedPatient?.id]);

    const canManagePatient =
        !!selectedPatient?.doctorId &&
        !!currentUser?.uid &&
        selectedPatient.doctorId === currentUser.uid;

    const handleStartEdit = () => {
        if (!selectedPatient) return;
        setDraft(buildDraft(selectedPatient));
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setDraft(selectedPatient ? buildDraft(selectedPatient) : null);
        setIsEditing(false);
    };

    const handleDraftField = <K extends keyof EditDraft>(key: K, value: EditDraft[K]) => {
        setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    };

    const handleDraftAllele = (locus: Locus, index: 0 | 1, value: string) => {
        setDraft((prev) => {
            if (!prev) return prev;
            const current = prev.hla[locus] || ["", ""];
            const nextPair: [string, string] = [current[0] || "", current[1] || ""];
            nextPair[index] = value;
            return { ...prev, hla: { ...prev.hla, [locus]: nextPair } };
        });
    };

    const handleSaveEdit = async () => {
        if (!selectedPatient || !draft) return;
        if (!draft.name.trim()) {
            alert("Name is required.");
            return;
        }
        if (!draft.bloodGroup) {
            alert("Blood group is required.");
            return;
        }
        setSavingEdit(true);
        try {
            const hlaPayload = pruneTyping({
                ...draft.hla,
                labReference: draft.labReference || undefined,
                enteredBy: currentUser?.uid,
                enteredByRole: "doctor",
                enteredAt: new Date().toISOString(),
            });
            const hasHlaContent = Object.keys(hlaPayload).some(
                (k) => !["enteredBy", "enteredByRole", "enteredAt"].includes(k),
            );
            const updates: Record<string, unknown> = {
                name: draft.name.trim(),
                urgency: draft.urgency,
                bloodGroup: draft.bloodGroup,
                onDialysis: draft.onDialysis,
                hla: hasHlaContent ? hlaPayload : null,
            };
            await updateDoc(doc(db, "patients", selectedPatient.id), updates);
            const updatedPatient = { ...selectedPatient, ...updates };
            setSelectedPatient(updatedPatient);
            setPatients((prev) => prev.map((p) => (p.id === selectedPatient.id ? updatedPatient : p)));
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update patient:", err);
            alert("Failed to update patient.");
        } finally {
            setSavingEdit(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedPatient) return;
        const confirmed = window.confirm(
            `Delete patient "${selectedPatient.name}"? This cannot be undone.`,
        );
        if (!confirmed) return;
        setDeleting(true);
        try {
            await deleteDoc(doc(db, "patients", selectedPatient.id));
            setPatients((prev) => prev.filter((p) => p.id !== selectedPatient.id));
            setSelectedPatient(null);
        } catch (err) {
            console.error("Failed to delete patient:", err);
            alert("Failed to delete patient.");
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!selectedPatient?.doctorId) {
            setPrimaryPhysician("");
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const snap = await getDoc(doc(db, "users", selectedPatient.doctorId));
                if (cancelled) return;
                const data = snap.exists() ? (snap.data() as Record<string, unknown>) : null;
                setPrimaryPhysician(data?.fullName || data?.email || "");
            } catch (err) {
                console.error("Failed to load primary physician:", err);
                if (!cancelled) setPrimaryPhysician("");
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [selectedPatient?.doctorId]);

    useEffect(() => {
        if (!selectedPatient) {
            setSuggestedDonors([]);
            return;
        }

        let cancelled = false;
        (async () => {
            setSuggestedLoading(true);
            try {
                const donorsSnap = await getDocs(
                    query(collection(db, "users"), where("role", "==", "donor")),
                );
                const donors = donorsSnap.docs
                    .map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }))
                    // Only verified donors should be suggested for patient matching.
                    .filter((d: unknown) => isVerified(d))
                    .map((d: unknown): SuggestedDonor => ({
                        id: d.id,
                        name: d.fullName || "Unnamed Donor",
                        bloodGroup: d.bloodGroup || "—",
                        matchPercentage: computeMatchPercentage(selectedPatient, d),
                        // Donors with an HLA report on file are considered "Available" for review;
                        // the rest are shown as Pending documentation.
                        status: d.hlaReportURL ? "Available" : "Pending",
                    }))
                    .sort((a, b) => b.matchPercentage - a.matchPercentage)
                    .slice(0, 3);
                if (!cancelled) setSuggestedDonors(donors);
            } catch (err) {
                console.error("Failed to load suggested donors:", err);
            } finally {
                if (!cancelled) setSuggestedLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [selectedPatient]);

    // Initial fetch of all patients
    useEffect(() => {
        const fetchInitialPatients = async () => {
            try {
                setLoading(true);
                const patientsRef = collection(db, "patients");
                const q = query(patientsRef);
                const querySnapshot = await getDocs(q);
                const fetchedPatients = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPatients(fetchedPatients);
            } catch (error) {
                console.error("Error initial fetch:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialPatients();
    }, []);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setHasSearched(false);
            return;
        }

        setLoading(true);
        setHasSearched(true);

        try {
            const patientsRef = collection(db, "patients");

            // In a real app with many patients, you'd use a more specific query or a search service (like Algolia)
            // For now, getting all patients created by this doctor and filtering client-side for "name" search
            // Or simple Firestore query for exact/prefix match if possible.

            // Let's try searching by name directly if possible, or just all doctor's patients
            // FETCH ALL PATIENTS (Debugging Mode)
            const q = query(patientsRef);

            const querySnapshot = await getDocs(q);
            const fetchedPatients = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Client-side filter for fuzzy search simulation
            const filtered = fetchedPatients.filter((p: unknown) =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            setPatients(filtered);
            if (filtered.length > 0) {
                setSelectedPatient(filtered[0]); // Select first match by default
            } else {
                setSelectedPatient(null);
            }

        } catch (error) {
            console.error("Error fetching patients:", error);
            alert("Failed to search patients.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-sans relative min-h-screen">
            <div className="mb-10 relative z-10">
                <h1 className="text-[#006967] text-2xl font-black tracking-tight mb-2">Patient Search</h1>
                <p className="text-gray-500 font-medium text-lg">Search for patient information and view matching history</p>
            </div>

            {/* Search Bar Container */}
            <div className="mb-12 relative z-10">
                <div className="bg-white/70 backdrop-blur-2xl rounded-[1.5rem] border border-white/50 p-4 shadow-xl shadow-teal-900/[0.04] border flex items-center gap-4">
                    <div className="flex-1 px-4">
                        <input
                            type="text"
                            placeholder="Enter patient name"
                            className="w-full bg-transparent outline-none text-gray-700 font-medium text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="bg-[#008080] hover:bg-[#006967] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-teal-900/10 active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search
                    </button>
                </div>
            </div>

            <div className="relative z-10">
                {!selectedPatient ? (
                    <div className="space-y-8">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#008080]"></div>
                            </div>
                        ) : patients.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {patients.map((patient) => (
                                    <div
                                        key={patient.id}
                                        onClick={() => setSelectedPatient(patient)}
                                        className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-[#008080] group-hover:bg-[#008080] group-hover:text-white transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${patient.urgency === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-teal-100 text-teal-600'}`}>
                                                {patient.urgency}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">{patient.name}</h3>
                                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{patient.bloodGroup} Blood Group</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 p-20 shadow-2xl flex flex-col items-center justify-center text-center gap-6">
                                <div className="w-24 h-24 bg-gray-50 flex items-center justify-center rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-400">No Patients Found</h2>
                                    <p className="text-gray-400 mt-2 font-medium">Add patients via the "Find Donors" page to see them here.</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* Patient Profile Details Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Avatar & Basic Info */}
                            <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 p-10 shadow-xl min-h-[400px]">
                                <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center text-[#008080] mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                                            <button
                                                onClick={() => setSelectedPatient(null)}
                                                className="flex items-center gap-2 text-gray-400 hover:text-[#008080] transition-colors text-sm font-bold uppercase tracking-widest"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                                </svg>
                                                Back to List
                                            </button>
                                            {canManagePatient && (
                                                <div className="flex items-center gap-2">
                                                    {isEditing ? (
                                                        <>
                                                            <button
                                                                onClick={handleSaveEdit}
                                                                disabled={savingEdit}
                                                                className="px-4 py-2 bg-[#008080] hover:bg-[#006967] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all disabled:opacity-60"
                                                            >
                                                                {savingEdit ? "Saving…" : "Save"}
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                disabled={savingEdit}
                                                                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={handleStartEdit}
                                                                className="px-4 py-2 bg-[#008080] hover:bg-[#006967] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={handleDelete}
                                                                disabled={deleting}
                                                                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold uppercase tracking-widest rounded-xl transition-all disabled:opacity-60"
                                                            >
                                                                {deleting ? "Deleting…" : "Delete"}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Full Name</label>
                                        {isEditing && draft ? (
                                            <input
                                                value={draft.name}
                                                onChange={(e) => handleDraftField("name", e.target.value)}
                                                className="w-full bg-gray-50 rounded-lg px-3 py-2 text-2xl font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#008080]/30"
                                            />
                                        ) : (
                                            <p className="text-2xl font-black text-gray-900">{selectedPatient.name}</p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Urgency</label>
                                            {isEditing && draft ? (
                                                <select
                                                    value={draft.urgency}
                                                    onChange={(e) => handleDraftField("urgency", e.target.value)}
                                                    className="w-full bg-gray-50 rounded-lg px-3 py-2 text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#008080]/30"
                                                >
                                                    {URGENCY_LEVELS.map((u) => (
                                                        <option key={u} value={u}>{u}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <p className={`text-xl font-bold ${selectedPatient.urgency === 'Critical' ? 'text-red-500' : 'text-gray-900'}`}>{selectedPatient.urgency}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Blood Group</label>
                                            {isEditing && draft ? (
                                                <select
                                                    value={draft.bloodGroup}
                                                    onChange={(e) => handleDraftField("bloodGroup", e.target.value)}
                                                    className="w-full bg-gray-50 rounded-lg px-3 py-2 text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#008080]/30"
                                                >
                                                    <option value="" disabled>Select blood group</option>
                                                    {BLOOD_GROUPS.map((bg) => (
                                                        <option key={bg} value={bg}>{bg}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <p className="text-xl font-bold text-gray-900">{selectedPatient.bloodGroup}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Dialysis Status</label>
                                        {isEditing && draft ? (
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDraftField("onDialysis", true)}
                                                    className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-all ${draft.onDialysis ? "bg-[#008080] text-white border-[#008080]" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}
                                                >
                                                    On Dialysis
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDraftField("onDialysis", false)}
                                                    className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-all ${!draft.onDialysis ? "bg-[#008080] text-white border-[#008080]" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}
                                                >
                                                    Not on Dialysis
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="text-xl font-bold text-gray-900">{selectedPatient.onDialysis ? "On Dialysis" : "Not on Dialysis"}</p>
                                        )}
                                    </div>
                                    {selectedPatient.hlaUrl && (
                                        <div className="pt-4">
                                            <a href={selectedPatient.hlaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg text-sm font-bold hover:bg-teal-100 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                View HLA Report
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Additional Info Cards Column */}
                            <div className="space-y-8">
                                <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 p-8 shadow-xl flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Patient History</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-3 border-b border-gray-50 font-medium">
                                            <span className="text-gray-500">Added to roster:</span>
                                            <span className="text-gray-900">
                                                {selectedPatient.createdAt
                                                    ? new Date(selectedPatient.createdAt).toLocaleDateString()
                                                    : "—"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-50 font-medium">
                                            <span className="text-gray-500">Status:</span>
                                            <span className="text-gray-900">{selectedPatient.status || "Searching"}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-50 font-medium">
                                            <span className="text-gray-500">On Dialysis:</span>
                                            <span className="text-gray-900">{selectedPatient.onDialysis ? "Yes" : "No"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 p-8 shadow-xl flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Medical Contacts</h3>
                                    <p className="text-gray-500 text-sm font-medium">
                                        Primary Physician: {primaryPhysician || "—"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* HLA Typing */}
                        <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 p-10 shadow-xl">
                            <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
                                <h3 className="text-2xl font-black text-gray-900">HLA Typing</h3>
                                {!isEditing && selectedPatient.hla?.labReference && (
                                    <span className="text-xs font-semibold text-slate-500">Lab ref: {selectedPatient.hla.labReference}</span>
                                )}
                            </div>
                            {isEditing && draft ? (
                                <div className="space-y-4">
                                    <div className="overflow-x-auto bg-white border border-gray-100 rounded-3xl shadow-sm">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-gray-50">
                                                    <th className="text-left py-3 px-4">Locus</th>
                                                    <th className="text-left py-3 px-4">Allele 1</th>
                                                    <th className="text-left py-3 px-4">Allele 2</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {LOCI.map((locus) => {
                                                    const pair = draft.hla[locus] || ["", ""];
                                                    return (
                                                        <tr key={locus} className="border-b border-gray-50">
                                                            <td className="py-2 px-4 font-bold text-[#1A1C1E]">{LOCUS_LABEL[locus]}</td>
                                                            <td className="py-2 px-4">
                                                                <input
                                                                    value={pair[0] || ""}
                                                                    onChange={(e) => handleDraftAllele(locus, 0, e.target.value)}
                                                                    className="w-full bg-gray-50 rounded-lg px-3 py-2 text-sm font-mono text-[#1A1C1E] focus:outline-none focus:ring-2 focus:ring-[#008080]/30"
                                                                />
                                                            </td>
                                                            <td className="py-2 px-4">
                                                                <input
                                                                    value={pair[1] || ""}
                                                                    onChange={(e) => handleDraftAllele(locus, 1, e.target.value)}
                                                                    className="w-full bg-gray-50 rounded-lg px-3 py-2 text-sm font-mono text-[#1A1C1E] focus:outline-none focus:ring-2 focus:ring-[#008080]/30"
                                                                />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Lab Reference (optional)</label>
                                        <input
                                            value={draft.labReference}
                                            onChange={(e) => handleDraftField("labReference", e.target.value)}
                                            placeholder="e.g. 3578/24M"
                                            className="w-full bg-gray-50 rounded-lg px-3 py-2 text-sm font-mono text-[#1A1C1E] focus:outline-none focus:ring-2 focus:ring-[#008080]/30"
                                        />
                                    </div>
                                </div>
                            ) : hasHla(selectedPatient.hla as HlaTyping) ? (
                                <div className="overflow-x-auto bg-white border border-gray-100 rounded-3xl shadow-sm">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-gray-50">
                                                <th className="text-left py-3 px-4">Locus</th>
                                                <th className="text-left py-3 px-4">Allele 1</th>
                                                <th className="text-left py-3 px-4">Allele 2</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {LOCI.map((locus) => {
                                                const pair = (selectedPatient.hla as HlaTyping | undefined)?.[locus];
                                                const a1 = pair?.[0]?.trim() || "—";
                                                const a2 = pair?.[1]?.trim() || "—";
                                                const empty = a1 === "—" && a2 === "—";
                                                return (
                                                    <tr key={locus} className={`border-b border-gray-50 ${empty ? "bg-slate-50" : "bg-white"}`}>
                                                        <td className="py-3 px-4 font-bold text-[#1A1C1E]">{LOCUS_LABEL[locus]}</td>
                                                        <td className="py-3 px-4 font-mono text-slate-700">{a1}</td>
                                                        <td className="py-3 px-4 font-mono text-slate-700">{a2}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-slate-400 font-medium text-sm">No HLA typing on file for this patient yet.</p>
                            )}
                        </div>

                        {/* Suggested Donors */}
                        <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 p-10 shadow-xl">
                            <h3 className="text-2xl font-black text-gray-900 mb-8">Suggested Donors</h3>
                            {suggestedLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-[#008080]"></div>
                                </div>
                            ) : suggestedDonors.length === 0 ? (
                                <p className="text-slate-400 font-medium text-sm">No donors registered yet. Check back once donors join LifeSync.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {suggestedDonors.map((donor) => (
                                        <div key={donor.id} className="bg-white/50 border border-gray-100 p-6 rounded-3xl group hover:shadow-lg transition-all">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-[#008080]">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-extrabold text-gray-900">{donor.name}</h4>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Blood Group: {donor.bloodGroup}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${donor.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-teal-100 text-teal-600'}`}>
                                                    {donor.status}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Match</span>
                                                    <span className="text-lg font-black text-teal-500">{donor.matchPercentage}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-1.5 shadow-inner overflow-hidden">
                                                    <div className="h-full bg-teal-400 transition-all" style={{ width: `${donor.matchPercentage}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
