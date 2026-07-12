import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Reports } from "../../client-axios";
import ReportChart from "../../components/plotting/ReportChart";

export const Route = createFileRoute("/_layout/reports/$reportId")({
    component: ReportPage,
})

function ReportPage() {
    const { reportId } = Route.useParams()
    const navigate = useNavigate()

    const { data, isLoading, isError } = useQuery({
        queryKey: ["report", reportId],
        queryFn: async () => {
            const response = await Reports.getReport({
                path: {report_id: Number(reportId)}
            })
            return response.data
        }
    })

    if (isLoading) return (
        <div className="p-6">
            <p className="text-sm text-gray-400">Loading report...</p>
        </div>
    )

    if (isError) return (
        <div className="p-6">
            <p className="text-sm text-red-500">Failed to load report</p>
        </div>
    )

    if (!data) return null

    return (
        <div className="p-6">
            <button 
                onClick={() => navigate({to: "/"})}
                className=" flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
                >
                    <ArrowLeft size={16}/>
                    Back to dashboard
                </button>

                <div className="mb-6">
                    <h1 className="text-2xl font-medium text-gray-900">{data.name}</h1>
                    <div className="flex gap-4 mt-1 text-sm text-gray-400">
                        <span>SKU: {data.sku}</span>
                        <span>:</span>
                        <span>{data.data.length} orders</span>
                    </div>
                    <div className="flex flex-col gap-4 mt-1 text-sm text-gray-400">
                        <span>Model Range : {data.model_range}</span>
                    </div>
                </div>

                {data.data.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                        <p className="text-sm text0gray-400">No order data found for this report's filters</p>
                    </div>
                ) : (
                    <ReportChart orders={data.data}/>
                )}
        </div>
    )
}