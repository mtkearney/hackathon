'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';

interface ProjectDetail {
  id: string;
  name: string;
  summary: string;
  created_at: string;
  config: {
    techStack: { name: string; isDefault: boolean }[];
    pages: { name: string; description: string; isDefault: boolean }[];
    schemaTables: {
      name: string;
      description: string;
      isDefault: boolean;
      fields: { name: string; type: string; required: boolean }[];
    }[];
  };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const projectId = params.id;
    
    const fetchProject = async () => {
      try {
        const { data, error } = await createClient()
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (error) throw error;
        setProject(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch project details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-3 text-gray-500">Loading project details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
        {error}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">Project not found</p>
        <Button 
          className="mt-4"
          onClick={() => router.push('/dashboard/projects')}
        >
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
        <div className="flex space-x-3">
          <Button variant="outline">Edit Project</Button>
          <Button 
            variant="outline"
            onClick={() => router.push(`/dashboard/projects/${params.id}/dashboard`)}
          >
            Project Dashboard
          </Button>
          <Button>Generate GitHub Issues</Button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Project Details</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Created on {new Date(project.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <p className="text-gray-700">{project.summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Technology Stack</h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {project.config.techStack.map((tech, index) => (
                <li key={index} className="px-4 py-3">
                  <div className="flex items-center">
                    <span className="font-medium">{tech.name}</span>
                    {tech.isDefault && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Application Pages</h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {project.config.pages.map((page, index) => (
                <li key={index} className="px-4 py-3">
                  <div>
                    <span className="font-medium">{page.name}</span>
                    {page.isDefault && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{page.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Database Schema</h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {project.config.schemaTables.map((table, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-lg">
                    {table.name} 
                    <span className="ml-2 text-sm font-normal text-gray-500">({table.description})</span>
                  </h4>
                  <table className="mt-2 min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Field
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Required
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {table.fields.map((field, fieldIndex) => (
                        <tr key={fieldIndex}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            {field.name}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {field.type}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {field.required ? 'Yes' : 'No'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 