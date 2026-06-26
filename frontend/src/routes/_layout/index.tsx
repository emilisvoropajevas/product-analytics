import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

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
    return (
        <div className="bg-white border-b border-gray-200 px-6 py-8">
            <h1 className="text-4xl font-medium">Welcome Back, Admin</h1>
            <div className="flex gap-2 text-black rounded-full py-2">
                <button className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700">Upload CSV data</button>
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm">New Report</button>
            </div>
        </div>
    )
}

/* Finish on clicks for buttons, could render those in components */