"use client";

import React, { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import HomeSidebar from "@/components/HomeSidebar";
import HomeHeader from "@/components/HomeHeader";
import CreateProjectModal from "@/components/CreateProjectModal";
import { LANGUAGE_CHOICES } from "@/lib/constants";
import Image from "next/image";

export default function TemplatesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(undefined);

  const handleTemplateClick = (framework: string) => {
    setSelectedTemplate(framework);
    setIsModalOpen(true);
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-tokyo-bg text-tokyo-fg overflow-hidden selection:bg-tokyo-blue/30 relative">
        <HomeSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
          <HomeHeader onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto bg-tokyo-bg p-4 sm:p-8 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 pb-12">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">Templates</h1>
                <p className="text-sm text-tokyo-muted">Jumpstart your next project with pre-configured language frameworks.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {LANGUAGE_CHOICES.map((template) => (
                  <div 
                    key={template.value}
                    onClick={() => handleTemplateClick(template.value)}
                    className="bg-[#1E293B] border border-[#414868]/50 hover:border-tokyo-blue/50 hover:shadow-[0_0_20px_rgba(60,131,246,0.1)] hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col h-48 rounded-none overflow-hidden"
                  >
                    <div className="flex-1 bg-gradient-to-br from-tokyo-bg to-[#0f172a] p-6 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[#3C83F6]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {template.image ? (
                        <div className="relative w-16 h-16 group-hover:scale-110 transition-transform duration-300 z-10">
                           <img src={template.image} alt={template.label} className="object-contain w-full h-full" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-[#1A1F35] border border-[#414868]/50 flex items-center justify-center text-xl font-bold text-tokyo-muted group-hover:text-tokyo-blue transition-colors z-10 shadow-inner">
                          {template.value.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-t border-[#414868]/50 bg-[#0f172a] relative z-10 group-hover:bg-[#131B2F] transition-colors">
                      <h3 className="text-sm font-bold text-white group-hover:text-tokyo-blue transition-colors">{template.label}</h3>
                      <p className="text-[10px] text-tokyo-muted mt-1 uppercase tracking-widest font-semibold">{template.value.toUpperCase()} Framework</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
      <CreateProjectModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        defaultLanguage={selectedTemplate} 
      />
    </ProtectedRoute>
  );
}
