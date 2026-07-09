import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

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
// Welcome container -> Upload data button -> opens new tab to upload and verify data. And create report button
// Create Report button -> Opens filters with collecting and querying order data -> Create report

// Lower down -> Reports page to store all reports, button to edit : crud on reports


function Dashboard() {
    const [uploadCard, setUploadCard] = useState(false);
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
        </div>
    )
}

// Add full data summary table
// Upload CSV -> Component that opens uploads data, shows successfull entries
// add functionality to delete orders

/// For future -> will implement multiple users, will add credentials display