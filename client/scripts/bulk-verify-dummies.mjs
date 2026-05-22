/**
 * Bulk-processes pending verification requests on dummy users:
 *   ~75% approved
 *   ~15% rejected (with a realistic doctor's note)
 *   ~10% left pending (so the verification UI still has work to test against)
 *
 * Targets only `seed: true` users (the ones produced by seed-dummy-users.mjs).
 * If you want to process real users too, set TARGET_SEED_ONLY = false.
 *
 * Usage (from `client/`):
 *   node --env-file=.env.local scripts/bulk-verify-dummies.mjs
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

const TARGET_SEED_ONLY = true;
const APPROVE_RATE = 0.75;
const REJECT_RATE = 0.15;
// Remaining ~10% stay pending.

const REJECT_NOTES = [
    "HLA report missing key loci — please upload a complete report and re-submit.",
    "NIC photo did not match the records on file. Re-upload a clearer scan.",
    "Medical report appears outdated (>12 months). Submit a recent assessment.",
    "Some fields contradict the supporting documents — please review your profile and request again.",
    "Lab reference number is unreadable on the uploaded report.",
];

const APPROVE_NOTES = [
    "",
    "Documents in order, HLA report cross-checked against lab reference.",
    "NIC verified in person, profile matches.",
    "",
    "All clear.",
    "",
];

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
    console.error("Missing Firebase env vars. Run from `client/` with the npm script.");
    process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function resolveStatus(user) {
    if (user.verificationStatus) return user.verificationStatus;
    return user.verified ? "verified" : "unverified";
}

async function main() {
    console.log("Loading users...");
    const snap = await getDocs(collection(db, "users"));
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const targets = all.filter((u) => {
        if (u.role !== "patient" && u.role !== "donor") return false;
        if (TARGET_SEED_ONLY && !u.seed) return false;
        return true;
    });

    console.log(`Found ${targets.length} ${TARGET_SEED_ONLY ? "seeded " : ""}patients/donors.`);

    let approved = 0;
    let rejected = 0;
    let leftPending = 0;
    let alreadyDecided = 0;
    const doctorUid = "seed_doctor_bulk_review";
    const now = new Date().toISOString();

    for (const u of targets) {
        const status = resolveStatus(u);

        // Skip ones already decided so re-running is safe.
        if (status === "verified" || status === "rejected") {
            alreadyDecided++;
            continue;
        }

        const r = Math.random();
        if (r < APPROVE_RATE) {
            await updateDoc(doc(db, "users", u.id), {
                verified: true,
                verificationStatus: "verified",
                verifiedBy: doctorUid,
                verifiedAt: now,
                verificationNotes: pick(APPROVE_NOTES),
            });
            approved++;
        } else if (r < APPROVE_RATE + REJECT_RATE) {
            await updateDoc(doc(db, "users", u.id), {
                verified: false,
                verificationStatus: "rejected",
                verifiedBy: doctorUid,
                verifiedAt: now,
                verificationNotes: pick(REJECT_NOTES),
            });
            rejected++;
        } else {
            // Leave pending — make sure the request fields look natural.
            if (!u.verificationStatus || u.verificationStatus === "unverified") {
                await updateDoc(doc(db, "users", u.id), {
                    verificationStatus: "pending",
                    verificationRequestedAt: u.verificationRequestedAt || now,
                });
            }
            leftPending++;
        }
    }

    console.log(`\nDone.`);
    console.log(`  Approved:        ${approved}`);
    console.log(`  Rejected:        ${rejected}`);
    console.log(`  Left pending:    ${leftPending}`);
    console.log(`  Already decided: ${alreadyDecided} (skipped, re-run is idempotent)`);
    process.exit(0);
}

main().catch((err) => {
    console.error("Bulk verify failed:", err);
    process.exit(1);
});
