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
// Add cat image above h2 tag later
    return (
        <div className="min-h-screen bg-linear-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-md w-full transform transition-all hover:scale-105 duration-300">
                <div className="bg-linear-to-r from-blue-500 to-purple-600 p-6">
                    <h2 className="text-white text-2xl font-bold text-center">Welcome Back</h2>
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
                            <input id="password" type="text" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="--------" //This needs to change to show *** on typing password with (showpassword function)
                            value={password}
                            onChange={(e) => {setPassword(e.target.value)}}
                            required
                            />
                        </div>

                        <button type="submit" className="w-full py-2 px-4 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
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
// 