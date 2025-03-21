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
  status?: 'draft' | 'active' | 'completed';
  github_issues_generated?: boolean;
  github_issues_url?: string;
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
  const [isGeneratingIssues, setIsGeneratingIssues] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const projectId = params.id;
    
    const fetchProject = async () => {
      try {
        const supabase = createClient();
        
        // Check for auth session first
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Auth session error:', sessionError);
          setError('Failed to verify authentication. Please try logging in again.');
          setIsLoading(false);
          return;
        }
        
        if (!sessionData.session) {
          console.log('No active session found');
          setError('Authentication required. Please log in again.');
          setIsLoading(false);
          return;
        }
        
        console.log('Fetching project with ID:', projectId);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }

        if (!data) {
          console.log('No project found with ID:', projectId);
          setError('Project not found');
          setIsLoading(false);
          return;
        }

        console.log('Project data retrieved:', data);
        setProject(data);
      } catch (err: any) {
        console.error('Project fetch error:', err);
        setError(err.message || 'Failed to fetch project details');
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    } else {
      console.error('No project ID provided');
      setError('No project ID provided');
      setIsLoading(false);
    }
  }, [params.id]);

  const handleGenerateGitHubIssues = async () => {
    if (!project || project.github_issues_generated) return;
    
    setIsGeneratingIssues(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Create a GitHub repository name from the project name
      const repoName = project.name.toLowerCase().replace(/\s+/g, '-');
      
      // Simulate API call to GitHub (in a real app, this would connect to GitHub API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate issues based on project config
      const issuesUrl = `https://github.com/mtkearney/hackathon/issues`;
      
      // Update the project in Supabase
      const supabase = createClient();
      const { error } = await supabase
        .from('projects')
        .update({
          github_issues_generated: true,
          github_issues_url: issuesUrl,
          status: 'active'
        })
        .eq('id', project.id);
      
      if (error) throw error;
      
      // Update local state
      setProject({
        ...project,
        github_issues_generated: true,
        github_issues_url: issuesUrl,
        status: 'active'
      });
      
      setSuccessMessage('GitHub issues generated successfully! Redirecting to project dashboard...');
      
      // Wait a moment to show the success message, then redirect to the dashboard
      setTimeout(() => {
        router.push(`/dashboard/projects/${project.id}/dashboard`);
      }, 1500);
      
    } catch (err: any) {
      console.error('Failed to generate GitHub issues:', err);
      setError(err.message || 'Failed to generate GitHub issues. Please try again.');
      setIsGeneratingIssues(false);
    }
  };

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
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
          <div className="mt-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              project.status === 'active' ? 'bg-green-100 text-green-800' :
              project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {project.status === 'active' ? 'Active' : 
              project.status === 'completed' ? 'Completed' : 'Draft'}
            </span>
          </div>
        </div>
        <div>
          {!project.github_issues_generated ? (
            <Button 
              onClick={handleGenerateGitHubIssues}
              isLoading={isGeneratingIssues}
              disabled={isGeneratingIssues}
            >
              {isGeneratingIssues ? 'Generating Issues...' : 'Generate GitHub Issues'}
            </Button>
          ) : (
            <div className="flex space-x-3">
              <a 
                href={project.github_issues_url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline">
                  View GitHub Issues
                </Button>
              </a>
              <Button 
                variant="outline"
                onClick={() => router.push(`/dashboard/projects/${project.id}/dashboard`)}
              >
                Project Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-600 p-4 rounded-md">
          {successMessage}
        </div>
      )}

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
                    <span className="ml-2 text-sm font-normal text-gray-500">({table.description || 'No description'})</span>
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
