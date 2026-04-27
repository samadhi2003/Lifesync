"use client";

import { useState, useEffect, useRef } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

export default function DoctorProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentUid, setCurrentUid] = useState<string | null>(null);
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        licenseNumber: "",
        hospital: "",
        photoURL: "",
        notifications: true,
        twoFactor: true
    });
    const [stats, setStats] = useState<{ livesImpacted: number | null; matchAccuracy: number | null }>({
        livesImpacted: null,
        matchAccuracy: null,
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUid(user.uid);
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setProfile(prev => ({
                            ...prev,
                            name: data.fullName || "",
                            email: data.email || user.email || "",
                            phone: data.contact || "",
                            specialization: data.specialization || "",
                            licenseNumber: data.licenseNumber || "",
                            hospital: data.hospital || "",
                            photoURL: data.photoURL || "",
                        }));
                    }

                    const patientsSnap = await getDocs(
                        query(collection(db, "patients"), where("doctorId", "==", user.uid)),
                    );
                    const patientDocs = patientsSnap.docs.map((d) => d.data() as any);
                    const livesImpacted = patientDocs.length;
                    const matchedCount = patientDocs.filter((p) => (p.status || "").toLowerCase() === "matched").length;
                    const matchAccuracy = livesImpacted > 0 ? Math.round((matchedCount / livesImpacted) * 100) : null;
                    setStats({ livesImpacted, matchAccuracy });
                } catch (err) {
                    console.error("Error fetching profile:", err);
                }
                setLoading(false);
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        if (!currentUid) return;

        try {
            await updateDoc(doc(db, "users", currentUid), {
                fullName: profile.name,
                contact: profile.phone,
                specialization: profile.specialization,
                licenseNumber: profile.licenseNumber,
                hospital: profile.hospital,
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUid) return;

        setUploading(true);
        try {
            const storageRef = ref(storage, `profile_pictures/${currentUid}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            await updateDoc(doc(db, "users", currentUid), {
                photoURL: downloadURL
            });

            setProfile(prev => ({ ...prev, photoURL: downloadURL }));
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008080] mx-auto mb-4"></div>
                    <p className="text-gray-400 font-medium animate-pulse">Synchronizing clinical data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="font-sans max-w-6xl mx-auto pb-20">
            {/* Header Section */}
            <div className="relative mb-12">
                <div className="h-48 bg-[#008080] rounded-[2.5rem] overflow-hidden relative shadow-2xl shadow-teal-900/10">
                    <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-10%] left-[5%] w-64 h-64 bg-teal-400/20 rounded-full blur-2xl"></div>
                </div>

                <div className="absolute -bottom-10 left-10 flex items-end gap-8 px-2">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-[2.2rem] bg-white p-1.5 shadow-2xl overflow-hidden ring-4 ring-white">
                            {profile.photoURL ? (
                                <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover rounded-[1.85rem]" />
                            ) : (
                                <div className="w-full h-full rounded-[1.85rem] bg-teal-50 flex items-center justify-center text-[#008080] text-3xl font-black">
                                    {(profile.name || "?").substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            {isEditing && (
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.85rem]"
                                >
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
                        </div>
                        {uploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-[2.2rem]">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008080]"></div>
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{profile.name || "Doctor"}</h1>
                        <p className="text-teal-600 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">{profile.specialization || "Specialization pending"}</p>
                    </div>
                </div>

                <div className="absolute -bottom-6 right-0 flex gap-3">
                    {isEditing ? (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setIsEditing(false)} 
                                className="px-6 py-2.5 bg-white text-gray-400 font-bold rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave} 
                                className="px-8 py-2.5 bg-[#008080] text-white font-bold rounded-xl shadow-xl shadow-teal-900/10 hover:bg-[#006967] hover:shadow-teal-900/20 active:scale-95 transition-all text-sm"
                            >
                                Save Changes
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setIsEditing(true)} 
                            className="px-8 py-2.5 bg-white text-[#008080] font-bold rounded-xl border border-teal-50 shadow-md hover:bg-teal-50/50 transition-all flex items-center gap-2 text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-20">
                {/* Left Column: Basic Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#008080]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Personal & Professional Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {[
                                { label: "Full Name", key: "name", type: "text" },
                                { label: "Medical License", key: "licenseNumber", type: "text" },
                                { label: "Email Address", key: "email", type: "email" },
                                { label: "Contact Phone", key: "phone", type: "text" },
                                { label: "Affiliated Hospital", key: "hospital", type: "text" },
                                { label: "Specialization", key: "specialization", type: "text" },
                            ].map((field) => (
                                <div key={field.key} className="space-y-1.5">
                                    <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] ml-1">
                                        {field.label}
                                    </label>
                                    <input
                                        type={field.type}
                                        disabled={!isEditing}
                                        value={String(profile[field.key as keyof typeof profile] ?? "")}
                                        onChange={(e) => setProfile(prev => ({ ...prev, [field.key]: e.target.value }))}
                                        className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-3.5 text-gray-900 font-bold text-sm focus:ring-2 focus:ring-[#008080]/10 transition-all disabled:opacity-60"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#1A1C1E] rounded-[2rem] p-8 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h4 className="text-3xl font-black mb-1 font-sans">{stats.livesImpacted ?? "—"}</h4>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Lives Impacted</p>
                        </div>
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-50 shadow-sm relative overflow-hidden group">
                            <h4 className="text-3xl font-black text-gray-900 mb-1 font-sans">{stats.matchAccuracy === null ? "—" : `${stats.matchAccuracy}%`}</h4>
                            <p className="text-[#94A3B8] text-[10px] font-black uppercase tracking-widest">Match Accuracy</p>
                        </div>
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-50 shadow-sm relative overflow-hidden group text-center">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-teal-50 text-[#008080] mb-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-gray-900 text-xs font-black uppercase tracking-widest block">Verified Doctor</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings & Support */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-8">Clinical Alerts</h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Urgent Notifications</p>
                                    <p className="text-[10px] text-[#94A3B8] font-medium mt-0.5">Critical matches & updates</p>
                                </div>
                                <button 
                                    onClick={() => setProfile(prev => ({ ...prev, notifications: !prev.notifications }))}
                                    className={`w-10 h-5 rounded-full transition-all relative ${profile.notifications ? 'bg-[#008080]' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${profile.notifications ? 'left-6' : 'left-1'}`}></div>
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Two-Factor Auth</p>
                                    <p className="text-[10px] text-[#94A3B8] font-medium mt-0.5">Record security</p>
                                </div>
                                <button 
                                    onClick={() => setProfile(prev => ({ ...prev, twoFactor: !prev.twoFactor }))}
                                    className={`w-10 h-5 rounded-full transition-all relative ${profile.twoFactor ? 'bg-[#008080]' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${profile.twoFactor ? 'left-6' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#008080] to-[#005F5F] rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl transition-transform group-hover:scale-125"></div>
                        <h3 className="text-lg font-bold mb-2">Technical Support</h3>
                        <p className="text-teal-50/70 text-[10px] leading-relaxed mb-6 font-medium">Encountering system errors? Contact our IT infrastructure team directly for immediate assistance.</p>
                        <button className="w-full py-4 bg-white text-[#008080] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-teal-50 transition-all shadow-lg active:scale-95">Support Portal</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
