'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function NewProjectPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to project-startup page
    router.push('/project-startup');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Redirecting to Project Startup...</h1>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-6"></div>
      <p className="text-gray-600 mb-6">If you are not redirected automatically, please click the button below:</p>
      <Button onClick={() => router.push('/project-startup')}>
        Continue to Project Startup
      </Button>
    </div>
  );
} 