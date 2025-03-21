'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';

interface ProjectCreationCardProps {
  compact?: boolean;
}

export default function ProjectCreationCard({ compact = false }: ProjectCreationCardProps) {
  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-md ${!compact && 'p-12 text-center'}`}>
      {!compact ? (
        <>
          <p className="text-lg mb-4 text-gray-500">You don't have any projects yet.</p>
          <Link href="/dashboard/new-project">
            <Button variant="primary">Create your first project</Button>
          </Link>
        </>
      ) : (
        <div className="p-6 border border-dashed border-gray-300 rounded-lg hover:border-indigo-500 transition-colors flex flex-col items-center justify-center text-center">
          <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Create a new project</h3>
          <p className="text-sm text-gray-500 mb-4">Start by setting up your project configuration</p>
          <Link href="/dashboard/new-project">
            <Button variant="primary" className="w-full">Start New Project</Button>
          </Link>
        </div>
      )}
    </div>
  );
} 