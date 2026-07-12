import { useState, useMemo } from "react";
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid,
    ResponsiveContainer
} from "recharts"
import type { OrdersPublic } from "../../client-axios"

interface ReportChartProps {
    orders: Array<OrdersPublic>
}

type YAxis = "orders" | "quantity"
type XGrouping = "daily" | "weekly" | "monthly" | "yearly"
type ChartType = "line" | "bar"

const getISOWeek = (date: Date): number => {
    const d = new Date(date)
    d.setHours(0,0,0,0)
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)
    const week1 = new Date(d.getFullYear(), 0, 4)
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}

const getGroupKey = (date: Date, grouping: XGrouping): string => {
    switch (grouping) {
        case "daily":
            return date.toLocaleDateString("en-GB")
        case "weekly":
            return `W${getISOWeek(date)} ${date.getFullYear()}`
        case "monthly":
            return date.toLocaleDateString("en-GB", {month: "short", year: "numeric"})
        case "yearly":
            return String(date.getFullYear())
    }
}

const generateDateRange = (start: Date, end: Date, grouping: XGrouping): string[] => {
    const dates: string[] = []
    const current = new Date(start)
    current.setHours(0,0,0,0)
    const endTime = new Date(end)
    endTime.setHours(0,0,0,0)

    while (current <= endTime) {
        dates.push(getGroupKey(new Date(current), grouping))
        switch (grouping) {
            case "daily":
                current.setDate(current.getDate() + 1)
                break
            case "weekly":
                current.setDate(current.getDate() + 7)
                break
            case "monthly":
                current.setMonth(current.getMonth() + 1)
                break
            case "yearly":
                current.setFullYear(current.getFullYear() + 1)
                break
        }
    }
    return [...new Set(dates)]
}

const aggregateOrders = (
    orders: Array<OrdersPublic>,
    grouping: XGrouping,
    yAxis: YAxis,
): Array<{label: string, value: number, sortDate: Date}> => {
    
    const grouped = orders.reduce((acc, o) => {
        const date = new Date(o.order_date)
        const key = getGroupKey(date, grouping)

        if (!acc[key]) {
            acc[key] = { orderIds: new Set<number>(), qty: 0, sortDate: date }
        }

        acc[key].orderIds.add(o.order_id)
        acc[key].qty += o.qty_ordered

        return acc
    }, {} as Record<string, {orderIds: Set<number>, qty: number, sortDate: Date }>)

    const allDates = orders.map(o => new Date(o.order_date))
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))

    const fullRange = generateDateRange(minDate, maxDate, grouping)

    return fullRange.map((label, i) => ({
        label,
        value: grouped[label]
        ? yAxis === "orders"
            ? grouped[label].orderIds.size
            : grouped[label].qty
        : 0,
        sortDate: new Date(minDate.getTime() + i)
    }))
}

const yAxisLabel: Record<YAxis, string> = {
    orders: "Number of orders",
    quantity: "Total quantity",
}

const recommendGrouping = (orders: Array<OrdersPublic>) : XGrouping => {
    const allDates = orders.map(o => new Date(o.order_date))
    const minDate = Math.min(...allDates.map(d => d.getTime()))
    const maxDate = Math.max(...allDates.map(d => d.getTime()))
    const days = (maxDate - minDate) / 86400000
    if (days > 365) return "monthly"
    if (days > 90) return "weekly"
    return "daily"
}

export default function ReportChart({orders}: ReportChartProps) {
    const [yAxis, setYAxis] = useState<YAxis>("orders")
    const [xGrouping, setXGrouping] = useState<XGrouping>(() => recommendGrouping(orders))
    const [chartType, setChartType] = useState<ChartType>("line")

    const chartData = useMemo(
        () => aggregateOrders(orders, xGrouping, yAxis),
        [orders, xGrouping, yAxis]
    )

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-wrap gap-4 mb-6">
                <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Y axis</p>
                    <div className="flex gap-1">
                        {(["orders", "quantity", "revenue"] as YAxis[]).map(v => (
                            <button
                                key={v}
                                onClick={() => setYAxis(v)}
                                className={`px-3 py-1.5 text-xs rounded-md border ${
                                    yAxis === v
                                        ? "bg-gray-900 text-white border-gray-900"
                                        : "text-gray-600 border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                {yAxisLabel[v]}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Group by</p>
                    <div className="flex gap-1">
                        {(["daily", "weekly", "monthly", "yearly"] as XGrouping[]).map(g => (
                            <button
                                key={g}
                                onClick={() => setXGrouping(g)}
                                className={`px-3 py-1.5 text-xs rounded-md border capitalize ${
                                    xGrouping === g
                                        ? "bg-gray-900 text-white border-gray-900"
                                        : "text-gray-600 border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Chart type</p>
                    <div className="flex gap-1">
                        {(["line", "bar"] as ChartType[]).map(t => (
                            <button
                                key={t}
                                onClick={() => setChartType(t)}
                                className={`px-3 py-1.5 text-xs rounded-md border capitalize ${
                                    chartType === t
                                        ? "bg-gray-900 text-white border-gray-900"
                                        : "text-gray-600 border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mb-2 text-xs text-gray-400">{yAxisLabel[yAxis]} · {chartData.length} data points</div>

            <ResponsiveContainer width="100%" height={400}>
                {chartType === "line" ? (
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 11, fill: "#9ca3af" }}
                            angle={-45}
                            textAnchor="end"
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: "#9ca3af" }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#111827"
                            strokeWidth={2}
                            dot={chartData.length < 60}
                            activeDot={{ r: 4 }}
                        />
                    </LineChart>
                ) : (
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 11, fill: "#9ca3af" }}
                            angle={-45}
                            textAnchor="end"
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: "#9ca3af" }}
                        />
                        <Bar dataKey="value" fill="#111827" radius={[3, 3, 0, 0]}/>
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    )
}
