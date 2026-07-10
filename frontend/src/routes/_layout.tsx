import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useState } from "react";

import useAuth, { isLoggedIn } from "../hooks/useAuth";

export const Route = createFileRoute("/_layout")({
    component: Layout,
    beforeLoad: async () => {
        if (!isLoggedIn()) {
            throw redirect({
                to: "/login",
            })
        }
    },
})

function Layout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { logout } = useAuth()

    return (
        <div className="min-h-screen">
            <nav className="flex items-center justify-between px-6 h-12 bg-gray-900 text-white font-bold">
                <span>Product Analytics</span>
                <div className="relative">
                    <button onClick={() => setIsMenuOpen(prev => !prev)} className="rounded-full w-8 h-8 bg-blue-300 text-blue-700 text-sm font-medium">
                        AD
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-sm">
                            <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Sign Out</button>
                        </div>
                    )}
                </div>
            </nav>
            <Outlet/>
        </div>
    )
}