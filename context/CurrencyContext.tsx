"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type Currency = {
    code: string
    symbol: string
    name: string
}

const CURRENCIES: Currency[] = [
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
    setCurrency: (c: Currency) => void
    currencies: Currency[]
    format: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextType>({
    currency: CURRENCIES[0],
    setCurrency: () => {},
    currencies: CURRENCIES,
    format: (amount) => `${CURRENCIES[0].symbol}${amount.toFixed(2)}`
})

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    // Always start with the default so SSR and initial client render match exactly.
    // We sync from localStorage only after hydration in useEffect.
    const [currency, setCurrencyState] = useState<Currency>(CURRENCIES[0])

    useEffect(() => {
        const saved = localStorage.getItem("currency")
        if (saved) {
            const found = CURRENCIES.find((c) => c.code === saved)
            if (found) setCurrencyState(found)
        }
    }, [])

    const setCurrency = (c: Currency) => {
        setCurrencyState(c)
        localStorage.setItem("currency", c.code)
    }

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