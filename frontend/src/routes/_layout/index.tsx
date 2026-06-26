import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

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

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
       <div>
        
       </div>
    )
}

/* 


        <div className="relative ml-3 flex justify-end">
            <button type="button" onClick={() => setIsMenuOpen(prev => !prev)} className="relative rounded-full p-1 text-gray-400 hover:text-black">
                <div className="size-8 rounded-full outline -outline-offset-1 outline-white/10">
                    Admin
                </div>
                
            </button>
            {isMenuOpen && <div className="overflow-hidden border-b border-border/50 absolute">
            <p>Logout</p> 
                </div>}
        </div>
        
        */