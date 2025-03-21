'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/hooks/useSupabase';
import { createProject } from '@/lib/projects';
import ProjectSummaryInput from '../../components/project-startup/ProjectSummaryInput';
import TechnologyStackConfig from '../../components/project-startup/TechnologyStackConfig';
import AppLayoutConfig from '../../components/project-startup/AppLayoutConfig';
import SchemaConfig from '../../components/project-startup/SchemaConfig';
import FinalOverview from '../../components/project-startup/FinalOverview';
import Button from '@/components/ui/Button';

// Workflow steps enumeration
enum WorkflowStep {
  PROJECT_SUMMARY,
  TECH_STACK,
  APP_LAYOUT,
  SCHEMA_CONFIG,
  FINAL_OVERVIEW
}

// Project configuration type
interface ProjectConfig {
  summary: string;
  techStack: {
    default: boolean;
    technologies: string[];
    customTechnologies: string[];
  };
  appLayout: {
    pages: Array<{
      name: string;
      description: string;
    }>;
  };
  schema: {
    tables: Array<{
      name: string;
      fields: Array<{
        name: string;
        type: string;
        relations?: string;
      }>;
    }>;
  };
}

export default function ProjectStartupPage() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError, refreshSession } = useSupabase();
  
  // Track the current step in the workflow
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(WorkflowStep.PROJECT_SUMMARY);
  const [projectName, setProjectName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(true); // Set directly to true to skip auth checks
  
  // Authentication check disabled - we're allowing users without login
  useEffect(() => {
    // Skip all authentication redirects
    console.log('Authentication skipped for project startup page');
  }, []);
  
  // Initialize project configuration state
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>({
    summary: '',
    techStack: {
      default: true,
      technologies: ['Tailwind CSS', 'React', 'NextJS', 'Supabase', 'GitHub'],
      customTechnologies: []
    },
    appLayout: {
      pages: [
        { name: 'Login/Signup', description: 'User authentication' },
        { name: 'Home', description: 'Main landing page' },
        { name: 'Project Startup', description: 'Configure new projects' },
        { name: 'Project Tracking', description: 'Monitor project progress' },
        { name: 'Project Documentation', description: 'Store project documentation' }
      ]
    },
    schema: {
      tables: [
        {
          name: 'users',
          fields: [
            { name: 'id', type: 'uuid' },
            { name: 'email', type: 'text' },
            { name: 'name', type: 'text' }
          ]
        },
        {
          name: 'projects',
          fields: [
            { name: 'id', type: 'uuid' },
            { name: 'name', type: 'text' },
            { name: 'summary', type: 'text' },
            { name: 'user_id', type: 'uuid', relations: 'users.id' }
          ]
        }
      ]
    }
  });

  // Handle navigation between workflow steps
  const goToNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Update project configuration
  const updateProjectConfig = (updatedConfig: Partial<ProjectConfig>) => {
    setProjectConfig({
      ...projectConfig,
      ...updatedConfig
    });
  };

  // Attempt to refresh the session if needed
  const attemptSessionRefresh = async () => {
    try {
      const { session } = await refreshSession();
      return !!session;
    } catch (err) {
      console.error('Failed to refresh session:', err);
      return false;
    }
  };

  // Save project to database
  const saveProject = async () => {
    // Authentication check disabled

    if (!projectName.trim()) {
      setError('Please provide a project name.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Use a default user ID since authentication is disabled
      const userId = user?.id || '00000000-0000-0000-0000-000000000000';
      
      console.log('Creating project with user ID:', userId);
      // Use the helper function to create the project
      const result = await createProject({
        name: projectName,
        summary: projectConfig.summary,
        userId: userId,
        projectConfig
      });

      // Check if this is a local project (fallback from network error)
      if ('local' in result && result.local) {
        setError('Project saved locally due to network issues. It will sync when connectivity is restored.');
        // Do not redirect immediately for local projects
        setTimeout(() => {
          // Redirect to dashboard instead of the specific project
          router.push('/dashboard');
        }, 3000);
        return;
      }

      // Redirect to the new project page
      router.push(`/dashboard/projects/${result.id}`);
    } catch (err: any) {
      console.error('Error saving project:', err);
      
      // Handle specific authentication errors
      if (err.message?.includes('authentication') || err.message?.includes('log in') || err.message?.includes('JWT')) {
        setError('There was an authentication error. Continuing without authentication.');
        // Set longer timeout to show error before proceeding
        setTimeout(() => {
          setError(null);
        }, 3000);
      } else if (err.message?.includes('network') || err.message?.includes('connection')) {
        // Handle network errors with specific message
        setError('Network connection issue. Your project will be saved locally and synced when connection is restored.');
        // Add local project to localStorage as fallback
        try {
          const localId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
          const localProjects = JSON.parse(localStorage.getItem('localProjects') || '[]');
          localProjects.push({
            id: localId,
            name: projectName,
            summary: projectConfig.summary,
            user_id: user?.id || '00000000-0000-0000-0000-000000000000',
            config: {
              techStack: [
                ...projectConfig.techStack.technologies.map(name => ({
                  name,
                  isDefault: projectConfig.techStack.default
                })),
                ...projectConfig.techStack.customTechnologies.map(name => ({
                  name,
                  isDefault: false
                }))
              ],
              pages: projectConfig.appLayout.pages.map(page => ({
                ...page,
                isDefault: true
              })),
              schemaTables: projectConfig.schema.tables.map(table => ({
                name: table.name,
                description: '',
                isDefault: true,
                fields: table.fields.map(field => ({
                  name: field.name,
                  type: field.type,
                  required: field.name === 'id'
                }))
              }))
            },
            created_at: new Date().toISOString(),
            local: true,
            pendingSync: true
          });
          localStorage.setItem('localProjects', JSON.stringify(localProjects));
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } catch (storageErr) {
          console.error('Failed to store project locally:', storageErr);
          setError('Failed to save project locally. Please try again or save your configuration manually.');
        }
      } else {
        setError(err.message || 'Failed to save project. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the appropriate component based on the current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case WorkflowStep.PROJECT_SUMMARY:
        return (
          <ProjectSummaryInput 
            summary={projectConfig.summary} 
            onSummaryChange={(summary: string) => updateProjectConfig({ summary })}
            onContinue={goToNextStep}
          />
        );
      case WorkflowStep.TECH_STACK:
        return (
          <TechnologyStackConfig 
            techStack={projectConfig.techStack}
            onTechStackChange={(techStack) => updateProjectConfig({ techStack })}
            onNext={goToNextStep}
          />
        );
      case WorkflowStep.APP_LAYOUT:
        return (
          <AppLayoutConfig 
            appLayout={projectConfig.appLayout}
            onAppLayoutChange={(appLayout) => updateProjectConfig({ appLayout })}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case WorkflowStep.SCHEMA_CONFIG:
        return (
          <SchemaConfig 
            schema={projectConfig.schema}
            appLayout={projectConfig.appLayout}
            onSchemaChange={(schema) => updateProjectConfig({ schema })}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case WorkflowStep.FINAL_OVERVIEW:
        return (
          <div>
            <div className="mb-6">
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter a name for your project"
                required
              />
            </div>
            
            <FinalOverview 
              projectConfig={projectConfig}
              onConfirm={saveProject}
              onBack={goToPreviousStep}
              onEdit={(step: WorkflowStep) => setCurrentStep(step)}
            />
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                {error}
              </div>
            )}
            
            {isSubmitting && (
              <div className="mt-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-2"></div>
                <span>Saving project...</span>
              </div>
            )}
          </div>
        );
      default:
        return <div>Something went wrong</div>;
    }
  };

  // Skip loading state - render the form immediately
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Project Startup</h1>
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </div>
      {renderCurrentStep()}
    </div>
  );
}