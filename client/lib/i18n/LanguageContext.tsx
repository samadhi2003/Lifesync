"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { translations, LanguageCode } from "./translations";

type TranslationObject = { [key: string]: string | TranslationObject };

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getInitialLanguage(): LanguageCode {
    if (typeof window === "undefined") return "en";
    const stored = localStorage.getItem("lifesync_lang") as LanguageCode;
    return stored && ["en", "si", "ta"].includes(stored) ? stored : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<LanguageCode>(getInitialLanguage);

    useEffect(() => {
        // Sync when language changes externally (e.g. multiple tabs)
        const handler = () => setLanguage(getInitialLanguage());
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, []);

    const handleSetLanguage = (lang: LanguageCode) => {
        setLanguage(lang);
        localStorage.setItem("lifesync_lang", lang);
    };

    const t = (key: string): string => {
        const keys = key.split(".");
        let current: string | TranslationObject = translations[language] as TranslationObject;
        for (const k of keys) {
            if (current && typeof current === "object" && k in current) {
                current = current[k];
            } else {
                return key; // Fallback to key if not found
            }
        }
        return typeof current === "string" ? current : key;
    };

    // To prevent hydration mismatch, you could return null if !mounted,
    // but returning children with default 'en' is usually fine if we don't strict-render different HTML.
    // We'll just render it.

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
