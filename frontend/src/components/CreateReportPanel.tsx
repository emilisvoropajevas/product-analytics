import { useState } from "react"
import { X } from "lucide-react"
import { toast } from "sonner"
import type { AxiosError } from "axios"

import useFetchOrders from "../hooks/useFetchOrders"
import useCreateReport from "../hooks/useCreateReport"
import { extractErrorMessage } from "../utils"

interface CreateReportPanelProps {
    onClose: () => void
}

export default function CreateReportPanel({ onClose }: CreateReportPanelProps) {
    const [stage, setStage] = useState<1 | 2>(1)
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [modelRange, setModelRange] = useState("")
    const [sku, setSku] = useState("")
    const [name, setName] = useState("")

    const { previewOrdersMutation } = useFetchOrders()
    const { createReportMutation } = useCreateReport()

    const previewData = previewOrdersMutation.data ?? []
    const isPreviewing = previewOrdersMutation.isPending

    const handlePreview = () => {
        if (!startDate || !endDate || !modelRange) {
            toast.error("Start date, end date and model range required")
            return
        }
        previewOrdersMutation.mutate(
            {
                start_date: startDate,
                end_date: endDate,
                model_range: modelRange.trim(),
                sku: sku.trim() || null,
            },
            {
                onSuccess: (data) => {
                    if (data.length === 0) {
                        toast.warning("No orders found for these filters")
                    }
                },
                onError: (err) => toast.error(extractErrorMessage(err as AxiosError))
            }
        )
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-medium">Create Report</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={18}/>
                    </button>
                </div>

                {stage === 1 && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
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
                                <input type="text" value={modelRange} onChange={e => setModelRange(e.target.value)} onBlur={e => setModelRange(e.target.value.trim())}
                                placeholder="DWN/..../"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"/>
                            </div>
                        </div>
                        <div className="w-1/3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                SKU <span className="text-gray-400">(optional)</span>
                            </label>
                            <input type="text" value={sku} onChange={e => setSku(e.target.value)} onBlur={e => setSku(e.target.value.trim())}
                            placeholder="e.g. ABC-f (include -f)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"/>
                        </div>
                        <button onClick={handlePreview} disabled={isPreviewing}
                        className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
                            {isPreviewing ? "Loading..." : "Preview data"}
                        </button>

                        {previewData.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-500">{previewData.length} orders found</p>
                                <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-72">
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 sticky top-0">
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
                                            {previewData.map((o, i) => (
                                                <tr key={i} className="hover:bg-gray-50">
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
                        )}
                    </div>
                )}

                {stage === 2 && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm space-y-2">
                            <p className="text-gray-700"><span className="font-medium">Model range:</span> {modelRange}</p>
                            <p className="text-gray-700"><span className="font-medium">Date range:</span> {new Date(startDate).toLocaleDateString()} – {new Date(endDate).toLocaleDateString()}</p>
                            {sku && <p className="text-gray-700"><span className="font-medium">SKU:</span> {sku}</p>}
                            <p className="text-gray-700"><span className="font-medium">Orders:</span> {previewData.length}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Report name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} onBlur={e => setName(e.target.value.trim())}
                            placeholder="e.g. Q1 Range A 2025"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"/>
                        </div>
                    </div>
                )}

                <div className="flex justify-between mt-6">
                    {stage === 2 && (
                        <button onClick={() => setStage(1)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm">
                            Back
                        </button>
                    )}
                    {stage === 1 && (
                        <button onClick={() => setStage(2)} disabled={previewData.length === 0} className="ml-auto bg-gray-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
                            Next
                        </button>
                    )}
                    {stage === 2 && (
                        <button
                            onClick={() => createReportMutation.mutate(
                                {
                                    name: name.trim(),
                                    date_range_start: startDate,
                                    date_range_end: endDate,
                                    model_range: modelRange.trim(),
                                    sku: sku.trim() || null,
                                },
                                { onSuccess: () => onClose() }
                            )}
                            disabled={!name.trim() || createReportMutation.isPending}
                            className="ml-auto bg-gray-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
                        >
                            {createReportMutation.isPending ? "Creating..." : "Create report"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}