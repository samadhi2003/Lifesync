"use client";

import { useState, useEffect, useRef } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import {
    requestVerification,
    resolveStatus,
    statusLabel,
    statusTone,
    VerificationStatus,
} from "@/lib/verification";
import { notifyDoctorsOfReport } from "@/lib/notifications";
import { resizeImageToDataUrl } from "@/lib/imageResize";
import HlaEditor from "@/app/components/HlaEditor";
import { HlaTyping } from "@/lib/hla";

export default function DonorProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentUid, setCurrentUid] = useState<string | null>(null);
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        bloodGroup: "",
        photoURL: "",
        hlaReportURL: "",
        medicalReportURL: "",
        healthStatus: "Highly Compatible", // Placeholder
        notifications: true,
        twoFactor: false,
        verified: false as boolean | undefined,
        verificationStatus: undefined as VerificationStatus | undefined,
        verificationRequestedAt: "",
        verificationNotes: "",
        hla: undefined as HlaTyping | undefined,
    });
    const [requestingVerification, setRequestingVerification] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUid(user.uid);
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setProfile(prev => ({
                        ...prev,
                        name: data.fullName || "",
                        email: data.email || user.email || "",
                        phone: data.contact || "",
                        address: data.address || "",
                        bloodGroup: data.bloodGroup || "",
                        photoURL: data.photoURL || "",
                        hlaReportURL: data.hlaReportURL || "",
                        medicalReportURL: data.medicalReportURL || "",
                        verified: data.verified,
                        verificationStatus: data.verificationStatus,
                        verificationRequestedAt: data.verificationRequestedAt || "",
                        verificationNotes: data.verificationNotes || "",
                        hla: data.hla,
                    }));
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
                address: profile.address,
            });
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        }
    };

    const handleRequestVerification = async () => {
        if (!currentUid) return;
        setRequestingVerification(true);
        try {
            await requestVerification(currentUid);
            setProfile((prev) => ({
                ...prev,
                verificationStatus: "pending",
                verificationRequestedAt: new Date().toISOString(),
            }));
        } catch (error) {
            console.error("Error requesting verification:", error);
            alert("Failed to submit verification request.");
        } finally {
            setRequestingVerification(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUid) return;

        if (!file.type.startsWith("image/")) {
            alert("Please choose an image file.");
            return;
        }

        setUploading(true);
        try {
            const dataUrl = await resizeImageToDataUrl(file, 256, 0.85);
            await updateDoc(doc(db, "users", currentUid), { photoURL: dataUrl });
            setProfile(prev => ({ ...prev, photoURL: dataUrl }));
            alert("Profile picture updated!");
        } catch (error) {
            console.error("Error uploading image:", error);
            alert(`Failed to update profile picture: ${(error as Error).message || "Unknown error"}`);
        } finally {
            setUploading(false);
        }
    };
    
    const handleReportUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'hla' | 'medical') => {
        const file = e.target.files?.[0];
        if (!file || !currentUid) return;

        setUploading(true);
        try {
            const fileName = type === 'hla' ? 'hla-report.pdf' : 'medical-report.pdf';
            const storageRef = ref(storage, `reports/${currentUid}/${fileName}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            const updateData: any = {};
            if (type === 'hla') updateData.hlaReportURL = downloadURL;
            else updateData.medicalReportURL = downloadURL;

            await updateDoc(doc(db, "users", currentUid), updateData);

            setProfile(prev => ({ ...prev, [type === 'hla' ? 'hlaReportURL' : 'medicalReportURL']: downloadURL }));
            notifyDoctorsOfReport({
                uid: currentUid,
                uploaderName: profile.name,
                role: "donor",
                reportType: type,
            }).catch((err) => console.warn("Doctor notification failed:", err));
            alert(`${type === 'hla' ? 'HLA' : 'Medical'} report updated successfully!`);
        } catch (error) {
            console.error(`Error uploading ${type} report:`, error);
            alert(`Failed to upload ${type} report.`);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#008080] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="font-sans min-h-screen relative pb-20">
            {/* Background Decorative Blobs */}
            <div className="fixed top-20 left-20 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 -z-10 animate-pulse"></div>
            <div className="fixed bottom-20 right-20 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 -z-10"></div>

            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-gradient-to-br from-[#48D597] to-[#2E807D] p-1 shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                            {profile.photoURL ? (
                                <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover rounded-[1.8rem]" />
                            ) : (
                                <div className="w-full h-full rounded-[1.8rem] bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-4xl font-black border border-white/30">
                                    {profile.name.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                        {uploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-[2rem]">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                        )}
                        {isEditing && (
                            <>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 bg-white text-[#008080] p-2 rounded-xl shadow-lg border border-teal-50 hover:bg-teal-50 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">{profile.name}</h1>
                        <div className="flex flex-wrap gap-3 items-center">
                            <span className="px-4 py-1.5 bg-teal-50 text-[#008080] text-xs font-bold rounded-full border border-teal-100 uppercase tracking-widest shadow-sm">Donor</span>
                            {(() => {
                                const status = resolveStatus(profile);
                                const tone = statusTone(status);
                                return (
                                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest shadow-sm ${tone.badge}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`}></span>
                                        {statusLabel(status)}
                                    </span>
                                );
                            })()}
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} className="px-6 py-3 bg-white text-gray-500 font-bold rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all">Cancel</button>
                            <button onClick={handleSave} className="px-8 py-3 bg-[#008080] text-white font-bold rounded-2xl shadow-xl shadow-teal-900/10 hover:bg-[#006967] hover:shadow-teal-900/20 active:scale-95 transition-all">Save Changes</button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="px-8 py-3 bg-white text-[#008080] font-bold rounded-2xl border border-teal-50 shadow-sm hover:bg-teal-50/50 transition-all flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Profile Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Information Cards */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Personal Information */}
                    <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 p-8 shadow-2xl shadow-slate-900/[0.03]">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#008080]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 capitalize">Personal Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    disabled={!isEditing}
                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-3.5 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:bg-white transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-3.5 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:bg-white transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Living Address</label>
                                <textarea
                                    rows={2}
                                    disabled={!isEditing}
                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-3.5 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:bg-white transition-all disabled:opacity-70 disabled:cursor-not-allowed resize-none"
                                    value={profile.address}
                                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Medical Profile */}
                    <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 p-8 shadow-2xl shadow-slate-900/[0.03]">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 capitalize">Donor Profile</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[#008080]/5 rounded-2xl p-4 border border-[#008080]/10">
                                <span className="text-[10px] font-bold text-[#008080]/60 uppercase tracking-widest block mb-1">Blood Type</span>
                                <p className="text-gray-900 text-xl font-black">{profile.bloodGroup}</p>
                            </div>
                            <div className="bg-orange-500/5 rounded-2xl p-4 border border-orange-500/10 md:col-span-2">
                                <span className="text-[10px] font-bold text-orange-600/60 uppercase tracking-widest block mb-1">Eligibility Status</span>
                                <p className="text-gray-900 text-xl font-black">{profile.healthStatus}</p>
                            </div>
                            <div className="md:col-span-3 space-y-4">
                                <div className="p-5 bg-gradient-to-r from-teal-500/10 to-transparent rounded-[1.5rem] border border-teal-500/10 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#008080] shadow-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-gray-900 font-bold">HLA Documentation</h4>
                                            <p className="text-gray-500 text-xs">{profile.hlaReportURL ? "Report Uploaded" : "No Report Found"}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        {profile.hlaReportURL && (
                                            <a href={profile.hlaReportURL} target="_blank" rel="noopener noreferrer" className="text-[#008080] font-black text-xs uppercase tracking-tighter hover:underline underline-offset-4">View Records</a>
                                        )}
                                        {isEditing && (
                                            <div className="relative">
                                                <input type="file" accept=".pdf" onChange={(e) => handleReportUpload(e, 'hla')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                                <button className="bg-[#008080] text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#006967] transition-all">Upload New</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-5 bg-gradient-to-r from-orange-500/10 to-transparent rounded-[1.5rem] border border-orange-500/10 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-orange-600 shadow-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-gray-900 font-bold">Medical Documentation</h4>
                                            <p className="text-gray-500 text-xs">{profile.medicalReportURL ? "Report Uploaded" : "No Report Found"}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        {profile.medicalReportURL && (
                                            <a href={profile.medicalReportURL} target="_blank" rel="noopener noreferrer" className="text-orange-600 font-black text-xs uppercase tracking-tighter hover:underline underline-offset-4">View Records</a>
                                        )}
                                        {isEditing && (
                                            <div className="relative">
                                                <input type="file" accept=".pdf" onChange={(e) => handleReportUpload(e, 'medical')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                                <button className="bg-orange-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-orange-700 transition-all">Upload New</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {currentUid && (
                        <HlaEditor
                            uid={currentUid}
                            initial={profile.hla}
                            actorRole="donor"
                            actorUid={currentUid}
                            onSaved={(next) => setProfile((prev) => ({ ...prev, hla: next }))}
                        />
                    )}
                </div>

                {/* Right Column: Settings & Security */}
                <div className="space-y-8">
                    {(() => {
                        const status = resolveStatus(profile);
                        const tone = statusTone(status);
                        const canRequest = status === "unverified" || status === "rejected";
                        return (
                            <div className={`${tone.card} backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
                                <div className="flex items-center gap-3 mb-4">
                                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tone.badge}`}>
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                         </svg>
                                     </div>
                                     <h2 className={`text-xl font-bold ${tone.text}`}>Verification</h2>
                                 </div>
                                 <p className={`${tone.subtext} text-xs leading-relaxed mb-4`}>
                                     A LifeSync doctor must review your profile and HLA documentation before you appear in patient matches. Only verified donors can be matched to verified patients.
                                 </p>
                                 <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-4 ${tone.badge}`}>
                                     <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`}></span>
                                     {statusLabel(status)}
                                 </div>
                                 {profile.verificationRequestedAt && status === "pending" && (
                                     <p className={`text-[10px] ${tone.subtext} font-medium mb-4`}>Requested on {new Date(profile.verificationRequestedAt).toLocaleDateString()}.</p>
                                 )}
                                 {profile.verificationNotes && status === "rejected" && (
                                     <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-xs text-white mb-4">
                                         <p className="font-bold mb-1">Doctor's note</p>
                                         {profile.verificationNotes}
                                     </div>
                                 )}
                                 <button
                                     disabled={!canRequest || requestingVerification}
                                     onClick={handleRequestVerification}
                                     className="w-full py-3 bg-white text-gray-900 hover:bg-white/90 font-black text-xs uppercase tracking-widest rounded-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                                 >
                                    {requestingVerification
                                        ? "Submitting…"
                                        : status === "pending"
                                        ? "Awaiting doctor review"
                                        : status === "verified"
                                        ? "Verified"
                                        : status === "rejected"
                                        ? "Request re-review"
                                        : "Request verification"}
                                </button>
                            </div>
                        );
                    })()}
                    <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 p-8 shadow-2xl shadow-slate-900/[0.03]">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Settings</h2>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-900 font-bold text-sm">Push Notifications</p>
                                    <p className="text-gray-500 text-xs mt-0.5">Alerts for match updates</p>
                                </div>
                                <button
                                    onClick={() => setProfile({ ...profile, notifications: !profile.notifications })}
                                    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${profile.notifications ? 'bg-[#008080]' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${profile.notifications ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-900 font-bold text-sm">Two-Factor Auth</p>
                                    <p className="text-gray-500 text-xs mt-0.5">Secure your health data</p>
                                </div>
                                <button
                                    onClick={() => setProfile({ ...profile, twoFactor: !profile.twoFactor })}
                                    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${profile.twoFactor ? 'bg-[#008080]' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${profile.twoFactor ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <button className="w-full py-3 text-red-500 font-bold text-sm hover:bg-red-50 rounded-2xl transition-all">Sign Out Everywhere</button>
                        </div>
                    </div>

                    {/* Support Card */}
                    <div className="bg-gradient-to-br from-[#008080] to-[#004D40] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-teal-900/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <h3 className="text-lg font-bold mb-2 relative z-10">Need Assistance?</h3>
                        <p className="text-white/80 text-xs leading-relaxed mb-6 relative z-10">Our medical support team is available 24/7 to help with your contribution process.</p>
                        <button className="w-full py-3 bg-white text-[#004D40] font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-teal-50 transition-all relative z-10">Contact Support</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
