"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { translations, LanguageCode } from "./translations";

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<LanguageCode>("en");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedLang = localStorage.getItem("lifesync_lang") as LanguageCode;
        if (storedLang && ["en", "si", "ta"].includes(storedLang)) {
            setLanguage(storedLang);
        }
    }, []);

    const handleSetLanguage = (lang: LanguageCode) => {
        setLanguage(lang);
        localStorage.setItem("lifesync_lang", lang);
    };

    const t = (key: string): string => {
        const keys = key.split(".");
        let current: any = translations[language];
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
