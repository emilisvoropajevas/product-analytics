import { useState } from "react"
import { X } from "lucide-react"
import { toast } from "sonner"

import useUsers from "../hooks/useUsers"

interface CreateUserPanelProps {
    onClose: () => void
}

export default function CreateUserPanel({ onClose }: CreateUserPanelProps) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isSuperuser, setIsSuperuser] = useState(false)

    const { createUserMutation, updateUserMutation } = useUsers()

    const handleCreate = () => {
        if (!username.trim() || !password.trim()) {
            toast.error("Username and password are required")
            return
        }
        createUserMutation.mutate(
            { username: username.trim(), password },
            {
                onSuccess: (created) => {
                    if (isSuperuser && created) {
                        updateUserMutation.mutate({ userId: created.id, data: { is_superuser: true } })
                    }
                    onClose()
                }
            }
        )
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-medium">Create User</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={18}/>
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"/>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"/>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={isSuperuser} onChange={e => setIsSuperuser(e.target.checked)}/>
                        Grant admin privileges
                    </label>
                </div>
                <div className="flex justify-end mt-6">
                    <button onClick={handleCreate} disabled={createUserMutation.isPending}
                    className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
                        {createUserMutation.isPending ? "Creating..." : "Create user"}
                    </button>
                </div>
            </div>
        </div>
    )
}