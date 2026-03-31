'use client';
import { useState } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";
import HomeSidebar from "@/components/HomeSidebar";
import HomeHeader from "@/components/HomeHeader";
import RecentProjects from "@/components/RecentProjects";
import AllProjects from "@/components/AllProjects";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-tokyo-bg text-tokyo-fg overflow-hidden selection:bg-tokyo-blue/30 relative">
        <HomeSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
          <HomeHeader onMenuClick={() => setIsSidebarOpen(true)} />
          
          <main className="flex-1 overflow-y-auto bg-tokyo-bg p-4 sm:p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 pb-12">
              <RecentProjects />
              <AllProjects />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
