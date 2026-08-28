import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import UploadPanel from "../../components/UploadPanel"
import ReportsPanel from "../../components/ReportsPanel";
import CreateReportPanel from "../../components/CreateReportPanel";
import OrdersPanel from "../../components/OrdersPanel";
import useCurrentUser from "../../hooks/useCurrentUser";

export const Route = createFileRoute("/_layout/")({
    component: Dashboard,
    head: () => ({
        meta: [{ title: "Main Dashboard" }],
    }),
})

function Dashboard() {
    const [uploadCard, setUploadCard] = useState(false)
    const [isCreateRerportOpen, setIsCreateReportOpen] = useState(false)
    const [isOrdersOpen, setIsOrdersOpen] = useState(false)

    const { currentUserQuery } = useCurrentUser()
    const isAdmin = currentUserQuery.data?.is_superuser ?? false

    return (
        <div>
            <div className="bg-white border-b border-gray-200 px-6 py-8">
                <h1 className="text-4xl font-medium">Welcome Back, {currentUserQuery.data?.username ?? "..."}</h1>
                <div className="flex gap-2 text-black rounded-full py-2">
                    {isAdmin && (
                        <button type="button" onClick={() => setUploadCard(prev => !prev)} className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700">Upload CSV data</button>
                    )}
                    <button type="button" onClick={() => setIsCreateReportOpen(true)} className="border border-gray-300 text-gray-700 px-4 py-2 hover:bg-gray-200 rounded-md text-sm">New Report</button>
                    {isAdmin && (
                        <button type="button" onClick={() => setIsOrdersOpen(true)} className="border border-gray-300 text-gray-700 px-4 py-2 hover:bg-gray-200 rounded-md text-sm">Manage Orders</button>
                    )}
                </div>
            </div>
            {isCreateRerportOpen && <CreateReportPanel onClose={() => setIsCreateReportOpen(false)}/>}
            {uploadCard && <UploadPanel onClose={() => setUploadCard(false)}/>}
            {isOrdersOpen && <OrdersPanel onClose={() => setIsOrdersOpen(false)}/>}
            <div className="grid grid-cols-2 gap-6 p-6">
                <ReportsPanel/>
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