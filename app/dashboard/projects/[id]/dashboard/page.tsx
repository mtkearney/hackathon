'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import MermaidDiagram from '@/components/ui/MermaidDiagram';
import MilestoneSidebar from '@/components/dashboard/MilestoneSidebar';
import { fetchRepositoryTags, parseGitHubUrl, getTagBadgeUrl } from '@/lib/github/api';

// Define types
interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completionPercentage: number;
  tags: string[];
}

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
  milestones?: ProjectMilestone[];
}

export default function ProjectDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [githubTags, setGithubTags] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [repoInfo, setRepoInfo] = useState<{ owner: string; repo: string } | null>(null);
  const [mermaidDiagram, setMermaidDiagram] = useState<string>('');
  const [highlightedMilestoneId, setHighlightedMilestoneId] = useState<string | null>(null);
  
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

        // Mock milestones data for now (would come from the database in a real app)
        const mockMilestones: ProjectMilestone[] = [
          {
            id: '1',
            title: 'Project Setup',
            description: 'Initialize project structure and dependencies',
            dueDate: '2023-04-15',
            completionPercentage: 100,
            tags: ['setup', 'v1.0'],
          },
          {
            id: '2',
            title: 'Core Features Implementation',
            description: 'Implement core features of the application',
            dueDate: '2023-05-20',
            completionPercentage: 75,
            tags: ['feature', 'v1.0'],
          },
          {
            id: '3',
            title: 'Testing & Bug Fixes',
            description: 'Comprehensive testing and bug fixes',
            dueDate: '2023-06-10',
            completionPercentage: 30,
            tags: ['testing', 'v1.0'],
          },
          {
            id: '4',
            title: 'Documentation & Release',
            description: 'Finalize documentation and prepare for release',
            dueDate: '2023-06-30',
            completionPercentage: 10,
            tags: ['documentation', 'v1.0'],
          },
        ];

        // Calculate overall completion percentage
        const totalCompletion = mockMilestones.reduce((acc, milestone) => acc + milestone.completionPercentage, 0);
        const overallCompletion = Math.round(totalCompletion / mockMilestones.length);
        setCompletionPercentage(overallCompletion);

        setProject({ ...data, milestones: mockMilestones });
        
        // Fetch GitHub tags once we have the project
        fetchGitHubTags(data.name);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch project details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [params.id]);

  useEffect(() => {
    if (project) {
      generateMermaidDiagram();
    }
  }, [project, selectedFilter, highlightedMilestoneId]);

  const fetchGitHubTags = async (projectName: string) => {
    // In a real application, you would fetch tags from GitHub API using the GITHUB_API_KEY
    // For now, we'll use mock data
    const mockTags = ['v1.0', 'stable', 'beta', 'feature', 'bug', 'documentation', 'setup', 'testing'];
    setGithubTags(mockTags);
  };

  const generateMermaidDiagram = () => {
    if (!project) return;

    // Filter pages based on selected filter if any
    const filteredPages = selectedFilter 
      ? project.config.pages.filter(page => page.name.toLowerCase().includes(selectedFilter.toLowerCase()))
      : project.config.pages;

    // Build the Mermaid diagram
    let diagramContent = 'graph TD;\n';
    diagramContent += `subgraph "${project.name} Structure"\n`;
    
    // Add pages as nodes
    filteredPages.forEach((page, index) => {
      const pageId = `page${index}`;
      const pageCompletionStatus = getMockCompletionStatus(page.name);
      const color = getStatusColor(pageCompletionStatus);
      
      // If a milestone is highlighted, check if this page is related to it
      // This is a simplification - in a real app, you'd have actual relationships
      const isHighlighted = highlightedMilestoneId && isPageRelatedToMilestone(page.name, highlightedMilestoneId);
      const highlightStyle = isHighlighted ? ',stroke-width:4px' : '';
      
      diagramContent += `  ${pageId}["${page.name}"]:::${color}${isHighlighted ? '_highlight' : ''};\n`;
      
      // Add child features for this page
      const features = getMockFeaturesForPage(page.name);
      features.forEach((feature, featureIndex) => {
        const featureId = `${pageId}_feature${featureIndex}`;
        const featureCompletionStatus = feature.completionPercentage;
        const featureColor = getStatusColor(featureCompletionStatus);
        
        // Check if this feature is related to the highlighted milestone
        const isFeatureHighlighted = highlightedMilestoneId && 
          isFeatureRelatedToMilestone(feature.name, highlightedMilestoneId);
        
        diagramContent += `  ${featureId}["${feature.name}"]:::${featureColor}${isFeatureHighlighted ? '_highlight' : ''};\n`;
        diagramContent += `  ${pageId} --> ${featureId};\n`;
      });
    });
    
    // Add connections between pages based on dependencies
    addMockDependencies(filteredPages, diagramContent);
    
    diagramContent += 'end;\n';
    
    // Add style classes for status
    diagramContent += 'classDef green fill:#d4edda,stroke:#28a745,color:#155724;\n';
    diagramContent += 'classDef amber fill:#fff3cd,stroke:#ffc107,color:#856404;\n';
    diagramContent += 'classDef red fill:#f8d7da,stroke:#dc3545,color:#721c24;\n';
    
    // Add highlight classes
    diagramContent += 'classDef green_highlight fill:#d4edda,stroke:#28a745,color:#155724,stroke-width:4px;\n';
    diagramContent += 'classDef amber_highlight fill:#fff3cd,stroke:#ffc107,color:#856404,stroke-width:4px;\n';
    diagramContent += 'classDef red_highlight fill:#f8d7da,stroke:#dc3545,color:#721c24,stroke-width:4px;\n';

    setMermaidDiagram(diagramContent);
  };

  // Mock function to determine if a page is related to a milestone
  const isPageRelatedToMilestone = (pageName: string, milestoneId: string): boolean => {
    // In a real app, this would check actual relationships in your database
    // Here's a simplified version for mock data
    if (milestoneId === '1') { // Project Setup milestone
      return ['Login', 'Home'].includes(pageName);
    } else if (milestoneId === '2') { // Core Features milestone
      return ['Dashboard', 'Profile'].includes(pageName);
    } else if (milestoneId === '3') { // Testing milestone
      return ['Settings', 'Admin'].includes(pageName);
    }
    return false;
  };

  // Mock function to determine if a feature is related to a milestone
  const isFeatureRelatedToMilestone = (featureName: string, milestoneId: string): boolean => {
    // In a real app, this would check actual relationships in your database
    // Here's a simplified version for mock data
    if (milestoneId === '1') { // Project Setup milestone
      return ['Form Validation', 'Hero Section'].includes(featureName);
    } else if (milestoneId === '2') { // Core Features milestone
      return ['Analytics Widget', 'Recent Activity'].includes(featureName);
    } else if (milestoneId === '3') { // Testing milestone
      return ['OAuth Integration', 'Feature Highlights'].includes(featureName);
    }
    return false;
  };

  const getMockCompletionStatus = (pageName: string): number => {
    // Mock function to return completion status for pages
    const mockData: Record<string, number> = {
      'Home': 90,
      'Login': 100,
      'Dashboard': 70,
      'Profile': 60,
      'Settings': 40,
      'Admin': 20,
    };
    
    return mockData[pageName] || Math.floor(Math.random() * 100);
  };

  const getMockFeaturesForPage = (pageName: string) => {
    // Mock function to return features for a page
    const mockFeatures: Record<string, Array<{name: string, completionPercentage: number}>> = {
      'Home': [
        { name: 'Hero Section', completionPercentage: 100 },
        { name: 'Feature Highlights', completionPercentage: 85 },
        { name: 'Testimonials', completionPercentage: 70 },
      ],
      'Login': [
        { name: 'Form Validation', completionPercentage: 100 },
        { name: 'OAuth Integration', completionPercentage: 90 },
        { name: 'Password Reset', completionPercentage: 100 },
      ],
      'Dashboard': [
        { name: 'Analytics Widget', completionPercentage: 80 },
        { name: 'Recent Activity', completionPercentage: 70 },
        { name: 'Project Cards', completionPercentage: 60 },
      ],
    };
    
    return mockFeatures[pageName] || [
      { name: 'Feature 1', completionPercentage: Math.floor(Math.random() * 100) },
      { name: 'Feature 2', completionPercentage: Math.floor(Math.random() * 100) },
    ];
  };

  const addMockDependencies = (pages: any[], diagramContent: string) => {
    // This function would add mock dependencies between pages
    // In a real app, this data would come from your database
  };

  const getStatusColor = (percentage: number): string => {
    if (percentage >= 80) return 'green';
    if (percentage >= 40) return 'amber';
    return 'red';
  };

  const handleMilestoneClick = (milestoneId: string) => {
    // Toggle highlighting
    setHighlightedMilestoneId(
      highlightedMilestoneId === milestoneId ? null : milestoneId
    );
  };

  const handleFilterChange = (tagFilter: string | null) => {
    setSelectedFilter(tagFilter);
    // When changing filters, clear any highlighted milestone
    setHighlightedMilestoneId(null);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-3 text-gray-500">Loading project dashboard...</p>
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{project.name} Dashboard</h1>
          <div className="flex items-center mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-500">{completionPercentage}% Complete</span>
          </div>
          {repoInfo && (
            <div className="mt-2 flex items-center">
              <svg className="w-4 h-4 text-gray-500 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
              </svg>
              <a 
                href={`https://github.com/${repoInfo.owner}/${repoInfo.repo}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                {repoInfo.owner}/{repoInfo.repo}
              </a>
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => router.push(`/dashboard/projects/${params.id}`)}>
            Project Details
          </Button>
          <Button>Generate GitHub Issues</Button>
        </div>
      </div>

      {/* GitHub Tags Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by GitHub Tags</h3>
        <div className="flex flex-wrap gap-2">
          {selectedFilter && (
            <button
              onClick={() => handleFilterChange(null)}
              className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium hover:bg-indigo-200"
            >
              Clear Filter
            </button>
          )}
          {githubTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleFilterChange(tag)}
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                selectedFilter === tag 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {tag}
              {selectedFilter !== tag && (
                <span className="ml-1 text-xs text-gray-500">
                  ({project.milestones?.filter(m => m.tags.includes(tag)).length || 0})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Two Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Mermaid Diagram */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Visualization</h2>
          <div className="overflow-auto" style={{ minHeight: '500px' }}>
            {mermaidDiagram && (
              <MermaidDiagram 
                chart={mermaidDiagram} 
                className="w-full h-full"
              />
            )}
          </div>
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-200 border border-green-500 rounded-full mr-1"></div>
              <span>Complete (≥80%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-200 border border-yellow-500 rounded-full mr-1"></div>
              <span>In Progress (40-79%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-200 border border-red-500 rounded-full mr-1"></div>
              <span>To Do (&lt;40%)</span>
            </div>
          </div>
          {highlightedMilestoneId && (
            <div className="mt-2 py-2 px-3 bg-indigo-50 text-indigo-700 rounded-md flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>
                Showing components related to milestone: 
                <strong className="ml-1">
                  {project.milestones?.find(m => m.id === highlightedMilestoneId)?.title}
                </strong>
                <button 
                  className="ml-3 text-indigo-800 hover:text-indigo-900 underline text-sm"
                  onClick={() => setHighlightedMilestoneId(null)}
                >
                  Clear
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Right Panel - Milestones */}
        <div className="lg:col-span-1">
          {project.milestones && (
            <MilestoneSidebar
              milestones={project.milestones}
              onMilestoneClick={handleMilestoneClick}
              onFilterChange={(filter) => {
                // This is for the milestone sidebar's internal filters
                // Not directly connected to tag filters
                setHighlightedMilestoneId(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
} 