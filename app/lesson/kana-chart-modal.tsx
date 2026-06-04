"use client";

import { useState } from "react";
import { X, BookOpen } from "lucide-react";
import { KanaChartContent } from "./kana-chart-content";

export const KanaChartModal = ({ isFinished, courseId }: { isFinished?: boolean; courseId?: number }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Don't show on finish screen or non-Japanese courses
    const isJapaneseCourse = courseId === 43;
    
    if (isFinished || !isJapaneseCourse) return null;

    return (
        <>
            {/* Toggle Button - Fixed position */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-sky-500 hover:bg-sky-600 text-white font-bold px-4 py-3 rounded-full shadow-lg transition flex items-center gap-x-2 z-50"
            >
                <BookOpen className="h-5 w-5" />
                Kana
            </button>

            {/* Popup Modal */}
            {isOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Modal Content */}
                    <div className="fixed inset-4 lg:inset-20 bg-white rounded-2xl shadow-xl z-50 overflow-y-auto flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
                            <h2 className="font-bold text-lg">Kana Chart</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-neutral-100 rounded-lg transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        {/* Chart Content */}
                        <div className="p-4 overflow-y-auto flex-1">
                            <KanaChartContent />
                        </div>
                    </div>
                </>
            )}
        </>
    );
};