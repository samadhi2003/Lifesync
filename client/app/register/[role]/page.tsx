"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";

const ALLOWED_ROLES = ["patient", "donor", "doctor"] as const;

export default function RegisterStep1() {
    const params = useParams();
    const router = useRouter();
    const roleRaw = (params.role as string)?.toLowerCase();
    const role = roleRaw ? roleRaw.charAt(0).toUpperCase() + roleRaw.slice(1) : "User";
    const isDoctor = roleRaw === 'doctor';
    const isAllowedRole = (ALLOWED_ROLES as readonly string[]).includes(roleRaw);

    const [step, setStep] = useState(1);

    const handleNext = () => {
        // Clear errors before validation
        setFieldErrors({});

        // Validate current step
        if (step === 1 && !validateStep1()) {
            return;
        }
        if (step === 2 && !isDoctor && !validateStep2()) {
            return;
        }

        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Common State
    const [fullName, setFullName] = useState("");
    const [contact, setContact] = useState("");

    // Patient/Donor State
    const [nic, setNic] = useState("");
    const [gender, setGender] = useState("");
    const [dob, setDob] = useState("");
    const [address, setAddress] = useState("");
    const [bloodGroup, setBloodGroup] = useState("");
    const [urgency, setUrgency] = useState("");
    const [onDialysis, setOnDialysis] = useState<boolean | null>(null);

    // Doctor State
    const [medicalLicense, setMedicalLicense] = useState("");
    const [hospitalName, setHospitalName] = useState("");

    // File Upload State
    const [hlaReportFile, setHlaReportFile] = useState<File | null>(null);
    const [medicalReportFile, setMedicalReportFile] = useState<File | null>(null);

    // Field-specific errors
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

    // Validation Functions
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string): boolean => {
        return password.length >= 6;
    };

    const validateNIC = (nic: string): boolean => {
        // Sri Lankan NIC: 9 digits + V or 12 digits
        const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
        return nicRegex.test(nic);
    };

    const validateContact = (contact: string): boolean => {
        // 10 digit phone number
        const contactRegex = /^[0-9]{10}$/;
        return contactRegex.test(contact);
    };

    const validateStep1 = (): boolean => {
        const errors: { [key: string]: string } = {};

        if (!fullName || fullName.trim().length < 3) {
            errors.fullName = "Full name must be at least 3 characters";
        }

        if (isDoctor) {
            if (!medicalLicense || medicalLicense.trim().length === 0) {
                errors.medicalLicense = "Medical license is required";
            }
            if (!hospitalName || hospitalName.trim().length === 0) {
                errors.hospitalName = "Hospital name is required";
            }
            if (!contact || !validateContact(contact)) {
                errors.contact = "Valid 10-digit contact number is required";
            }
        } else {
            if (!nic || !validateNIC(nic)) {
                errors.nic = "Valid NIC is required (9 digits + V or 12 digits)";
            }
            if (!gender) {
                errors.gender = "Please select a gender";
            }
            if (!dob) {
                errors.dob = "Date of birth is required";
            }
            if (!address || address.trim().length < 10) {
                errors.address = "Address must be at least 10 characters";
            }
            if (!contact || !validateContact(contact)) {
                errors.contact = "Valid 10-digit contact number is required";
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateStep2 = (): boolean => {
        const errors: { [key: string]: string } = {};

        if (!bloodGroup) {
            errors.bloodGroup = "Please select a blood group";
        }
        if (!urgency) {
            errors.urgency = "Please select an urgency level";
        }
        if (onDialysis === null) {
            errors.onDialysis = "Please indicate dialysis status";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateStep3 = (): boolean => {
        const errors: { [key: string]: string } = {};

        if (!email || !validateEmail(email)) {
            errors.email = "Valid email is required";
        }
        if (!password || !validatePassword(password)) {
            errors.password = "Password must be at least 6 characters";
        }
        if (password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleHlaReportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setHlaReportFile(e.target.files[0]);
        }
    };

    const handleMedicalReportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setMedicalReportFile(e.target.files[0]);
        }
    };


    const handleRegister = async () => {
        setError(null);

        // Validate final step
        if (!validateStep3()) {
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Prepare data to save
            const userData: any = {
                uid: user.uid,
                email: email,
                role: roleRaw, // 'patient', 'donor', or 'doctor'
                fullName: fullName,
                contact: contact,
                createdAt: new Date().toISOString()
            };

            if (isDoctor) {
                userData.medicalLicense = medicalLicense;
                userData.hospitalName = hospitalName;
            } else {
                userData.nic = nic;
                userData.gender = gender;
                userData.dob = dob;
                userData.address = address;
                userData.bloodGroup = bloodGroup;
                userData.urgency = urgency;
                userData.onDialysis = onDialysis;

                // Upload files if provided
                if (hlaReportFile) {
                    const hlaRef = ref(storage, `reports/${user.uid}/hla-report.pdf`);
                    await uploadBytes(hlaRef, hlaReportFile);
                    userData.hlaReportURL = await getDownloadURL(hlaRef);
                }

                if (medicalReportFile) {
                    const medicalRef = ref(storage, `reports/${user.uid}/medical-report.pdf`);
                    await uploadBytes(medicalRef, medicalReportFile);
                    userData.medicalReportURL = await getDownloadURL(medicalRef);
                }

            }

            // Save to Firestore
            await setDoc(doc(db, "users", user.uid), userData);

            // Redirect based on role
            if (roleRaw === 'donor') {
                router.push("/dashboard/donor");
            } else if (roleRaw === 'doctor') {
                router.push("/dashboard/doctor");
            } else {
                router.push("/dashboard/patient");
            }

        } catch (err: any) {
            console.error("Registration error:", err);
            setError(err.message || "Failed to register");
        } finally {
            setLoading(false);
        }
    };

    if (roleRaw && !isAllowedRole) {
        return (
            <div className="min-h-screen bg-[#E6F7F8] flex items-center justify-center p-6 font-sans">
                <div className="max-w-md w-full bg-white rounded-3xl border border-white/50 shadow-xl p-10 text-center">
                    <h1 className="text-2xl font-black text-gray-900 mb-3">Registration not available</h1>
                    <p className="text-gray-500 mb-8 text-sm">
                        Accounts for the <span className="font-bold text-[#008080]">{role}</span> role can't be self-registered. Admin accounts are created by existing administrators from the Users page.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={() => router.push("/register")} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl transition-all hover:bg-slate-200">
                            Choose a role
                        </button>
                        <button onClick={() => router.push("/login/sign-in")} className="flex-1 py-3 bg-[#008080] hover:bg-[#006967] text-white font-bold rounded-xl transition-all">
                            Sign in
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#E6F7F8] flex flex-col items-center py-12 px-4 font-sans">

            {/* Header Section */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 rounded-full bg-[#A0E0E0] flex items-center justify-center text-[#006967] mb-4">
                    {roleRaw === 'patient' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    )}
                    {(roleRaw === 'donor' || roleRaw === 'doctor') && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            {roleRaw === 'donor' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                        </svg>
                    )}
                </div>
                <h1 className="text-2xl font-bold text-[#006967] mb-1">{role} Registration</h1>
                <p className="text-gray-400 text-sm">Step {step} of {isDoctor ? '2' : '3'}</p>
            </div>

            {/* Progress Bar */}
            <div className="flex gap-3 mb-10 w-full max-w-lg justify-center">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${isDoctor ? 'w-1/2' : 'w-1/3'} ${step >= 1 ? 'bg-[#4AA3FF]' : 'bg-gray-300'}`}></div>
                <div className={`h-1.5 rounded-full transition-all duration-300 ${isDoctor ? 'w-1/2' : 'w-1/3'} ${step >= 2 ? 'bg-[#4AA3FF]' : 'bg-gray-300'}`}></div>
                {!isDoctor && <div className={`w-1/3 h-1.5 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-[#4AA3FF]' : 'bg-gray-300'}`}></div>}
            </div>

            {/* Main Form Card */}
            <div className="bg-white rounded-[1.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.08)] w-full max-w-[600px] p-8 md:p-12">
                <h2 className="text-lg font-bold text-gray-900 mb-8">
                    {isDoctor && step === 2 ? 'Account Details' : (!isDoctor && step === 2 ? 'Medical Information' : (!isDoctor && step === 3 ? 'Account Details' : (isDoctor ? 'Doctor registration' : 'Basic Information')))}
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}

                <form className="space-y-6">

                    {/* Step 1 Content (Doctor Step 1 or Others Step 1) */}
                    {step === 1 && (
                        <>
                            <div className="space-y-2">
                                <label className="block text-gray-500 text-xs font-semibold ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder={isDoctor ? "" : "Enter your full Name"}
                                    className={`w-full bg-[#F5F5F5] border rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white transition-all text-sm ${fieldErrors.fullName ? 'border-red-500' : 'border-transparent'
                                        }`}
                                />
                                {fieldErrors.fullName && (
                                    <p className="text-red-500 text-xs ml-1">{fieldErrors.fullName}</p>
                                )}
                            </div>

                            {isDoctor ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="block text-gray-500 text-xs font-semibold ml-1">Medical License Number</label>
                                        <input
                                            type="text"
                                            value={medicalLicense}
                                            onChange={(e) => setMedicalLicense(e.target.value)}
                                            className={`w-full bg-[#F5F5F5] border rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white transition-all text-sm ${fieldErrors.medicalLicense ? 'border-red-500' : 'border-transparent'
                                                }`}
                                        />
                                        {fieldErrors.medicalLicense && (
                                            <p className="text-red-500 text-xs ml-1">{fieldErrors.medicalLicense}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-gray-500 text-xs font-semibold ml-1">Hospital/ Clinic Name</label>
                                        <input
                                            type="text"
                                            value={hospitalName}
                                            onChange={(e) => setHospitalName(e.target.value)}
                                            className={`w-full bg-[#F5F5F5] border rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white transition-all text-sm ${fieldErrors.hospitalName ? 'border-red-500' : 'border-transparent'
                                                }`}
                                        />
                                        {fieldErrors.hospitalName && (
                                            <p className="text-red-500 text-xs ml-1">{fieldErrors.hospitalName}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-gray-500 text-xs font-semibold ml-1">Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-[#F5F5F5] border border-transparent rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white transition-all text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-gray-500 text-xs font-semibold ml-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={contact}
                                            onChange={(e) => setContact(e.target.value)}
                                            className={`w-full bg-[#F5F5F5] border rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white transition-all text-sm ${fieldErrors.contact ? 'border-red-500' : 'border-transparent'
                                                }`}
                                        />
                                        {fieldErrors.contact && (
                                            <p className="text-red-500 text-xs ml-1">{fieldErrors.contact}</p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Patient/Donor Step 1 Fields */}
                                    <div className="space-y-2">
                                        <label className="block text-gray-500 text-xs font-semibold ml-1">NIC</label>
                                        <input
                                            type="text"
                                            value={nic}
                                            onChange={(e) => setNic(e.target.value)}
                                            placeholder="Enter your NIC number"
                                            className={`w-full bg-[#F5F5F5] border rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white transition-all text-sm ${fieldErrors.nic ? 'border-red-500' : 'border-transparent'
                                                }`}
                                        />
                                        {fieldErrors.nic && (
                                            <p className="text-red-500 text-xs ml-1">{fieldErrors.nic}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-gray-500 text-xs font-semibold ml-1">Gender</label>
                                        <div className="relative">
                                            <select value={gender} onChange={(e) => setGender(e.target.value)} className={`w-full bg-[#F5F5F5] border rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white appearance-none transition-all cursor-pointer text-sm ${fieldErrors.gender ? 'border-red-500' : 'border-transparent'
                                                }`}>
                                                <option value="" disabled>Select gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                        {fieldErrors.gender && (
                                            <p className="text-red-500 text-xs ml-1">{fieldErrors.gender}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-gray-500 text-xs font-semibold ml-1">Date of Birth</label>
                                        <input
                                            type="text"
                                            value={dob}
                                            onChange={(e) => setDob(e.target.value)}
                                            placeholder="dd/mm/yy"
                                            onFocus={(e) => e.target.type = 'date'}
                                            onBlur={(e) => e.target.type = 'text'}
                                            className={`w-full bg-[#F5F5F5] border rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white transition-all text-sm ${fieldErrors.dob ? 'border-red-500' : 'border-transparent'
                                                }`}
                                        />
                                        {fieldErrors.dob && (
                                            <p className="text-red-500 text-xs ml-1">{fieldErrors.dob}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-gray-500 text-xs font-semibold ml-1">Adreess</label>
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="Enter your Adreess"
                                            className={`w-full bg-[#F5F5F5] border rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white transition-all text-sm ${fieldErrors.address ? 'border-red-500' : 'border-transparent'
                                                }`}
                                        />
                                        {fieldErrors.address && (
                                            <p className="text-red-500 text-xs ml-1">{fieldErrors.address}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-gray-500 text-xs font-semibold ml-1">Contact Number</label>
                                        <input
                                            type="tel"
                                            value={contact}
                                            onChange={(e) => setContact(e.target.value)}
                                            placeholder="Enter your Contact number"
                                            className={`w-full bg-[#F5F5F5] border rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white transition-all text-sm ${fieldErrors.contact ? 'border-red-500' : 'border-transparent'
                                                }`}
                                        />
                                        {fieldErrors.contact && (
                                            <p className="text-red-500 text-xs ml-1">{fieldErrors.contact}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-gray-500 text-xs font-semibold ml-1">Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your Email"
                                            className="w-full bg-[#F5F5F5] border border-transparent rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white transition-all text-sm"
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {/* Step 2 Content (Patient/Donor Medical Info) */}
                    {!isDoctor && step === 2 && (
                        <>
                            <div className="space-y-2">
                                <label className="block text-gray-500 text-xs font-semibold ml-1">Blood Group</label>
                                <div className="relative">
                                    <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className={`w-full bg-[#F5F5F5] border rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white appearance-none transition-all cursor-pointer text-sm ${fieldErrors.bloodGroup ? 'border-red-500' : 'border-transparent'
                                        }`}>
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
                                {fieldErrors.bloodGroup && (
                                    <p className="text-red-500 text-xs ml-1">{fieldErrors.bloodGroup}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-gray-500 text-xs font-semibold ml-1">On Dialysis?</label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setOnDialysis(true)}
                                        className={`flex-1 py-3.5 rounded-lg border transition-all text-sm font-semibold ${onDialysis === true
                                            ? "bg-[#4AA3FF] text-white border-[#4AA3FF]"
                                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setOnDialysis(false)}
                                        className={`flex-1 py-3.5 rounded-lg border transition-all text-sm font-semibold ${onDialysis === false
                                            ? "bg-[#4AA3FF] text-white border-[#4AA3FF]"
                                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        No
                                    </button>
                                </div>
                                {fieldErrors.onDialysis && (
                                    <p className="text-red-500 text-xs ml-1">{fieldErrors.onDialysis}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-gray-500 text-xs font-semibold ml-1">Urgency Level</label>
                                <div className="relative">
                                    <select value={urgency} onChange={(e) => setUrgency(e.target.value)} className={`w-full bg-[#F5F5F5] border rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white appearance-none transition-all cursor-pointer text-sm ${fieldErrors.urgency ? 'border-red-500' : 'border-transparent'
                                        }`}>
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
                                {fieldErrors.urgency && (
                                    <p className="text-red-500 text-xs ml-1">{fieldErrors.urgency}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-gray-500 text-xs font-semibold ml-1">HLA Report Upload</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#008080] transition-colors bg-white relative">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleHlaReportChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    {hlaReportFile ? (
                                        <p className="text-[#008080] text-xs font-semibold">{hlaReportFile.name}</p>
                                    ) : (
                                        <>
                                            <p className="text-gray-400 text-xs">Click to upload or drag and drop</p>
                                            <p className="text-gray-300 text-[10px] mt-1">PDF only</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-gray-500 text-xs font-semibold ml-1">Medical Report Upload</label>
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

                        </>
                    )}

                    {/* Step 2 (Doctor) or Step 3 (Patient/Donor) Content - Account Details */}
                    {((isDoctor && step === 2) || (!isDoctor && step === 3)) && (
                        <>
                            <div className="space-y-2">
                                <label className="block text-gray-500 text-xs font-semibold ml-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your Email"
                                    className={`w-full bg-[#F5F5F5] border rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white transition-all text-sm ${fieldErrors.email ? 'border-red-500' : 'border-transparent'
                                        }`}
                                />
                                {fieldErrors.email && (
                                    <p className="text-red-500 text-xs ml-1">{fieldErrors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-gray-500 text-xs font-semibold ml-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your Password"
                                    className={`w-full bg-[#F5F5F5] border rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white transition-all text-sm ${fieldErrors.password ? 'border-red-500' : 'border-transparent'
                                        }`}
                                />
                                {fieldErrors.password && (
                                    <p className="text-red-500 text-xs ml-1">{fieldErrors.password}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-gray-500 text-xs font-semibold ml-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your Password"
                                    className={`w-full bg-[#F5F5F5] border rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white transition-all text-sm ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-transparent'
                                        }`}
                                />
                                {fieldErrors.confirmPassword && (
                                    <p className="text-red-500 text-xs ml-1">{fieldErrors.confirmPassword}</p>
                                )}
                            </div>
                        </>
                    )}

                    <div className={`pt-6 ${step > 1 ? 'flex gap-4' : ''}`}>



                        <button
                            type="button"
                            onClick={() => {
                                if (step < (isDoctor ? 2 : 3)) {
                                    handleNext();
                                } else {
                                    handleRegister();
                                }
                            }}
                            disabled={loading}
                            className={`${step > 1 ? 'w-full' : 'w-full'} bg-[#0E7A75] text-white font-bold py-4 rounded-lg hover:bg-[#0B635F] transition-colors shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Registering...' : (step === (isDoctor ? 2 : 3) ? 'Register' : 'Next')}
                        </button>
                    </div>

                    <div className="text-center text-xs text-gray-500 mt-4">
                        Already have an account? <Link href="/login/sign-in" className="text-[#0E7A75] font-bold hover:underline">Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
