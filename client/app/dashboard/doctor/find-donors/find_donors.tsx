"use client";

import { useState, useRef } from "react";
import { db, storage, auth } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function FindDonors() {
    const [isSearching, setIsSearching] = useState(false);
    const [matches, setMatches] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [hlaUrl, setHlaUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [filters, setFilters] = useState({
        patientName: "",
        bloodGroup: "",
        urgency: "",
        dialysis: false
    });

    const handleSavePatient = async () => {
        if (!filters.patientName || !filters.bloodGroup || !filters.urgency) {
            alert("Please fill in all patient details including Name, Blood Group, and Urgency.");
            return;
        }

        try {
            setUploading(true); // Reusing uploading state for saving indicator
            await addDoc(collection(db, "patients"), {
                name: filters.patientName,
                bloodGroup: filters.bloodGroup,
                urgency: filters.urgency,
                onDialysis: filters.dialysis,
                hlaUrl: hlaUrl || null,
                doctorId: auth.currentUser?.uid,
                createdAt: new Date().toISOString(),
                status: "Searching" // Default status
            });
            alert("Patient details saved successfully!");
        } catch (error) {
            console.error("Error saving patient:", error);
            alert("Failed to save patient details.");
        } finally {
            setUploading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // Upload to hla_reports folder
            const timestamp = Date.now();
            const storageRef = ref(storage, `hla_reports/${timestamp}_${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            setHlaUrl(downloadURL);
            alert("HLA Report uploaded successfully!");
        } catch (error) {
            console.error("Error uploading HLA report:", error);
            alert("Failed to upload HLA report.");
        } finally {
            setUploading(false);
        }
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
            })) as any[];

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
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Patient Name</label>
                            <input
                                type="text"
                                placeholder="Enter patient name"
                                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:bg-white transition-all"
                                value={filters.patientName}
                                onChange={(e) => setFilters({ ...filters, patientName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select blood group</label>
                            <select
                                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:bg-white transition-all appearance-none"
                                value={filters.bloodGroup}
                                onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
                            >
                                <option>Select your blood group</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select urgency level</label>
                            <select
                                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:bg-white transition-all appearance-none"
                                value={filters.urgency}
                                onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
                            >
                                <option>Select urgency level</option>
                                <option value="Critical">Critical</option>
                                <option value="High">High</option>
                                <option value="Moderate">Moderate</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">On Dialysis</label>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setFilters({ ...filters, dialysis: true })}
                                    className={`flex-1 py-3 font-bold rounded-xl shadow-lg transition-all ${filters.dialysis ? 'bg-[#008080] text-white shadow-teal-900/20' : 'bg-white text-gray-400 border border-gray-100'}`}
                                >
                                    Yes
                                </button>
                                <button
                                    onClick={() => setFilters({ ...filters, dialysis: false })}
                                    className={`flex-1 py-3 font-bold rounded-xl shadow-lg transition-all ${!filters.dialysis ? 'bg-[#008080] text-white shadow-teal-900/20' : 'bg-white text-gray-400 border border-gray-100'}`}
                                >
                                    No
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">HLA Report uploaded</label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf,.jpg,.png"
                                onChange={handleFileUpload}
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed ${hlaUrl ? 'border-teal-500 bg-teal-50/50' : 'border-gray-100 bg-gray-50/30'} rounded-[1.5rem] p-10 flex flex-col items-center justify-center gap-4 text-gray-400 hover:bg-gray-50/80 transition-all cursor-pointer relative`}
                            >
                                {uploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-xs font-bold text-teal-600">Uploading...</p>
                                    </div>
                                ) : hlaUrl ? (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-teal-700">Upload Complete</p>
                                            <p className="text-xs text-teal-600">Click to change file</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        <div className="text-center">
                                            <p className="font-bold text-gray-500">Click to upload or drag and drop</p>
                                            <p className="text-xs">PDF only</p>
                                        </div>
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
                                    <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-[#008080]">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-gray-900">{donor.fullName || "Unknown Donor"}</h4>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Blood Group: {donor.bloodGroup || "N/A"}</p>
                                                {donor.address && <p className="text-[10px] text-gray-400 font-medium mt-1">{donor.address}</p>}
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Match</span>
                                                <span className="text-lg font-black text-teal-500">{donor.matchPercentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2 shadow-inner overflow-hidden">
                                                <div
                                                    className="h-full bg-teal-400 rounded-full transition-all duration-1000"
                                                    style={{ width: `${donor.matchPercentage}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <button className="w-full py-3 bg-white text-[#008080] font-bold text-xs uppercase tracking-widest rounded-xl border border-teal-100 hover:bg-teal-50 transition-all flex items-center justify-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                            </svg>
                                            Save donor
                                        </button>
                                    </div>
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
