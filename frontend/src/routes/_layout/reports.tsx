import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/reports")({
    component: Reports,
    head: () => ({
        meta: [
            {
                title: "Report Plots",
            },
        ],
    }),
})

function Reports() {
    return (
    <div>
        This is the report plots page with functionality
    </div>
    )
}