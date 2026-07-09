import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from 'sonner'

import useAuth, {isLoggedIn} from "../hooks/useAuth";

export const Route = createFileRoute("/login")({
    component: Login,
    beforeLoad: async () => {
        if (isLoggedIn()) {
            throw redirect({
                to: "/",
            })
        }
    },
    head: () => ({
        meta: [
            {
                title: "Log in - Product Analytics",
            },
        ],
    }),
})

function Login() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const { loginMutation } = useAuth()

    const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        // Check for empty field names and return error
        if (!username.trim() || !password.trim()) {
            return toast.error("Field cannot be empty")
        }
        if (loginMutation.isPending) return
        loginMutation.mutate({ username, password })        
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl overflow-hidden max-w-md w-full transform">
                <div className="bg-gray-900 p-6">
                    <h2 className="text-white text-2xl font-bold text-center">Welcome</h2>
                </div>

                <div className="p-6">
                    <form onSubmit={onSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Username
                            </label>
                            <input id="username" type="text" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="username"
                            value={username}
                            onChange={(e) => {setUsername(e.target.value)}}
                            required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Password
                            </label>
                            <input id="password" type="password" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={password}
                            onChange={(e) => {setPassword(e.target.value)}}
                            required
                            />
                        </div>
                        <button type="submit" disabled={loginMutation.isPending} className="w-full py-2 px-4 bg-gray-900 text-white rounded-lg hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            Log in
                        </button>
                    </form>

                </div>

            </div>

        </div>
    )
}

// Render errors correctly 
// How does useAuth check expiry
// Set maximum login attempt