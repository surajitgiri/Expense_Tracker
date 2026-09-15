"use client"

import { useEffect , useState } from "react"
import SpendingPieChart from "@/components/charts/SpendingPieChart"
import DailyBarChart from "@/components/charts/DailyBarChart"
import TrendLineChart from "@/components/charts/TrendLineChart"

import { useCurrency } from "@/context/CurrencyContext"

type CategoryData = {
    name: string
    color: string
    icon: string
    amount: number
}

type DailyData = {
    date: string
    income: number
    expense: number
}

type Totals = {
    type: string
    _sum: {amount: number}
}

type AnalyticsData = {
    totals: Totals[]
    categoryData: CategoryData[]
    dailyData: DailyData[]
}

export default function AnalyticsPage(){
    const [data , setData] = useState<AnalyticsData | null>(null)
    const [loading , setLoading] = useState(true);
    const [error , setError] = useState("")
    const [selectedMonth , setSelectedMonth] = useState(
        new Date().toISOString().slice(0,7)
    )

    const {format} = useCurrency();

    useEffect(() => {
        const fetchAnalytics = async() => {
            setLoading(true)
            setError("")
            try {
                const res = await fetch(`/api/analytics?month=${selectedMonth}`)
                const json = await res.json();
                if(res.ok) setData(json);
                else setError(json.error)
            } catch (error) {
                setError("Failed to load analytics")
            }finally{
                setLoading(false)
            }
        }

        fetchAnalytics();
    },[selectedMonth])

    const totalIncome = data?.totals.find((t) => t.type === "income")?._sum.amount || 0
    const totalExpense = data?.totals.find((t) => t.type === "expense")?._sum.amount || 0
    const netBalance = totalIncome - totalExpense;

    return (
        <div className="space-y-5 max-w-5xl mx-auto">
            
            {/**Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                {/* Left */}
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Analytics
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Visual overview of your financial flow
                    </p>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2">
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full sm:w-auto border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {error && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-800 rounded-lg px-4 py-2 mb-4">{error}</p>
            )}

            {loading? (
                <div className="flex items-center justify-center py-20">
                    <p className="text-gray-400 text-sm">Loading analytics...</p>
                </div>
            ) : (
                <>
                  {/** Summary Cards */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5">
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-3 sm:p-4">
                            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Total Income</p>
                            <p className="text-sm sm:text-lg md:text-xl font-bold text-green-600 dark:text-green-400 truncate">+{format(totalIncome)}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-3 sm:p-4">
                            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Total Expense</p>
                            <p className="text-sm sm:text-lg md:text-xl font-bold text-red-500 dark:text-red-400 truncate">-{format(totalExpense)}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-3 sm:p-4">
                            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Net Balance</p>
                            <p className={`text-sm sm:text-lg md:text-xl font-bold truncate ${netBalance >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-red-500 dark:text-red-400"}`}>
                                {format(netBalance)}
                            </p>
                        </div>
                  </div>

                  {/**Row 1: Pie + Bar */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xs p-4 sm:p-5">
                            <h2 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">
                                Expense by Category
                            </h2>
                            <div className="h-[260px] sm:h-[300px]">
                                <SpendingPieChart data={data?.categoryData || []} />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xs p-4 sm:p-5">
                            <h2 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">
                                Daily Income
                            </h2>
                            <div className="h-[260px] sm:h-[300px]">
                                <DailyBarChart data={data?.dailyData || []}/>
                            </div>
                        </div>
                  </div>

                  {/**Row 2: Line chart */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xs p-4 sm:p-5 mb-4">
                      <h2 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
                          Spending Trend
                      </h2>
                      <TrendLineChart data={data?.dailyData || []}/>
                  </div>
                </>
            )}
        </div> 
    )
}

