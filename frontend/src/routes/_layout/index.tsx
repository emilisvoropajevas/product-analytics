import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import useReports from "../../hooks/useReports";
import UploadPanel from "../../components/UploadPanel"

export const Route = createFileRoute("/_layout/")({
    component: Dashboard,
    head: () => ({
        meta: [
            {
                title: "Main Dashboard",
            },
        ],
    }),
})

// Functions required, top right hand corner to render initials (how?) + tab appearing to logout
// create report button functionality
// Create Report button -> Opens filters with collecting and querying order data -> Create report
// Lower down -> Reports page to store all reports, button to edit : crud on reports


function Dashboard() {
    const [uploadCard, setUploadCard] = useState(false);

    const { reportQuery } = useReports()

    const reports = reportQuery.data ?? []

    return (
        <div>
            <div className="bg-white border-b border-gray-200 px-6 py-8">
                <h1 className="text-4xl font-medium">Welcome Back, Admin</h1>
                <div className="flex gap-2 text-black rounded-full py-2">
                    <button type="button" onClick={() => setUploadCard(prev => !prev)} className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700">Upload CSV data</button>
                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm">New Report</button>
                </div>
            </div>
            {uploadCard && <UploadPanel onClose={() => setUploadCard(false)}/>}
                <div className="grid grid-cols-2 gap-6 p-6">
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







                    <div className="grid grid-rows-2 gap-6 p-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            Summary Table 1
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            Summary Table 2
                        </div>
                    </div>
                </div>
        </div>
    )
}

// Add full data summary table
// add functionality to delete orders

/// For future -> will implement multiple users, will add credentials display
/// Error handling for get query