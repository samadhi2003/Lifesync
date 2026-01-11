export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Placeholder for Sidebar/Header */}
            <div className="p-4 border-b bg-white shadow-sm flex justify-between items-center">
                <h1 className="font-bold text-teal-700">LifeSync Dashboard</h1>
                <div className="text-sm text-slate-500">User Profile</div>
            </div>
            <main className="p-6">
                {children}
            </main>
        </div>
    );
}
