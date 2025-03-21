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
  const [authChecked, setAuthChecked] = useState(false);
  
  // Check authentication status and redirect if needed
  useEffect(() => {
    // Skip if still loading
    if (authLoading) {
      return;
    }
    
    // If authentication check completed and user not logged in, redirect
    if (!authLoading && !user && !authChecked) {
      console.log('No user detected, redirecting to login');
      setAuthChecked(true);
      router.push('/login?redirectTo=/project-startup');
    }
    
    // Mark auth as checked if we have a user
    if (!authLoading && user && !authChecked) {
      console.log('User authenticated:', user.id);
      setAuthChecked(true);
    }
  }, [user, authLoading, authChecked, router]);
  
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
    // Check if auth is still loading
    if (authLoading) {
      setError('Authentication is still loading. Please try again in a moment.');
      return;
    }

    if (!user) {
      console.error('No authenticated user found');
      
      // Try to refresh the session in case it expired
      const sessionRefreshed = await attemptSessionRefresh();
      
      if (!sessionRefreshed) {
        setError('You must be logged in to create a project. Please log in and try again.');
        // Redirect to login
        router.push('/login?redirectTo=/project-startup');
        return;
      }
    }

    if (!projectName.trim()) {
      setError('Please provide a project name.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (!user?.id) {
        throw new Error('User ID is missing. Please log in again.');
      }
      
      console.log('Creating project with user ID:', user.id);
      // Use the helper function to create the project
      const result = await createProject({
        name: projectName,
        summary: projectConfig.summary,
        userId: user.id,
        projectConfig
      });

      // Redirect to the new project page
      router.push(`/dashboard/projects/${result.id}`);
    } catch (err: any) {
      console.error('Error saving project:', err);
      
      // Handle specific authentication errors
      if (err.message?.includes('authentication') || err.message?.includes('log in') || err.message?.includes('JWT')) {
        setError('Your session has expired. Please log in again.');
        router.push('/login?redirectTo=/project-startup');
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

  // Check if we need to redirect or show a loading state
  const shouldShowLoadingState = authLoading || (!user && !authChecked);
  
  // If loading has taken more than 5 seconds, show a message and option to go to login
  const [showLoginOption, setShowLoginOption] = useState(false);
  useEffect(() => {
    if (shouldShowLoadingState) {
      const timeout = setTimeout(() => {
        setShowLoginOption(true);
      }, 5000);
      
      return () => clearTimeout(timeout);
    } else {
      setShowLoginOption(false);
    }
  }, [shouldShowLoadingState]);

  return (
    <div className="container mx-auto px-4 py-8">
      {shouldShowLoadingState ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-4"></div>
          <span className="mb-4">Loading authentication...</span>
          
          {showLoginOption && (
            <div className="text-center mt-4">
              <p className="text-gray-600 mb-2">Loading is taking longer than expected.</p>
              <Button 
                variant="primary" 
                onClick={() => router.push('/login?redirectTo=/project-startup')}
              >
                Go to Login
              </Button>
            </div>
          )}
        </div>
      ) : authError ? (
        <div className="text-center p-8">
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md mb-4">
            Authentication error: {authError.message || 'Failed to authenticate'}
          </div>
          <Button 
            variant="primary" 
            onClick={() => router.push('/login?redirectTo=/project-startup')}
          >
            Go to Login
          </Button>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}