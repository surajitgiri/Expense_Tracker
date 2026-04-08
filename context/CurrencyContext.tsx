"use client"

import React, { createContext , useContext , useState } from "react"

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
    format: (amount) => `${amount.toFixed(2)}`
})

export function CurrencyProvider({children}: {children: React.ReactNode}){
    const [currency , setCurrencyState] = useState<Currency>(() => {
        if(typeof window !== "undefined"){
            
        const saved = localStorage.getItem("currency")
        if(saved){
            const found = CURRENCIES.find((c) => c.code === saved)
            if(found) return found
        }
        }
        return CURRENCIES[0]
    })

    const setCurrency = (c: Currency) => {
        setCurrencyState(c)
        localStorage.setItem("currency" , c.code)
    }

    const format = (amount: number) => {
        return `${currency.symbol}${amount.toFixed(2)}`
    }

    return (
        <CurrencyContext.Provider value={{currency , setCurrency , currencies: CURRENCIES , format}}>
           {children}
        </CurrencyContext.Provider>
    )
}

export const useCurrency = () => useContext(CurrencyContext)