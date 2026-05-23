"use client";

import VerificationList from "../VerificationList";

export default function AdminDonorsPage() {
    return (
        <VerificationList
            role="donor"
            title="Donor approval"
            description="Verify donor profiles and HLA documentation before they surface to patients."
            accent="bg-gradient-to-br from-blue-500 to-blue-600"
            extraColumns={[
                { label: "Blood", key: "bloodGroup" },
            ]}
        />
    );
}
