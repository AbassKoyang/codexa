"use client";

import React, { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import HomeSidebar from "@/components/HomeSidebar";
import HomeHeader from "@/components/HomeHeader";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { useUpdateUser, useDeleteUser } from "@/lib/mutations";
import { toast } from "sonner";
import { Loader2, Trash2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user } = useAuth();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const router = useRouter();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    github: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        github: user.github || "",
      });
    }
  }, [user]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    updateUserMutation.mutate(
      { id: user.id as number, data: formData },
      {
        onSuccess: () => {
          toast.success("Profile updated successfully!");
        },
        onError: () => {
          toast.error("Failed to update profile.");
        },
      }
    );
  };

  const handleDelete = () => {
    if (!user) return;
    
    // Simplistic native confirmation, can be a styled modal later if needed
    if (window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone and will delete all your projects.")) {
      deleteUserMutation.mutate(user.id as number, {
        onSuccess: () => {
          toast.success("Account deleted permanently. Redirecting...");
          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);
        },
        onError: () => {
          toast.error("An error occurred trying to delete your account.");
        }
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-tokyo-bg text-tokyo-fg overflow-hidden selection:bg-tokyo-blue/30">
        <HomeSidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <HomeHeader />
          <main className="flex-1 overflow-y-auto bg-tokyo-bg p-8 custom-scrollbar">
            <div className="max-w-3xl mx-auto space-y-12 pb-12">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Settings</h1>
                <p className="text-tokyo-muted">Manage your profile, credentials, and app preferences.</p>
              </div>

              <div className="bg-[#1E293B] border border-[#414868]/50 p-8 shadow-sm">
                <h2 className="text-xl font-bold text-white mb-6">Profile Details</h2>
                <form onSubmit={handleUpdate} className="space-y-6">
                  <FieldGroup className="grid grid-cols-2 gap-6">
                    <Field>
                      <FieldLabel className="text-sm font-semibold text-tokyo-fg mb-2">First Name</FieldLabel>
                      <Input
                        value={formData.first_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                        placeholder="John"
                        className="bg-[#0f172a] border-[#414868]/50 focus:border-tokyo-blue text-white rounded-none h-11"
                      />
                    </Field>
                    <Field>
                      <FieldLabel className="text-sm font-semibold text-tokyo-fg mb-2">Last Name</FieldLabel>
                      <Input
                        value={formData.last_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                        placeholder="Doe"
                        className="bg-[#0f172a] border-[#414868]/50 focus:border-tokyo-blue text-white rounded-none h-11"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup className="grid grid-cols-2 gap-6">
                    <Field>
                      <FieldLabel className="text-sm font-semibold text-tokyo-fg mb-2">Email Address</FieldLabel>
                      <Input
                        value={user?.email || ""}
                        disabled
                        className="bg-[#0f172a]/50 border-[#414868]/30 text-tokyo-muted cursor-not-allowed rounded-none h-11"
                      />
                      <p className="text-xs text-tokyo-muted/80 mt-1">Managed securely through authentication provider.</p>
                    </Field>
                    <Field>
                      <FieldLabel className="text-sm font-semibold text-tokyo-fg mb-2">GitHub Handle</FieldLabel>
                      <Input
                        value={formData.github}
                        onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
                        placeholder="https://github.com/..."
                        className="bg-[#0f172a] border-[#414868]/50 focus:border-tokyo-blue text-white rounded-none h-11"
                      />
                    </Field>
                  </FieldGroup>

                  <div className="pt-4 flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateUserMutation.isPending}
                      className="bg-tokyo-blue hover:bg-tokyo-blue/90 text-white font-bold px-6 rounded-none flex items-center gap-2"
                    >
                      {updateUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 p-8 shadow-sm">
                <h2 className="text-xl font-bold text-red-500 mb-2">Danger Zone</h2>
                <p className="text-sm text-tokyo-muted mb-6">Permanently remove your Account and all of its contents from the Codexa servers. This action is not reversible, so please continue with caution.</p>
                
                <Button 
                  onClick={handleDelete}
                  disabled={deleteUserMutation.isPending}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-500 font-bold border border-red-500/50 rounded-none flex items-center gap-2"
                >
                  {deleteUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deleteUserMutation.isPending ? "Deleting..." : "Delete Account"}
                </Button>
              </div>

            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
