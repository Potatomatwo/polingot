"use client";

import { useEffect, useState } from "react";

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<string>("all");

    useEffect(() => {
        fetch("/api/analytics")
            .then(r => {
                if (!r.ok) throw new Error("Failed to fetch analytics");
                return r.json();
            })
            .then(setData)
            .catch(e => setError(e.message));
    }, []);

    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
    if (!data) return <div className="p-8">Loading...</div>;

    const filteredCompletions = selectedUser === "all"
        ? data.completions
        : data.completions.filter((c: any) => c.userId === selectedUser);

    const avgTime = filteredCompletions.length
        ? Math.round(filteredCompletions.reduce((a: number, c: any) => a + c.timeSeconds, 0) / filteredCompletions.length)
        : 0;

    const avgMistakes = filteredCompletions.length
        ? (filteredCompletions.reduce((a: number, c: any) => a + c.mistakeCount, 0) / filteredCompletions.length).toFixed(1)
        : 0;

    // Get unique users from completions
    const uniqueUsers = Array.from(new Set(data.completions.map((c: any) => c.userId))) as string[];

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

            {/* User Filter */}
            <div className="mb-6 flex items-center gap-x-4">
                <label className="font-semibold text-neutral-700">Filter by User:</label>
                <select
                    value={selectedUser}
                    onChange={e => setSelectedUser(e.target.value)}
                    className="border-2 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-400"
                >
                    <option value="all">All Users</option>
                    {uniqueUsers.map(userId => {
                        const user = data.users.find((u: any) => u.userId === userId);
                        return (
                            <option key={userId} value={userId}>
                                {user?.userName || userId.slice(0, 12)}
                            </option>
                        );
                    })}
                </select>
                {selectedUser !== "all" && (
                    <button
                        onClick={() => setSelectedUser("all")}
                        className="text-sm text-rose-500 hover:underline"
                    >
                        Clear filter
                    </button>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl border-2 p-4">
                    <p className="text-sm text-neutral-500">Completions</p>
                    <p className="text-3xl font-bold">{filteredCompletions.length}</p>
                </div>
                <div className="bg-white rounded-xl border-2 p-4">
                    <p className="text-sm text-neutral-500">Avg Time</p>
                    <p className="text-3xl font-bold">{avgTime}s</p>
                </div>
                <div className="bg-white rounded-xl border-2 p-4">
                    <p className="text-sm text-neutral-500">Avg Mistakes</p>
                    <p className="text-3xl font-bold">{avgMistakes}</p>
                </div>
                <div className="bg-white rounded-xl border-2 p-4">
                    <p className="text-sm text-neutral-500">Total Users</p>
                    <p className="text-3xl font-bold">{data.users.length}</p>
                </div>
            </div>

            {/* Recent Completions Table */}
            <div className="bg-white rounded-xl border-2 overflow-hidden mb-8">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-bold text-lg">Lesson Completions</h2>
                    <span className="text-sm text-neutral-400">
                        {filteredCompletions.length} records
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-neutral-50">
                            <tr>
                                <th className="text-left p-3">User</th>
                                <th className="text-left p-3">Lesson</th>
                                <th className="text-left p-3">Time</th>
                                <th className="text-left p-3">Mistakes</th>
                                <th className="text-left p-3">Hearts</th>
                                <th className="text-left p-3">XP</th>
                                <th className="text-left p-3">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCompletions.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-4 text-center text-neutral-400">
                                        No completions yet.
                                    </td>
                                </tr>
                            )}
                            {filteredCompletions.map((c: any) => {
                                const user = data.users.find((u: any) => u.userId === c.userId);
                                return (
                                    <tr key={c.id} className="border-t hover:bg-neutral-50">
                                        <td className="p-3">
                                            {user?.userName || c.userId.slice(0, 12) + "..."}
                                        </td>
                                        <td className="p-3">{c.lesson?.title || `Lesson ${c.lessonId}`}</td>
                                        <td className="p-3">{c.timeSeconds}s</td>
                                        <td className="p-3">
                                            <span className={c.mistakeCount > 3 ? "text-red-500" : "text-green-500"}>
                                                {c.mistakeCount}
                                            </span>
                                        </td>
                                        <td className="p-3">{c.heartsAtStart} → {c.heartsAtEnd}</td>
                                        <td className="p-3">+{c.xpEarned}</td>
                                        <td className="p-3 text-neutral-400">
                                            {new Date(c.completedAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Hardest Questions */}
            {data.hardestChallenges && data.hardestChallenges.length > 0 && (
                <div className="bg-white rounded-xl border-2 overflow-hidden">
                    <div className="p-4 border-b">
                        <h2 className="font-bold text-lg">Hardest Questions</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="text-left p-3">Question</th>
                                    <th className="text-left p-3">Type</th>
                                    <th className="text-left p-3">Wrong</th>
                                    <th className="text-left p-3">Correct</th>
                                    <th className="text-left p-3">Success Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.hardestChallenges.map((c: any) => (
                                    <tr key={c.challengeId} className="border-t hover:bg-neutral-50">
                                        <td className="p-3">{c.question}</td>
                                        <td className="p-3">{c.type}</td>
                                        <td className="p-3 text-red-500">{c.wrongCount}</td>
                                        <td className="p-3 text-green-500">{c.correctCount}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-neutral-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 rounded-full"
                                                        style={{ width: `${c.successRate}%` }}
                                                    />
                                                </div>
                                                <span>{c.successRate}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}