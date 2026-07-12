import { useState } from "react"
import { Trash2 } from "lucide-react"

import useUsers from "../hooks/useUsers"
import useCurrentUser from "../hooks/useCurrentUser"

export default function UsersPanel() {
    const { usersQuery, updateUserMutation, deleteUserMutation } = useUsers()
    const { currentUserQuery } = useCurrentUser()
    const users = usersQuery.data ?? []
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    const isSelf = (userId: string) => userId === currentUserQuery.data?.id

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Users</h3>
            {usersQuery.isLoading && <p className="text-sm text-gray-400">Loading...</p>}
            {usersQuery.isError && <p className="text-sm text-red-500">Failed to load users</p>}
            {users.length === 0 && !usersQuery.isLoading && (
                <p className="text-sm text-gray-400">No users yet</p>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="text-left px-3 py-2 border-b border-gray-200 font-medium text-gray-700">Username</th>
                            <th className="text-left px-3 py-2 border-b border-gray-200 font-medium text-gray-700">Active</th>
                            <th className="text-left px-3 py-2 border-b border-gray-200 font-medium text-gray-700">Admin</th>
                            <th className="px-3 py-2 border-b border-gray-200"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 border-b border-gray-100 text-gray-600">{u.username}</td>
                                <td className="px-3 py-2 border-b border-gray-100">
                                    <input type="checkbox" checked={u.is_active} disabled={isSelf(u.id)}
                                    onChange={() => updateUserMutation.mutate({ userId: u.id, data: { is_active: !u.is_active } })}/>
                                </td>
                                <td className="px-3 py-2 border-b border-gray-100">
                                    <input type="checkbox" checked={u.is_superuser} disabled={isSelf(u.id)}
                                    onChange={() => updateUserMutation.mutate({ userId: u.id, data: { is_superuser: !u.is_superuser } })}/>
                                </td>
                                <td className="px-3 py-2 border-b border-gray-100 text-right">
                                    {confirmDeleteId === u.id ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-xs text-gray-500">Delete?</span>
                                            <button onClick={() => deleteUserMutation.mutate(u.id, { onSuccess: () => setConfirmDeleteId(null) })} className="text-xs text-red-600 hover:underline">Yes</button>
                                            <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-gray-500 hover:underline">Cancel</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setConfirmDeleteId(u.id)} disabled={isSelf(u.id)}
                                        className="text-gray-400 hover:text-red-600 disabled:opacity-30">
                                            <Trash2 size={14}/>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}