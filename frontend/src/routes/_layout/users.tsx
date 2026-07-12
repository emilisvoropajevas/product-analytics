import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import UsersPanel from "../../components/UsersPanel";
import CreateUserPanel from "../../components/CreateUserPanel";
import useCurrentUser from "../../hooks/useCurrentUser";

export const Route = createFileRoute("/_layout/users")({
    component: UsersPage,
    head: () => ({
        meta: [{ title: "Manage Users" }],
    }),
})

function UsersPage() {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const { currentUserQuery } = useCurrentUser()

    if (currentUserQuery.isLoading) {
        return <div className="p-6 text-sm text-gray-400">Loading...</div>
    }

    if (!currentUserQuery.data?.is_superuser) {
        return <div className="p-6 text-sm text-red-500">You don't have access to this page.</div>
    }

    return (
        <div>
            <div className="bg-white border-b border-gray-200 px-6 py-8">
                <h1 className="text-4xl font-medium">Manage Users</h1>
                <div className="flex gap-2 text-black rounded-full py-2">
                    <button type="button" onClick={() => setIsCreateOpen(true)} className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700">New User</button>
                </div>
            </div>
            {isCreateOpen && <CreateUserPanel onClose={() => setIsCreateOpen(false)}/>}
            <div className="p-6">
                <UsersPanel/>
            </div>
        </div>
    )
}