import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";

import useAuth, { isLoggedIn } from "../hooks/useAuth";
import useClickAway from "../hooks/ui/useClickAway"
import useCurrentUser from "../hooks/useCurrentUser";
import { getInitials } from "../utils";

export const Route = createFileRoute("/_layout")({
    component: Layout,
    beforeLoad: async () => {
        if (!isLoggedIn()) {
            throw redirect({ to: "/login" })
        }
    },
})

function Layout() {
    const menuRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { logout } = useAuth()
    const { currentUserQuery } = useCurrentUser()
    const isAdmin = currentUserQuery.data?.is_superuser ?? false

    useClickAway([menuRef, buttonRef], () => setIsMenuOpen(false));

    return (
        <div className="min-h-screen">
            <nav className="flex items-center justify-between px-6 h-12 bg-gray-900 text-white font-bold">
                <div className="flex gap-4">
                    <Link to="/"><span className="hover:text-zinc-700">Home</span></Link>
                    {isAdmin && (
                        <Link to="/users"> <span className="hover:text-zinc-700">Manage Users</span></Link>
                    )}
                </div>
                <div className="relative">
                    <button ref={buttonRef} onClick={() => setIsMenuOpen(prev => !prev)} className="rounded-full w-8 h-8 bg-blue-300 text-blue-700 text-sm hover:bg-white font-medium">
                        {currentUserQuery.data ? getInitials(currentUserQuery.data.username) : "··"}
                    </button>
                    {isMenuOpen && (
                        <div  ref = {menuRef} className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-sm">
                            {isAdmin && (
                                <Link to="/users" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-500">
                                    Manage Users
                                </Link>
                            )}
                            <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Sign Out</button>
                        </div>
                    )}
                </div>
            </nav>
            <Outlet/>
        </div>
    )
}