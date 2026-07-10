import useReports from "../hooks/useReports"

export default function ReportsPanel() {

    const { reportQuery } = useReports()
    const reports = reportQuery.data ?? []

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
                                    <p className="text-sm font-medium text-gray-700">{r.name}</p>
                                    <p className="text-xs text-gray-400">{r.model_range} {new Date(r.date_range_start).toLocaleDateString()} - {new Date(r.date_range_end).toLocaleDateString()}</p>
                                </div>
                            </div>
                            ))}
                    </div>
            </div>
        </div>
    )
}