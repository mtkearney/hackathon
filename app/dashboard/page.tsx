import Link from 'next/link';
import Button from '@/components/ui/Button';

export default async function Dashboard() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Projects Dashboard</h1>
        <Link href="/dashboard/new-project">
          <Button>New Project</Button>
        </Link>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="p-12 text-center text-gray-500">
          <p className="text-lg mb-4">You don't have any projects yet.</p>
          <Link href="/dashboard/new-project">
            <Button variant="primary">Create your first project</Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 