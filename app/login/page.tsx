'use client';
import CodeEditor from "@/components/CodeEditor";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation";
import Script from "next/script";
import axios from "axios";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";


declare global {
  interface Window {
    google: any;
  }
}

export default function LoginPage() {
  const [isLoading, setisLoading] = useState(false)
  const router = useRouter()
  const googleButtonRef = useRef<HTMLDivElement>(null)

  const { user, loading } = useAuth();
  const [gisLoaded, setGisLoaded] = useState(false);  
  console.log(user);

  
  const handleGoogleResponse = async (response: any) => {
    try {
      const formData = new FormData();
      formData.append("token", response.credential)

      const res = await api.post(`/api/auth/google_login/`, formData, {withCredentials: true})

      toast.success("Logged in with Google");
      window.location.replace("/");
    } catch (error) {
      console.error(error)
      toast.error("Google authentication failed")
    }
  }

  useEffect(() => {
    if (!gisLoaded) return;

    const google = window.google;

    google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: handleGoogleResponse,
    });

    if (googleButtonRef.current) {
      google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
      });
    }

    google.accounts.id.prompt();

    return () => {
      google.accounts.id.cancel();
    };
  }, [gisLoaded]);

  useEffect(() => {
    if (user) {
      window.google?.accounts.id.cancel();
      window.location.replace('/feed')
    }
  }, [user]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#1E293B] font-sans pt-10">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGisLoaded(true)}
      />
      <div className="flex flex-col justify-center items-center">
        <div className="flex items-center justify-center p-2 border border-tokyo-blue border-dashed relative">
          <svg width="30" height="24" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 24C2.175 24 1.46875 23.7062 0.88125 23.1187C0.29375 22.5312 0 21.825 0 21V3C0 2.175 0.29375 1.46875 0.88125 0.88125C1.46875 0.29375 2.175 0 3 0H27C27.825 0 28.5312 0.29375 29.1187 0.88125C29.7062 1.46875 30 2.175 30 3V21C30 21.825 29.7062 22.5312 29.1187 23.1187C28.5312 23.7062 27.825 24 27 24H3ZM3 21H27V6H3V21ZM8.25 19.5L6.15 17.4L10.0125 13.5L6.1125 9.6L8.25 7.5L14.25 13.5L8.25 19.5ZM15 19.5V16.5H24V19.5H15Z" fill="#3C83F6" />
          </svg>
        </div>
        <div className="flex items-center justify-center flex-col mt-3">
          <h1 className="text-4xl font-bold text-white">Codexa AI</h1>
          <p className="text-sm text-gray-500 mt-0.5">Code faster, smarter.</p>
        </div>

        <div className="mt-3 p-8 bg-[#0F172A]/50 shadow-xs rounded-xl">
          <div className="w-[400px] h-[150px] bg-linear-90 flex items-center justify-center from-[#3C83F6]/20 via-[#3C83F6]/5 to-[#3C83F6]/0 border border-[#3C83F6]/10 rounded-xl">
            <svg width="55" height="55" viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M45 20L41.875 13.125L35 10L41.875 6.875L45 0L48.125 6.875L55 10L48.125 13.125L45 20ZM45 55L41.875 48.125L35 45L41.875 41.875L45 35L48.125 41.875L55 45L48.125 48.125L45 55ZM20 47.5L13.75 33.75L0 27.5L13.75 21.25L20 7.5L26.25 21.25L40 27.5L26.25 33.75L20 47.5ZM20 35.375L22.5 30L27.875 27.5L22.5 25L20 19.625L17.5 25L12.125 27.5L17.5 30L20 35.375Z" fill="#3C83F6" fill-opacity="0.4"/>
            </svg>
          </div>
          <div className="w-[400px] mt-3">
            <div className="w-full" ref={googleButtonRef}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
