"use client";

import VerificationList from "../VerificationList";

export default function AdminDoctorsPage() {
    return (
        <VerificationList
            role="doctor"
            title="Doctor verification"
            description="Review credentials and approve doctors before they can manage patients."
            accent="bg-gradient-to-br from-purple-500 to-purple-600"
            extraColumns={[
                { label: "Specialization", key: "specialization" },
                { label: "Hospital", key: "hospital" },
                { label: "License", key: "licenseNumber" },
            ]}
        />
    );
}
