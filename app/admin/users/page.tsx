"use client";

import { useEffect, useState } from "react";

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/analytics")
            .then(r => r.json())
            .then(data => {
                setUsers(data.users);
                setLoading(false);
            });
    }, []);

    const toggleHearts = async (userId: string, currentHearts: number) => {
        const unlimited = currentHearts < 100;
        await fetch("/api/admin/toggle-hearts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, unlimited }),
        });
        // Refresh
        setUsers(prev => prev.map(u => 
            u.userId === userId 
                ? { ...u, hearts: unlimited ? 999 : 5 }
                : u
        ));
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">User Management</h1>
            <div className="bg-white rounded-xl border-2 overflow-hidden">
                <div className="p-4 border-b">
                    <h2 className="font-bold text-lg">Users</h2>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-neutral-50">
                        <tr>
                            <th className="text-left p-3">User ID</th>
                            <th className="text-left p-3">Name</th>
                            <th className="text-left p-3">Hearts</th>
                            <th className="text-left p-3">Points</th>
                            <th className="text-left p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user: any) => (
                            <tr key={user.userId} className="border-t hover:bg-neutral-50">
                                <td className="p-3 font-mono text-xs">
                                    {user.userId.slice(0, 12)}...
                                </td>
                                <td className="p-3">{user.userName}</td>
                                <td className="p-3">
                                    <span className={user.hearts >= 100 
                                        ? "text-green-500 font-bold" 
                                        : "text-rose-500"
                                    }>
                                        {user.hearts >= 100 ? "∞" : user.hearts}
                                    </span>
                                </td>
                                <td className="p-3">{user.points}</td>
                                <td className="p-3">
                                    <button
                                        onClick={() => toggleHearts(user.userId, user.hearts)}
                                        className={`px-3 py-1 rounded text-white text-xs font-bold ${
                                            user.hearts >= 100 
                                                ? "bg-rose-500 hover:bg-rose-600" 
                                                : "bg-green-500 hover:bg-green-600"
                                        }`}
                                    >
                                        {user.hearts >= 100 ? "Disable ∞" : "Enable ∞"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}