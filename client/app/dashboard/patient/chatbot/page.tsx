"use client";

import { useState } from "react";

export default function ChatbotPage() {
    const [message, setMessage] = useState("");

    return (
        <div className="font-sans min-h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-[#008080] text-3xl font-bold mb-1">All Medical Assistant</h1>
                <p className="text-gray-400 font-medium">Get answers to your medical questions</p>
            </div>

            {/* Chat Container */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col relative mb-4">

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto mb-6 space-y-6">
                    {/* AI Message */}
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#E0F2F1] flex items-center justify-center text-[#008080] shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <div className="bg-[#F5F5F5] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-4 max-w-xl text-gray-700">
                            <p className="mb-2">Hello! I'm your AI Medical Assistant. How can I help you today?</p>
                            <p className="text-xs text-gray-400">07:17 PM</p>
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="mt-auto">
                    <div className="relative">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here....."
                            className="w-full bg-[#EEEEEE] text-gray-700 rounded-lg px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#008080] hover:bg-[#006967] text-white p-2.5 rounded-lg transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Disclaimer Footer */}
            <div className="bg-[#B2DFDB]/30 rounded-lg p-6 text-center text-[#546E7A] text-sm font-medium">
                <span className="font-bold text-gray-700">Note:</span> This AI assistant provides general information only. Always consult with your healthcare provider for medical advice
            </div>
        </div>
    );
}
