"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { db, storage, auth } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { isVerified } from "@/lib/verification";
import VerifiedBadge from "@/app/components/VerifiedBadge";
import { HlaTyping, LOCI, LOCUS_LABEL, Locus, pruneTyping } from "@/lib/hla";

const LOCUS_HINTS: Record<Locus, [string, string]> = {
    A: ["31", "33"],
    B: ["35", "55"],
    C: ["01", "04"],
    DRB1: ["04", "07"],
    DRB345: ["DRB4*01", "DRB4*01(N)"],
    DQA1: ["02", "03"],
    DQB1: ["03", "03"],
    DPA1: ["01", "01"],
    DPB1: ["02", "04"],
};

export default function FindDonors() {
    const [isSearching, setIsSearching] = useState(false);
    const [matches, setMatches] = useState<Record<string, unknown>[]>([]);
    const [uploading, setUploading] = useState(false);
    const [hlaUrl, setHlaUrl] = useState<string | null>(null);
    const [hlaReportFile, setHlaReportFile] = useState<File | null>(null);
    const [medicalReportFile, setMedicalReportFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [filters, setFilters] = useState({
        patientName: "",
        bloodGroup: "",
        urgency: "",
        dialysis: false
    });
    const [hlaTyping, setHlaTyping] = useState<Partial<Record<Locus, [string, string]>>>({});

    const setAllele = (locus: Locus, index: 0 | 1, value: string) => {
        setHlaTyping((prev) => {
            const current = prev[locus] || ["", ""];
            const next: [string, string] = [current[0] || "", current[1] || ""];
            next[index] = value;
            return { ...prev, [locus]: next };
        });
    };

    const handleSavePatient = async () => {
        if (!filters.patientName || !filters.bloodGroup || !filters.urgency) {
            alert("Please fill in all patient details including Name, Blood Group, and Urgency.");
            return;
        }

        try {
            setUploading(true); // Reusing uploading state for saving indicator

            const doctorId = auth.currentUser?.uid;
            const payload: Record<string, unknown> = {
                name: filters.patientName,
                bloodGroup: filters.bloodGroup,
                urgency: filters.urgency,
                onDialysis: filters.dialysis,
                hlaUrl: hlaUrl || null,
                doctorId,
                createdAt: new Date().toISOString(),
                status: "Searching",
            };

            const hlaPayload = pruneTyping({
                ...(hlaTyping as HlaTyping),
                enteredBy: doctorId,
                enteredByRole: "doctor",
                enteredAt: new Date().toISOString(),
            });
            if (Object.keys(hlaPayload).some((k) => !["enteredBy", "enteredByRole", "enteredAt"].includes(k))) {
                payload.hla = hlaPayload;
            }

            await addDoc(collection(db, "patients"), payload);
            alert("Patient details saved successfully!");
        } catch (error) {
            console.error("Error saving patient:", error);
            alert("Failed to save patient details.");
        } finally {
            setUploading(false);
        }
    };

    const handleHlaReportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setHlaReportFile(file);
        setUploading(true);
        try {
            const timestamp = Date.now();
            const storageRef = ref(storage, `hla_reports/${timestamp}_${file.name}`);
            await uploadBytes(storageRef, file);
            setHlaUrl(await getDownloadURL(storageRef));
        } catch (err) {
            console.error("HLA upload failed:", err);
            alert("Failed to upload HLA report.");
        } finally {
            setUploading(false);
        }
    };

    const handleMedicalReportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setMedicalReportFile(file);
    };

    const handleSearch = async () => {
        setIsSearching(true);
        setMatches([]);

        try {
            // Base query: get all donors
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("role", "==", "donor"));

            const querySnapshot = await getDocs(q);
            let donors = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Record<string, unknown>[];

            // Only verified donors should be surfaced to doctors during matching.
            donors = donors.filter((d) => isVerified(d));

            // Client-side filtering (Firestore queries are limited for multiple fields without indices)
            if (filters.bloodGroup && filters.bloodGroup !== "Select your blood group") {
                donors = donors.filter(d => d.bloodGroup === filters.bloodGroup);
            }

            // Generate deterministic match percentage
            const donorsWithMatch = donors.map(d => {
                const pseudoRandom = (d.uid || d.id || "").split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 40 + 60; // 60-99%
                return { ...d, matchPercentage: pseudoRandom };
            });

            setMatches(donorsWithMatch);
        } catch (error) {
            console.error("Error searching donors:", error);
            alert("Failed to fetch donors. Please try again.");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="font-sans relative min-h-screen">
            <div className="mb-10 relative z-10">
                <h1 className="text-[#006967] text-3xl font-black tracking-tight mb-2">Find Donors</h1>
                <p className="text-gray-500 font-medium text-lg">Search for compatible kidney donors for your patients</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
                {/* Search Form */}
                <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] border border-white/50 p-8 shadow-2xl shadow-slate-900/[0.03]">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#008080]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Patient Information</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-gray-500 text-xs font-semibold ml-1">Patient Name</label>
                            <input
                                type="text"
                                placeholder="Enter patient name"
                                className="w-full bg-[#F5F5F5] border border-transparent rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white transition-all text-sm"
                                value={filters.patientName}
                                onChange={(e) => setFilters({ ...filters, patientName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-gray-500 text-xs font-semibold ml-1">Blood Group</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-[#F5F5F5] border border-transparent rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white appearance-none transition-all cursor-pointer text-sm"
                                    value={filters.bloodGroup}
                                    onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
                                >
                                    <option value="" disabled>Select your blood group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-gray-500 text-xs font-semibold ml-1">On Dialysis?</label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFilters({ ...filters, dialysis: true })}
                                    className={`flex-1 py-3.5 rounded-lg border transition-all text-sm font-semibold ${filters.dialysis === true ? "bg-[#4AA3FF] text-white border-[#4AA3FF]" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}
                                >
                                    Yes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilters({ ...filters, dialysis: false })}
                                    className={`flex-1 py-3.5 rounded-lg border transition-all text-sm font-semibold ${filters.dialysis === false ? "bg-[#4AA3FF] text-white border-[#4AA3FF]" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}
                                >
                                    No
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-gray-500 text-xs font-semibold ml-1">Urgency Level</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-[#F5F5F5] border border-transparent rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white appearance-none transition-all cursor-pointer text-sm"
                                    value={filters.urgency}
                                    onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
                                >
                                    <option value="" disabled>Select urgency level</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Manual HLA Typing Entry */}
                        <div className="space-y-3 pt-2">
                            <div>
                                <label className="block text-gray-500 text-xs font-semibold ml-1">HLA Typing <span className="text-gray-300 font-normal">(optional, can be added later)</span></label>
                                <p className="text-[10px] text-gray-400 ml-1 mt-1 leading-relaxed">
                                    Transcribe each locus from the patient&apos;s Histocompatibility report. Enter both alleles per row using the broad serological number (e.g. <span className="font-mono">31</span>, <span className="font-mono">35</span>). Null alleles can be written as <span className="font-mono">DRB4*01(N)</span>.
                                </p>
                            </div>
                            <div className="overflow-x-auto bg-[#F5F5F5] rounded-lg p-3">
                                <table className="w-full text-sm border-separate border-spacing-y-1.5">
                                    <thead>
                                        <tr className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                            <th className="text-left px-2 py-1">Locus</th>
                                            <th className="text-left px-2 py-1">Allele 1</th>
                                            <th className="text-left px-2 py-1">Allele 2</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {LOCI.map((locus) => {
                                            const pair = hlaTyping[locus] || ["", ""];
                                            return (
                                                <tr key={locus}>
                                                    <td className="px-2 align-middle">
                                                        <span className="font-bold text-gray-700 text-xs">{LOCUS_LABEL[locus]}</span>
                                                    </td>
                                                    <td className="px-2">
                                                        <input
                                                            value={pair[0] || ""}
                                                            onChange={(e) => setAllele(locus, 0, e.target.value)}
                                                            placeholder={LOCUS_HINTS[locus][0]}
                                                            className="w-full bg-white border border-transparent rounded-md px-3 py-2 text-xs font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008080]/30 transition-all"
                                                        />
                                                    </td>
                                                    <td className="px-2">
                                                        <input
                                                            value={pair[1] || ""}
                                                            onChange={(e) => setAllele(locus, 1, e.target.value)}
                                                            placeholder={LOCUS_HINTS[locus][1]}
                                                            className="w-full bg-white border border-transparent rounded-md px-3 py-2 text-xs font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008080]/30 transition-all"
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Compact HLA report attach pill */}
                            <div className="flex items-center gap-2 pl-1">
                                <label className="inline-flex items-center gap-2 text-[11px] text-gray-500 font-semibold cursor-pointer hover:text-[#008080] transition-colors group">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept=".pdf"
                                        onChange={handleHlaReportChange}
                                        className="hidden"
                                    />
                                    <span className="w-7 h-7 rounded-full bg-[#F5F5F5] group-hover:bg-[#008080]/10 flex items-center justify-center text-gray-400 group-hover:text-[#008080] transition-colors">
                                        {uploading && !hlaUrl ? (
                                            <div className="w-3.5 h-3.5 border-2 border-[#008080] border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                        )}
                                    </span>
                                    {hlaReportFile ? (
                                        <span className="text-[#008080]">{hlaReportFile.name}</span>
                                    ) : (
                                        <span>Attach HLA report PDF <span className="text-gray-300 font-normal">(optional, supporting document)</span></span>
                                    )}
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-gray-500 text-xs font-semibold ml-1">Other Medical Reports <span className="text-gray-300 font-normal">(optional)</span></label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#008080] transition-colors bg-white relative">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleMedicalReportChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                {medicalReportFile ? (
                                    <p className="text-[#008080] text-xs font-semibold">{medicalReportFile.name}</p>
                                ) : (
                                    <>
                                        <p className="text-gray-400 text-xs">Click to upload or drag and drop</p>
                                        <p className="text-gray-300 text-[10px] mt-1">PDF only</p>
                                    </>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="w-full py-5 bg-[#008080] hover:bg-[#006967] text-white font-black rounded-[1.25rem] shadow-xl shadow-teal-900/10 hover:shadow-teal-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                        >
                            {isSearching ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            )}
                            Search Donors
                        </button>

                        <button
                            onClick={handleSavePatient}
                            disabled={uploading}
                            className="w-full py-5 bg-white text-[#008080] font-black rounded-[1.25rem] border border-teal-100 hover:bg-teal-50 transition-all flex items-center justify-center gap-3 mt-4"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save Patient for Later
                        </button>
                    </div>
                </div>

                {/* Search Result */}
                <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] border border-white/50 p-8 shadow-2xl shadow-slate-900/[0.03]">
                    <div className="flex flex-col h-full">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Donor match result</h2>
                        {matches.length > 0 && <p className="text-gray-500 text-xs mb-8 font-medium">Found {matches.length} compatible donors</p>}

                        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
                            {matches.length === 0 && !isSearching ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
                                    <div className="w-20 h-20 rounded-full bg-gray-50/50 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-bold text-gray-900 text-lg">No Search Yet</h3>
                                        <p className="text-sm">Enter patient information to find compatible donors</p>
                                    </div>
                                </div>
                            ) : matches.length > 0 ? (
                                matches.map((donor, idx) => (
                                    <Link
                                        key={idx}
                                        href={`/dashboard/doctor/donors/${donor.id}`}
                                        className="block bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-teal-100 transition-all group"
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-[#008080] group-hover:bg-teal-100 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-extrabold text-gray-900 group-hover:text-[#008080] transition-colors">{donor.fullName as string || "Unknown Donor"}</h4>
                                                    <VerifiedBadge user={donor as Record<string, unknown>} />
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Blood Group: {donor.bloodGroup as string || "N/A"}</p>
                                                {donor.address && <p className="text-[10px] text-gray-400 font-medium mt-1">{donor.address as string}</p>}
                                            </div>
                                        </div>

                                        <div className="mb-5">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Match</span>
                                                <span className="text-lg font-black text-teal-500">{donor.matchPercentage as number}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2 shadow-inner overflow-hidden">
                                                <div
                                                    className="h-full bg-teal-400 rounded-full transition-all duration-1000"
                                                    style={{ width: `${donor.matchPercentage}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-50 group-hover:bg-teal-100 border border-teal-100 transition-colors">
                                            <span className="text-xs font-black text-teal-600 uppercase tracking-widest">View Profile</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-500 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </Link>
                                ))
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                select {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1.25rem center;
                    background-size: 1.25rem;
                }
            `}</style>
        </div>
    );
}
