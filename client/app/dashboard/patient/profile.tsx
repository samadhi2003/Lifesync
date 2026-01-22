"use client";

import { useState } from "react";

export default function PatientProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: "Samadhi Uluwaduge",
        email: "samadhi.u@lifesync.lk",
        phone: "+94 77 123 4567",
        address: "123 Hope Lane, Colombo 07, Sri Lanka",
        bloodGroup: "O+",
        condition: "Chronic Kidney Disease (Stage 4)",
        urgency: "High",
        notifications: true,
        twoFactor: false
    });

    const handleSave = () => {
        setIsEditing(false);
        // In a real app, you'd call an API here
    };

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
                            <div className="w-full h-full rounded-[1.8rem] bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-4xl font-black border border-white/30">
                                SU
                            </div>
                        </div>
                        {isEditing && (
                            <button className="absolute -bottom-2 -right-2 bg-white text-[#008080] p-2 rounded-xl shadow-lg border border-teal-50 hover:bg-teal-50 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">{profile.name}</h1>
                        <div className="flex flex-wrap gap-3">
                            <span className="px-4 py-1.5 bg-teal-50 text-[#008080] text-xs font-bold rounded-full border border-teal-100 uppercase tracking-widest shadow-sm">Patient</span>
                            <span className="px-4 py-1.5 bg-orange-50 text-orange-600 text-xs font-bold rounded-full border border-orange-100 uppercase tracking-widest shadow-sm">Urgency: {profile.urgency}</span>
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
                            <h2 className="text-xl font-bold text-gray-900 capitalize">Medical Profile</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[#008080]/5 rounded-2xl p-4 border border-[#008080]/10">
                                <span className="text-[10px] font-bold text-[#008080]/60 uppercase tracking-widest block mb-1">Blood Type</span>
                                <p className="text-gray-900 text-xl font-black">{profile.bloodGroup}</p>
                            </div>
                            <div className="bg-orange-500/5 rounded-2xl p-4 border border-orange-500/10 md:col-span-2">
                                <span className="text-[10px] font-bold text-orange-600/60 uppercase tracking-widest block mb-1">Current Condition</span>
                                <p className="text-gray-900 text-xl font-black">{profile.condition}</p>
                            </div>
                            <div className="md:col-span-3">
                                <div className="p-5 bg-gradient-to-r from-teal-500/10 to-transparent rounded-[1.5rem] border border-teal-500/10 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#008080] shadow-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-gray-900 font-bold">Medical Documentation</h4>
                                            <p className="text-gray-500 text-xs">Verified by LifeSync Medical Board</p>
                                        </div>
                                    </div>
                                    <button className="text-[#008080] font-black text-xs uppercase tracking-tighter hover:underline underline-offset-4">View Records</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings & Security */}
                <div className="space-y-8">
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
                                    <p className="text-gray-500 text-xs mt-0.5">Secure your medical data</p>
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
                        <p className="text-white/80 text-xs leading-relaxed mb-6 relative z-10">Our medical support team is available 24/7 to help with your matching process.</p>
                        <button className="w-full py-3 bg-white text-[#004D40] font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-teal-50 transition-all relative z-10">Contact Support</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
