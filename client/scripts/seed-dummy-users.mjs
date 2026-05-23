/**
 * Seeds 50 dummy patients and 30 dummy donors with Sri Lankan-realistic data
 * directly into the `users` collection in Firestore.
 *
 * Usage (from the repo root):
 *   cd client
 *   node --env-file=.env.local scripts/seed-dummy-users.mjs
 *
 * The script does NOT create Firebase Auth accounts — these dummies cannot log in.
 * They exist purely as Firestore docs so the matching, listing, and dashboard
 * UIs have something to render. All dummies are stamped `seed: true` so you can
 * find/delete them later with a query filter.
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
    console.error("Missing Firebase env vars. Run from `client/` with `node --env-file=.env.local scripts/seed-dummy-users.mjs`.");
    process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* -------------------------------------------------------------------------- */
/* Sri Lankan name pools                                                      */
/* -------------------------------------------------------------------------- */

const SINHALESE_M = ["Kasun", "Sampath", "Roshan", "Nuwan", "Lahiru", "Dinesh", "Pradeep", "Chathura", "Tharindu", "Sanjeewa", "Buddhika", "Madhawa", "Asela", "Charith", "Suresh", "Janaka", "Ruwan", "Chaminda", "Damith", "Hasitha"];
const SINHALESE_F = ["Nadeesha", "Priyanka", "Dilini", "Ishara", "Tharushi", "Sandya", "Chamodi", "Hashini", "Sachini", "Imashi", "Thilini", "Anjali", "Pavani", "Chandima", "Nilakshi", "Madhavi", "Ruwani", "Nayomi"];
const SINHALESE_SURNAMES = ["Perera", "Silva", "Fernando", "De Silva", "Wickramasinghe", "Jayasinghe", "Bandara", "Rajapakse", "Senanayake", "Wijesinghe", "Gunawardena", "Amarasinghe", "Karunaratne", "Mendis", "Dissanayake", "Wijeratne", "Liyanage", "Ranasinghe", "Kumara", "Pathirana"];

const TAMIL_M = ["Arjun", "Senthil", "Mohanraj", "Karthik", "Dhanasekaran", "Mahendran", "Sivakumar", "Ravikumar", "Vimal", "Nirmal", "Rajan", "Anand", "Prasad", "Vijay", "Selvam"];
const TAMIL_F = ["Priya", "Lakshmi", "Anitha", "Kavitha", "Nirmala", "Sangeetha", "Selvi", "Chandra", "Vasuki", "Geetha", "Mala", "Rani", "Gowri", "Saraswathi"];
const TAMIL_SURNAMES = ["Krishnan", "Subramaniam", "Rajendran", "Kandasamy", "Shanmugam", "Murugan", "Thavarajah", "Selvarajah", "Balasingham", "Mahalingam", "Pillai", "Sivakumar", "Nadaraja", "Ratnam"];

const MUSLIM_M = ["Mohamed", "Ahmed", "Fazil", "Rizwan", "Ifthikar", "Riyaz", "Imthiaz", "Rifkhan", "Saheed", "Nazeer", "Faizal", "Asif"];
const MUSLIM_F = ["Fathima", "Aisha", "Nazeeha", "Razeena", "Shafna", "Afra", "Sumaiya", "Rifka", "Hidaya"];
const MUSLIM_SURNAMES = ["Mohamed", "Ismail", "Sheriff", "Hussain", "Shareef", "Marikar", "Razik", "Cassim"];

const CITIES = [
    { city: "Colombo", weight: 22 },
    { city: "Kandy", weight: 10 },
    { city: "Galle", weight: 7 },
    { city: "Negombo", weight: 6 },
    { city: "Jaffna", weight: 6 },
    { city: "Matara", weight: 5 },
    { city: "Kurunegala", weight: 5 },
    { city: "Ratnapura", weight: 4 },
    { city: "Anuradhapura", weight: 4 },
    { city: "Trincomalee", weight: 4 },
    { city: "Batticaloa", weight: 4 },
    { city: "Badulla", weight: 3 },
    { city: "Hambantota", weight: 3 },
    { city: "Nuwara Eliya", weight: 3 },
    { city: "Kalutara", weight: 3 },
    { city: "Gampaha", weight: 5 },
    { city: "Polonnaruwa", weight: 2 },
    { city: "Vavuniya", weight: 2 },
    { city: "Puttalam", weight: 2 },
];

const STREETS = ["Galle Road", "Kandy Road", "Hospital Road", "Main Street", "Temple Road", "School Lane", "Lake Road", "Park Avenue", "Station Road", "Colombo Road", "Beach Road", "High Level Road"];

/* -------------------------------------------------------------------------- */
/* Random helpers                                                             */
/* -------------------------------------------------------------------------- */

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => {
    const copy = [...arr];
    const out = [];
    for (let i = 0; i < n && copy.length; i++) {
        out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
    }
    return out;
};
const weightedPick = (entries, key = "weight") => {
    const total = entries.reduce((s, e) => s + e[key], 0);
    let r = Math.random() * total;
    for (const e of entries) {
        r -= e[key];
        if (r <= 0) return e;
    }
    return entries[entries.length - 1];
};
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pad = (n, len = 2) => String(n).padStart(len, "0");

/* -------------------------------------------------------------------------- */
/* Person generators                                                          */
/* -------------------------------------------------------------------------- */

function generateName() {
    const community = weightedPick([
        { v: "sinhalese", weight: 70 },
        { v: "tamil", weight: 20 },
        { v: "muslim", weight: 10 },
    ]).v;
    const gender = Math.random() < 0.55 ? "Male" : "Female";

    let first, surname;
    if (community === "sinhalese") {
        first = pick(gender === "Male" ? SINHALESE_M : SINHALESE_F);
        surname = pick(SINHALESE_SURNAMES);
    } else if (community === "tamil") {
        first = pick(gender === "Male" ? TAMIL_M : TAMIL_F);
        surname = pick(TAMIL_SURNAMES);
    } else {
        first = pick(gender === "Male" ? MUSLIM_M : MUSLIM_F);
        surname = pick(MUSLIM_SURNAMES);
    }
    return { fullName: `${first} ${surname}`, firstName: first, surname, gender };
}

function generateDob(role) {
    // Patients skew older (kidney disease prevalence increases with age).
    // Donors must be 18–65 to be eligible.
    const year = role === "donor" ? randInt(1960, 2006) : randInt(1955, 2005);
    const month = randInt(1, 12);
    const day = randInt(1, 28);
    return `${year}-${pad(month)}-${pad(day)}`;
}

function generateNIC(dob) {
    // Modern Sri Lankan NIC: 12 digits = YYYY + DDD + SSSS + C
    // (year + day-of-year offset by gender + serial + checksum). We do not
    // produce a valid checksum — we just ensure the format passes the
    // existing regex /^[0-9]{12}$/.
    const [yearStr, monthStr, dayStr] = dob.split("-");
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const day = parseInt(dayStr);
    const dayOfYear = Math.floor((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 0)) / 86400000);
    const dayCode = dayOfYear + (Math.random() < 0.5 ? 500 : 0); // female adds 500
    const serial = randInt(0, 9999);
    const checksum = randInt(0, 9);
    return `${year}${pad(dayCode, 3)}${pad(serial, 4)}${checksum}`;
}

function generatePhone() {
    // 10-digit mobile starting 07X
    const prefixes = ["071", "072", "074", "075", "076", "077", "078"];
    return pick(prefixes) + String(randInt(1000000, 9999999));
}

function generateAddress() {
    const { city } = weightedPick(CITIES);
    const number = randInt(1, 450);
    const street = pick(STREETS);
    return `${number}, ${street}, ${city}`;
}

function generateEmail(first, surname) {
    const norm = (s) => s.toLowerCase().replace(/[^a-z]/g, "");
    const tag = randInt(10, 9999);
    return `${norm(first)}.${norm(surname)}${tag}@dummy.lifesync.test`;
}

function generateBloodGroup() {
    // Approximate Sri Lankan distribution
    return weightedPick([
        { v: "O+", weight: 37 },
        { v: "A+", weight: 24 },
        { v: "B+", weight: 30 },
        { v: "AB+", weight: 5 },
        { v: "O-", weight: 1.5 },
        { v: "A-", weight: 1 },
        { v: "B-", weight: 1.2 },
        { v: "AB-", weight: 0.3 },
    ]).v;
}

function generateUrgency(role) {
    if (role === "donor") {
        // Urgency doesn't really apply — pick a low-weight value or omit.
        return "Low";
    }
    return weightedPick([
        { v: "Low", weight: 15 },
        { v: "Medium", weight: 35 },
        { v: "High", weight: 35 },
        { v: "Critical", weight: 15 },
    ]).v;
}

/* -------------------------------------------------------------------------- */
/* HLA typing — realistic South Asian allele pools                            */
/* -------------------------------------------------------------------------- */

const HLA_POOL = {
    A: ["01", "02", "03", "11", "23", "24", "26", "29", "30", "31", "32", "33", "68"],
    B: ["07", "08", "15", "27", "35", "37", "40", "44", "51", "52", "55", "57", "58"],
    C: ["01", "02", "03", "04", "06", "07", "08", "12", "15"],
    DRB1: ["01", "03", "04", "07", "08", "11", "13", "14", "15"],
    DRB345: ["DRB3*01", "DRB3*02", "DRB4*01", "DRB4*01(N)", "DRB5*01", "DRB5*02"],
    DQA1: ["01", "02", "03", "05"],
    DQB1: ["02", "03", "04", "05", "06"],
    DPA1: ["01", "02"],
    DPB1: ["02", "03", "04", "05"],
};

function generateHla() {
    const typing = {};
    for (const [locus, alleles] of Object.entries(HLA_POOL)) {
        // Most loci typed; minor loci sometimes missing to be realistic
        const dropChance = ["DRB345", "DPA1", "DPB1"].includes(locus) ? 0.25 : 0.02;
        if (Math.random() < dropChance) continue;
        const [a, b] = pickN(alleles, 2);
        typing[locus] = [a, b ?? a]; // homozygous if pool exhausted
    }
    return typing;
}

/* -------------------------------------------------------------------------- */
/* Build a single user document                                               */
/* -------------------------------------------------------------------------- */

function buildUser(role, index) {
    const name = generateName();
    const dob = generateDob(role);
    const nic = generateNIC(dob);
    const phone = generatePhone();
    const address = generateAddress();
    const email = generateEmail(name.firstName, name.surname);
    const bloodGroup = generateBloodGroup();
    const urgency = generateUrgency(role);

    // ~85% have HLA typing on file
    const hasHla = Math.random() < 0.85;
    const uid = `seed_${role}_${pad(index, 3)}_${Date.now().toString(36)}`;

    const doc = {
        uid,
        role,
        fullName: name.fullName,
        gender: name.gender,
        nic,
        dob,
        contact: phone,
        email,
        address,
        bloodGroup,
        urgency,
        verified: true,
        verificationStatus: "verified",
        verificationRequestedAt: new Date(Date.now() - randInt(1, 90) * 86400000).toISOString(),
        verifiedAt: new Date(Date.now() - randInt(0, 60) * 86400000).toISOString(),
        createdAt: new Date(Date.now() - randInt(0, 120) * 86400000).toISOString(),
        seed: true, // marker so you can clean these up later
    };

    if (role === "patient") {
        doc.onDialysis = Math.random() < 0.45;
        doc.condition = pick(["End-stage renal disease", "Chronic kidney disease stage 5", "Diabetic nephropathy", "Polycystic kidney disease", "Glomerulonephritis"]);
    }

    if (hasHla) {
        const typing = generateHla();
        doc.hla = {
            ...typing,
            enteredBy: uid,
            enteredByRole: role,
            enteredAt: new Date().toISOString(),
        };
    }

    return doc;
}

/* -------------------------------------------------------------------------- */
/* Run                                                                        */
/* -------------------------------------------------------------------------- */

async function main() {
    const PATIENT_COUNT = 50;
    const DONOR_COUNT = 30;

    console.log(`Seeding ${PATIENT_COUNT} patients and ${DONOR_COUNT} donors...`);

    const users = [];
    for (let i = 0; i < PATIENT_COUNT; i++) users.push(buildUser("patient", i + 1));
    for (let i = 0; i < DONOR_COUNT; i++) users.push(buildUser("donor", i + 1));

    let written = 0;
    for (const u of users) {
        await setDoc(doc(db, "users", u.uid), u);
        written++;
        if (written % 10 === 0) console.log(`  wrote ${written}/${users.length}`);
    }

    console.log(`\nDone. ${PATIENT_COUNT} patients + ${DONOR_COUNT} donors written.`);
    console.log("All seeded docs are tagged with { seed: true } for easy cleanup.");
    console.log("To remove: query users where seed == true and delete.");
    process.exit(0);
}

main().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
