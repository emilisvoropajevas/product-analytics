import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { MoreVertical, Trash2, ExternalLink } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Reports } from "../client-axios"
import useReports from "../hooks/useReports"

export default function ReportsPanel() {
    const [openMenuId, setOpenMenuId] = useState<number | null>(null)
    const { reportQuery } = useReports()
    const reports = reportQuery.data ?? []
    const queryClient = useQueryClient()

    const deleteMutation = useMutation({
        mutationFn: (reportId: number) => Reports.removeReport({ path: { report_id: reportId } }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reports"] })
            toast.success("Report deleted")
            setOpenMenuId(null)
        },
        onError: () => {
            toast.error("Failed to delete report")
        }
    })

    return (
        <div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Reports</h3>
                {reportQuery.isLoading && <p className="text-sm text-gray-400">Loading...</p>}
                {reportQuery.isError && <p className="text-sm text-red-500">Failed to load reports</p>}
                {reports.length === 0 && !reportQuery.isLoading && (
                    <p className="text-sm text-gray-400">No reports yet</p>
                )}
                <div className="space-y-2">
                    {reports.map(r => (
                        <div key={r.id} className="flex items-center justify-between px-3 py-2 border border-gray-100 rounded-md hover:bg-gray-50">
                            <div>
                                <Link to="/reports/$reportId" params={{ reportId: String(r.id) }} 
                                onClick={() => setOpenMenuId(null)} className="text-sm font-medium text-gray-700">{r.name}</Link>
                                <p className="text-xs text-gray-400">{r.model_range} · {new Date(r.date_range_start).toLocaleDateString()} – {new Date(r.date_range_end).toLocaleDateString()}</p>
                            </div>
                            <div className="relative">
                                <button onClick={() => setOpenMenuId(prev => prev === r.id ? null : r.id)}
                                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                                    <MoreVertical size={16}/>
                                </button>
                                {openMenuId === r.id && (
                                    <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-sm z-10">
                                        <Link to="/reports/$reportId" params={{ reportId: String(r.id) }} onClick={() => setOpenMenuId(null)}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                                            <ExternalLink size={14}/>
                                            Open
                                        </Link>
                                        <button onClick={() => deleteMutation.mutate(r.id)} disabled={deleteMutation.isPending}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full disabled:opacity-50">
                                            <Trash2 size={14}/>
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}