"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

export type Currency = {
    code: string
    symbol: string
    name: string
}

export const CURRENCIES: Currency[] = [
    { code: "INR", symbol: "₹",  name: "Indian Rupee" },
    { code: "USD", symbol: "$",  name: "US Dollar" },
    { code: "EUR", symbol: "€",  name: "Euro" },
    { code: "GBP", symbol: "£",  name: "British Pound" },
    { code: "JPY", symbol: "¥",  name: "Japanese Yen" },
    { code: "AUD", symbol: "A$", name: "Australian Dollar" },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
]

type CurrencyContextType = {
    currency: Currency
    setCurrency: (c: Currency) => Promise<void>
    currencies: Currency[]
    format: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextType>({
    currency: CURRENCIES[0],
    setCurrency: async () => {},
    currencies: CURRENCIES,
    format: (amount) => `${CURRENCIES[0].symbol}${amount.toFixed(2)}`
})

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrencyState] = useState<Currency>(CURRENCIES[0])

    const getToken = () => {
        try {
            const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
            const cookieToken = match ? decodeURIComponent(match[1]).trim() : null;
            return cookieToken || localStorage.getItem("token")?.trim() || null;
        } catch {
            return null;
        }
    };

    useEffect(() => {
        // 1. Initial local load
        const saved = localStorage.getItem("currency")
        if (saved) {
            const found = CURRENCIES.find((c) => c.code === saved)
            if (found) setCurrencyState(found)
        }

        // 2. Sync with user database profile if authenticated
        const token = getToken();
        if (token) {
            fetch("/api/user", {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then((res) => (res.ok ? res.json() : null))
            .then((user) => {
                if (user?.currency) {
                    const found = CURRENCIES.find((c) => c.code === user.currency)
                    if (found) {
                        setCurrencyState(found)
                        localStorage.setItem("currency", found.code)
                    }
                }
            })
            .catch(() => {});
        }
    }, [])

    const setCurrency = useCallback(async (c: Currency) => {
        setCurrencyState(c)
        try {
            localStorage.setItem("currency", c.code)
            const token = getToken();
            if (token) {
                await fetch("/api/user", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ currency: c.code })
                }).catch(() => {});
            }
        } catch (e) {
            console.error("Failed to save currency:", e);
        }
    }, [])

    const format = (amount: number) => {
        return `${currency.symbol}${amount.toFixed(2)}`
    }

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, currencies: CURRENCIES, format }}>
            {children}
        </CurrencyContext.Provider>
    )
}

export const useCurrency = () => useContext(CurrencyContext)