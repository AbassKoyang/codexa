'use client'
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  console.log('ProtectedRoute: Current state', { user, loading });

  useEffect(() => {
    if (!loading && !user) {
      console.log('ProtectedRoute: Redirecting to auth');
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tokyo-bg">
        <div className="flex items-center justify-center p-0.5 border border-tokyo-blue border-dashed relative animate-pulse">
            <svg className='size-5' width="30" height="24" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 24C2.175 24 1.46875 23.7062 0.88125 23.1187C0.29375 22.5312 0 21.825 0 21V3C0 2.175 0.29375 1.46875 0.88125 0.88125C1.46875 0.29375 2.175 0 3 0H27C27.825 0 28.5312 0.29375 29.1187 0.88125C29.7062 1.46875 30 2.175 30 3V21C30 21.825 29.7062 22.5312 29.1187 23.1187C28.5312 23.7062 27.825 24 27 24H3ZM3 21H27V6H3V21ZM8.25 19.5L6.15 17.4L10.0125 13.5L6.1125 9.6L8.25 7.5L14.25 13.5L8.25 19.5ZM15 19.5V16.5H24V19.5H15Z" fill="#3C83F6" />
            </svg>
          </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tokyo-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center p-0.5 border border-tokyo-blue border-dashed relative animate-pulse">
            <svg className='size-5' width="30" height="24" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 24C2.175 24 1.46875 23.7062 0.88125 23.1187C0.29375 22.5312 0 21.825 0 21V3C0 2.175 0.29375 1.46875 0.88125 0.88125C1.46875 0.29375 2.175 0 3 0H27C27.825 0 28.5312 0.29375 29.1187 0.88125C29.7062 1.46875 30 2.175 30 3V21C30 21.825 29.7062 22.5312 29.1187 23.1187C28.5312 23.7062 27.825 24 27 24H3ZM3 21H27V6H3V21ZM8.25 19.5L6.15 17.4L10.0125 13.5L6.1125 9.6L8.25 7.5L14.25 13.5L8.25 19.5ZM15 19.5V16.5H24V19.5H15Z" fill="#3C83F6" />
            </svg>
          </div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}