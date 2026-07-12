import { useState } from "react"
import { X, Trash2 } from "lucide-react"
import { toast } from "sonner"

import useFetchOrders from "../hooks/useFetchOrders"

interface OrdersPanelProps {
    onClose: () => void
}

export default function OrdersPanel({ onClose }: OrdersPanelProps) {
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [modelRange, setModelRange] = useState("")
    const [sku, setSku] = useState("")
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
    const [hasFiltered, setHasFiltered] = useState(false)

    const { ordersQuery, previewOrdersMutation, deleteOrdersMutation } = useFetchOrders()

    const orders = hasFiltered ? (previewOrdersMutation.data ?? []) : (ordersQuery.data ?? [])
    const isLoading = hasFiltered ? previewOrdersMutation.isPending : ordersQuery.isLoading

    const handleFilter = () => {
        if ((startDate && !endDate) || (endDate && !startDate)) {
            toast.error("Start date and end date must be set together")
            return
        }
        setSelectedIds(new Set())
        setHasFiltered(true)
        previewOrdersMutation.mutate({
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            model_range: modelRange.trim() || undefined,
            sku: sku.trim() || undefined,
        })
    }

    const toggleOne = (id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const toggleAll = () => {
        setSelectedIds(selectedIds.size === orders.length ? new Set() : new Set(orders.map(o => o.id)))
    }

    const handleDelete = () => {
        if (selectedIds.size === 0) return
        deleteOrdersMutation.mutate(Array.from(selectedIds), {
            onSuccess: () => setSelectedIds(new Set())
        })
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-medium">Manage Orders</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={18}/>
                    </button>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Start date</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"/>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">End date</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"/>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Model range</label>
                        <input type="text" value={modelRange} onChange={e => setModelRange(e.target.value)}
                        placeholder="DWN/..../"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"/>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
                        <input type="text" value={sku} onChange={e => setSku(e.target.value)}
                        placeholder="e.g. ABC-f"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"/>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <button onClick={handleFilter} disabled={previewOrdersMutation.isPending}
                    className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
                        {previewOrdersMutation.isPending ? "Loading..." : "Apply filters"}
                    </button>
                    <button onClick={handleDelete} disabled={selectedIds.size === 0 || deleteOrdersMutation.isPending}
                    className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
                        <Trash2 size={14}/>
                        {deleteOrdersMutation.isPending ? "Deleting..." : `Delete selected (${selectedIds.size})`}
                    </button>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-96">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-50 sticky top-0">
                                <th className="px-3 py-2 border-b border-gray-200">
                                    <input type="checkbox"
                                    checked={orders.length > 0 && selectedIds.size === orders.length}
                                    onChange={toggleAll}/>
                                </th>
                                <th className="text-left px-3 py-2 border-b border-gray-200 font-medium text-gray-700">Order ID</th>
                                <th className="text-left px-3 py-2 border-b border-gray-200 font-medium text-gray-700">Date</th>
                                <th className="text-left px-3 py-2 border-b border-gray-200 font-medium text-gray-700">SKU</th>
                                <th className="text-left px-3 py-2 border-b border-gray-200 font-medium text-gray-700">Product</th>
                                <th className="text-left px-3 py-2 border-b border-gray-200 font-medium text-gray-700">Qty</th>
                                <th className="text-left px-3 py-2 border-b border-gray-200 font-medium text-gray-700">Price</th>
                                <th className="text-left px-3 py-2 border-b border-gray-200 font-medium text-gray-700">Model range</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr><td colSpan={8} className="px-3 py-4 text-center text-gray-400">Loading...</td></tr>
                            )}
                            {!isLoading && orders.length === 0 && (
                                <tr><td colSpan={8} className="px-3 py-4 text-center text-gray-400">No orders found</td></tr>
                            )}
                            {orders.map(o => (
                                <tr key={o.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 border-b border-gray-100">
                                        <input type="checkbox" checked={selectedIds.has(o.id)} onChange={() => toggleOne(o.id)}/>
                                    </td>
                                    <td className="px-3 py-2 border-b border-gray-100 text-gray-600">{o.order_id}</td>
                                    <td className="px-3 py-2 border-b border-gray-100 text-gray-600">{new Date(o.order_date).toLocaleDateString()}</td>
                                    <td className="px-3 py-2 border-b border-gray-100 text-gray-600">{o.product_sku}</td>
                                    <td className="px-3 py-2 border-b border-gray-100 text-gray-600">{o.product_name}</td>
                                    <td className="px-3 py-2 border-b border-gray-100 text-gray-600">{o.qty_ordered}</td>
                                    <td className="px-3 py-2 border-b border-gray-100 text-gray-600">£{o.price}</td>
                                    <td className="px-3 py-2 border-b border-gray-100 text-gray-600">{o.model_range}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}