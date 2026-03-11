'use client';
import ProtectedRoute from "@/components/ProtectedRoute";
import HomeSidebar from "@/components/HomeSidebar";
import HomeHeader from "@/components/HomeHeader";
import RecentProjects from "@/components/RecentProjects";
import AllProjects from "@/components/AllProjects";

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-tokyo-bg text-tokyo-fg overflow-hidden selection:bg-tokyo-blue/30">
        <HomeSidebar />
        
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <HomeHeader />
          
          <main className="flex-1 overflow-y-auto bg-tokyo-bg p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-12 pb-12">
              <RecentProjects />
              <AllProjects />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
