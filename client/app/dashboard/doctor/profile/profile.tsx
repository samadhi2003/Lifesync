"use client";

import { useState } from "react";

export default function DoctorProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: "Dr. Samadhi Uluwaduge",
        email: "samadhi.dr@lifesync.lk",
        phone: "+94 77 987 6543",
        specialization: "Nephrologist",
        licenseNumber: "SLMC-54321",
        hospital: "Colombo General Hospital",
        notifications: true,
        twoFactor: true
    });

    const handleSave = () => {
        setIsEditing(false);
    };

    return (
        <div className="font-sans min-h-screen relative pb-20">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-gradient-to-br from-[#48D597] to-[#2E807D] p-1 shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                            <div className="w-full h-full rounded-[1.8rem] bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-4xl font-black border border-white/30">
                                SU
                            </div>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">{profile.name}</h1>
                        <div className="flex flex-wrap gap-3">
                            <span className="px-4 py-1.5 bg-teal-50 text-[#008080] text-xs font-bold rounded-full border border-teal-100 uppercase tracking-widest shadow-sm font-sans">Medical Professional</span>
                            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100 uppercase tracking-widest shadow-sm font-sans">{profile.specialization}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} className="px-6 py-3 bg-white text-gray-400 font-bold rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all">Cancel</button>
                            <button onClick={handleSave} className="px-8 py-3 bg-[#008080] text-white font-bold rounded-2xl shadow-xl shadow-teal-900/10 hover:bg-[#006967] hover:shadow-teal-900/20 active:scale-95 transition-all">Save Profile</button>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                <div className="lg:col-span-2 space-y-8">
                    {/* Professional Info */}
                    <div className="bg-white/70 backdrop-blur-2xl rounded-[1.5rem] border border-white/50 p-10 shadow-xl">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#008080]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Professional Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">License Number</label>
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    className="w-full bg-gray-50/50 border border-gray-50 rounded-2xl px-5 py-4 text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:bg-white transition-all disabled:text-gray-400"
                                    value={profile.licenseNumber}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Affiliated Hospital</label>
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    className="w-full bg-gray-50/50 border border-gray-50 rounded-2xl px-5 py-4 text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:bg-white transition-all"
                                    value={profile.hospital}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    disabled={!isEditing}
                                    className="w-full bg-gray-50/50 border border-gray-50 rounded-2xl px-5 py-4 text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:bg-white transition-all"
                                    value={profile.email}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    className="w-full bg-gray-50/50 border border-gray-50 rounded-2xl px-5 py-4 text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:bg-white transition-all"
                                    value={profile.phone}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stats or Achievements */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-teal-500 rounded-[1rem] p-8 text-white shadow-xl">
                            <h4 className="text-3xl font-black mb-1">128</h4>
                            <p className="text-teal-100 text-xs font-bold uppercase tracking-widest">Successful Matches</p>
                        </div>
                        <div className="bg-white rounded-[1rem] p-8 border border-gray-100 shadow-xl">
                            <h4 className="text-3xl font-black text-gray-900 mb-1">42</h4>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Active Patients</p>
                        </div>
                        <div className="bg-white rounded-[1rem] p-8 border border-gray-100 shadow-xl">
                            <h4 className="text-3xl font-black text-gray-900 mb-1">15</h4>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Years Exp.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white/70 backdrop-blur-2xl rounded-[1.5rem] border border-white/50 p-10 shadow-xl">
                        <h2 className="text-xl font-bold text-gray-900 mb-8">Security & Alerts</h2>
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-900 font-bold text-sm">Critical Patient Alerts</p>
                                    <p className="text-gray-500 text-xs mt-0.5 font-medium">Instant SMS notifications</p>
                                </div>
                                <button className={`w-12 h-6 rounded-full transition-all duration-300 relative ${profile.notifications ? 'bg-[#008080]' : 'bg-gray-200'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${profile.notifications ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-900 font-bold text-sm">Two-Factor Auth</p>
                                    <p className="text-gray-500 text-xs mt-0.5 font-medium">Protect medical records</p>
                                </div>
                                <button className={`w-12 h-6 rounded-full transition-all duration-300 relative ${profile.twoFactor ? 'bg-[#008080]' : 'bg-gray-200'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${profile.twoFactor ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#111827] to-[#1f2937] rounded-[1.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/5 rounded-full blur-2xl font-sans"></div>
                        <h3 className="text-lg font-bold mb-2">Need Technical Help?</h3>
                        <p className="text-gray-400 text-xs leading-relaxed mb-6 font-medium">Contact the LifeSync IT Department for system inquiries and issues.</p>
                        <button className="w-full py-4 bg-white text-gray-900 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all font-sans">Support Portal</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
