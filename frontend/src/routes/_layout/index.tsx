import { createFileRoute } from "@tanstack/react-router";

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
        <div className="flex flex-row items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-tr shadow-lg ml-auto">
                <span className="text-xl font-bold tracking-wider text-black">Admin</span>
            </div>

        </div>
    )
}