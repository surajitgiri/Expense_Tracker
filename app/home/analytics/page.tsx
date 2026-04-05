"use client"

import { useEffect , useState } from "react"
import SpendingPieChart from "@/components/charts/SpendingPieChart"
import DailyBarChart from "@/components/charts/DailyBarChart"
import TrendLineChart from "@/components/charts/TrendLineChart"

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

    return(
        <div className="p-6 max-w-5xl mx-auto">
            
            {/**Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

                        {/* Left */}
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">
                        Analytics
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                        Visual overview of your finances
                        </p>
                    </div>

                    {/* Right */}
                    <div className="w-full md:w-auto">
                        <p className="text-gray-700 items-center mb-3 underline">Filter By <span className="font-semibold">[yyyy-mm]</span> Format</p>
                        <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full md:w-auto border border-gray-500 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    </div>

            {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2 mb-4">{error}</p>
            )}

            {loading? (
                <div className="flex items-center justify-center py-20">
                    <p className="text-gray-400 text-sm">Loading analytics</p>
                </div>
            ) : (
                <>
                 {/** Summary Cards */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                            <p className="text-sm text-gray-500 mb-1">Total Income</p>
                            <p className="text-xl font-semibold text-green-600">+${totalIncome.toFixed(2)}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                            <p className="text-sm text-gray-500 mb-1">Total Expense</p>
                            <p className="text-xl font-semibold text-red-500">-${totalExpense.toFixed(2)}</p>
                            </div>
                        
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                            <p className="text-sm text-gray-500 mb-1">Net Balance</p>
                            <p className={`text-xl font-semibold ${netBalance >= 0 ? "text-blue-600" : "text-red-500"}`}>
                                ${netBalance.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {/**Row 1: Pie + Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
  
                            <h2 className="text-sm sm:text-base font-semibold text-gray-700 mb-3 sm:mb-4">
                                Expense by Category
                            </h2>

                            <div className="h-[260px] sm:h-[300px]">
                                <SpendingPieChart data={data?.categoryData || []} />
                            </div>

                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-5">
                            <h2 className="text-sm font-semibold text-gray-700 mb-5 sm:mb-4">Daily Income</h2>
                            <div className="h-[260px] sm:h-[300px]">
                                <DailyBarChart data={data?.dailyData || []}/>
                            </div>
                        </div>
                    </div>

                    {/**Row 2: Line chart */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">Spending Trend</h2>
                        <TrendLineChart data={data?.dailyData || []}/>
                    </div>
                </>
            )}
        </div> 
    )
}

