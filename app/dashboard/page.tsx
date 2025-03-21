import Link from 'next/link';
import Button from '@/components/ui/Button';
import ProjectCreationCard from '@/components/dashboard/ProjectCreationCard';

export default async function Dashboard() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Projects Dashboard</h1>
        <Link href="/dashboard/new-project">
          <Button>New Project</Button>
        </Link>
      </div>
      
      <ProjectCreationCard />
    </div>
  );
} 