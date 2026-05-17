"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Role = "patient" | "donor" | "doctor" | "admin";

type UserRow = {
    id: string;
    fullName?: string;
    email?: string;
    role?: Role;
    contact?: string;
    bloodGroup?: string;
    address?: string;
    verified?: boolean;
    createdAt?: string;
};

const ROLE_OPTIONS: Role[] = ["patient", "donor", "doctor", "admin"];

function UsersPageInner() {
    const searchParams = useSearchParams();
    const initialRole = (searchParams.get("role") as Role | null) || "all";

    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<Role | "all">(initialRole === "all" ? "all" : (initialRole as Role));
    const [pendingAction, setPendingAction] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: "ok" | "err"; message: string } | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const snap = await getDocs(collection(db, "users"));
                if (cancelled) return;
                const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));
                setUsers(rows);
            } catch (err) {
                console.error("Load users failed:", err);
                setFeedback({ type: "err", message: "Failed to load users." });
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();
        return users
            .filter((u) => (roleFilter === "all" ? true : u.role === roleFilter))
            .filter((u) => {
                if (!term) return true;
                return (
                    (u.fullName || "").toLowerCase().includes(term) ||
                    (u.email || "").toLowerCase().includes(term) ||
                    (u.contact || "").toLowerCase().includes(term)
                );
            })
            .sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));
    }, [users, roleFilter, query]);

    const handleRoleChange = async (id: string, newRole: Role) => {
        setPendingAction(`role:${id}`);
        setFeedback(null);
        try {
            await updateDoc(doc(db, "users", id), { role: newRole });
            setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
            setFeedback({ type: "ok", message: "Role updated." });
        } catch (err) {
            console.error(err);
            setFeedback({ type: "err", message: "Failed to update role." });
        } finally {
            setPendingAction(null);
        }
    };

    const handleToggleVerified = async (id: string, next: boolean) => {
        setPendingAction(`verify:${id}`);
        setFeedback(null);
        try {
            await updateDoc(doc(db, "users", id), { verified: next });
            setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, verified: next } : u)));
            setFeedback({ type: "ok", message: next ? "User verified." : "Verification removed." });
        } catch (err) {
            console.error(err);
            setFeedback({ type: "err", message: "Failed to update verification status." });
        } finally {
            setPendingAction(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this user's Firestore profile? The auth account must be removed separately in the Firebase console.")) {
            return;
        }
        setPendingAction(`delete:${id}`);
        setFeedback(null);
        try {
            await deleteDoc(doc(db, "users", id));
            setUsers((prev) => prev.filter((u) => u.id !== id));
            setFeedback({ type: "ok", message: "User profile deleted." });
        } catch (err) {
            console.error(err);
            setFeedback({ type: "err", message: "Failed to delete user." });
        } finally {
            setPendingAction(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between gap-6 flex-wrap">
                <div>
                    <h1 className="text-3xl font-black text-[#1A1C1E] tracking-tight">User management</h1>
                    <p className="text-slate-500 mt-1">Review, promote, verify, or remove LifeSync accounts.</p>
                </div>
                <div className="text-sm text-slate-400">
                    {loading ? "Loading…" : `${filtered.length} of ${users.length} users`}
                </div>
            </div>

            {feedback && (
                <div className={`p-4 rounded-2xl text-sm font-semibold ${feedback.type === "ok" ? "bg-teal-50 text-teal-700 border border-teal-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                    {feedback.message}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-[2rem] border border-gray-50 shadow-sm p-6 flex flex-col md:flex-row gap-4">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name, email, or phone"
                    className="flex-1 bg-gray-50 border-0 rounded-xl px-5 py-3 text-sm font-medium text-[#1A1C1E] focus:ring-2 focus:ring-[#008080]/20 transition-all"
                />
                <div className="flex items-center gap-2 flex-wrap">
                    {(["all", ...ROLE_OPTIONS] as const).map((role) => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${roleFilter === role
                                ? "bg-[#008080] text-white shadow-md"
                                : "bg-gray-50 text-slate-500 hover:bg-gray-100"
                                }`}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] border border-gray-50 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#008080]"></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-24 text-center text-slate-400 text-sm font-medium">No users match your filters.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-gray-50">
                                    <th className="text-left py-4 px-6">User</th>
                                    <th className="text-left py-4 px-4">Role</th>
                                    <th className="text-left py-4 px-4">Verified</th>
                                    <th className="text-left py-4 px-4">Contact</th>
                                    <th className="text-left py-4 px-4">Blood</th>
                                    <th className="text-right py-4 px-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#008080] flex items-center justify-center font-bold">
                                                    {(user.fullName || user.email || "?").substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#1A1C1E]">{user.fullName || "Unnamed"}</p>
                                                    <p className="text-xs text-slate-400">{user.email || "—"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <select
                                                disabled={pendingAction === `role:${user.id}`}
                                                value={user.role || ""}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                                                className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 text-xs font-bold text-[#1A1C1E] focus:ring-2 focus:ring-[#008080]/20"
                                            >
                                                <option value="" disabled>—</option>
                                                {ROLE_OPTIONS.map((r) => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-4 px-4">
                                            <button
                                                disabled={pendingAction === `verify:${user.id}`}
                                                onClick={() => handleToggleVerified(user.id, !user.verified)}
                                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${user.verified
                                                    ? "bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-100"
                                                    : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                                                    }`}
                                            >
                                                {user.verified ? "Verified" : "Pending"}
                                            </button>
                                        </td>
                                        <td className="py-4 px-4 text-slate-500">{user.contact || "—"}</td>
                                        <td className="py-4 px-4 font-bold text-[#008080]">{user.bloodGroup || "—"}</td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                disabled={pendingAction === `delete:${user.id}`}
                                                onClick={() => handleDelete(user.id)}
                                                className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                                            >
                                                {pendingAction === `delete:${user.id}` ? "Deleting…" : "Delete"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminUsersPage() {
    return (
        <Suspense fallback={<div className="py-24 text-center text-slate-400">Loading…</div>}>
            <UsersPageInner />
        </Suspense>
    );
}
