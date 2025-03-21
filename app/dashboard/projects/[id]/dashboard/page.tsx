'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import MermaidDiagram from '@/components/ui/MermaidDiagram';
import MilestoneSidebar from '@/components/dashboard/MilestoneSidebar';
import { fetchRepositoryTags, parseGitHubUrl, getTagBadgeUrl } from '@/lib/github/api';
import { toast } from 'react-hot-toast';

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
  const [isGeneratingIssues, setIsGeneratingIssues] = useState(false);
  const [githubIssues, setGithubIssues] = useState<any[]>([]);
  
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

        // Parse GitHub URL and set repo info
        if (data.github_issues_url) {
          const { owner, repo } = parseGitHubUrl(data.github_issues_url);
          setRepoInfo({ owner, repo });
          
          // Fetch GitHub issues
          try {
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`);
            const issues = await response.json();
            setGithubIssues(issues);
            
            // Calculate completion based on actual issues
            const closedIssues = issues.filter((issue: any) => issue.state === 'closed').length;
            const totalIssues = issues.length;
            const completion = totalIssues > 0 ? Math.round((closedIssues / totalIssues) * 100) : 0;
            setCompletionPercentage(completion);
            
            // Create milestones from issues
            const milestonesFromIssues = issues.map((issue: any) => ({
              id: issue.number.toString(),
              title: issue.title,
              description: issue.body || 'No description provided',
              dueDate: issue.milestone?.due_on || new Date().toISOString(),
              completionPercentage: issue.state === 'closed' ? 100 : 30,
              tags: issue.labels.map((label: any) => label.name),
            }));
            
            setProject({ ...data, milestones: milestonesFromIssues });
          } catch (err) {
            console.error('Error fetching GitHub issues:', err);
            setProject(data);
          }
        } else {
          setProject(data);
        }
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

  // Function to generate GitHub issues from project data
  const generateGitHubIssues = async () => {
    if (!project) return;
    
    try {
      setIsGeneratingIssues(true);
      
      const response = await fetch('/api/github/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          projectName: project.name,
          projectConfig: project.config
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate GitHub issues');
      }
      
      const data = await response.json();
      
      // Update the project state to reflect that issues have been generated
      setProject({
        ...project,
        github_issues_generated: true
      });
      
      // Update the repoInfo if not already set
      if (!repoInfo && data.repoUrl) {
        const parsed = parseGitHubUrl(data.repoUrl);
        setRepoInfo(parsed);
      }
      
      // Refresh GitHub issues
      if (repoInfo) {
        const issuesResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/issues`);
        const issues = await issuesResponse.json();
        setGithubIssues(issues);
        
        // Create milestones from issues
        const milestonesFromIssues = issues.map((issue: any) => ({
          id: issue.number.toString(),
          title: issue.title,
          description: issue.body || 'No description provided',
          dueDate: issue.milestone?.due_on || new Date().toISOString(),
          completionPercentage: issue.state === 'closed' ? 100 : 30,
          tags: issue.labels.map((label: any) => label.name),
        }));
        
        setProject({
          ...project,
          github_issues_generated: true,
          milestones: milestonesFromIssues
        });
      }
      
      // Also update the project in the database
      await createClient()
        .from('projects')
        .update({ github_issues_generated: true })
        .eq('id', project.id);
      
      toast.success(`Successfully created GitHub issues!`);
      
      // Open GitHub repository in a new tab
      if (data.repoUrl) {
        window.open(data.repoUrl, '_blank');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error generating GitHub issues');
      console.error('Error generating GitHub issues:', error);
    } finally {
      setIsGeneratingIssues(false);
    }
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
    <div className="flex flex-col h-screen">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {project?.name || 'Project Dashboard'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {project?.summary || 'Loading project details...'}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/projects')}
              >
                Back to Projects
              </Button>
              
              {/* Add the GitHub issues generation button here */}
              <Button
                variant="primary"
                onClick={generateGitHubIssues}
                disabled={isGeneratingIssues || !project || project.github_issues_generated}
                className="flex items-center"
              >
                {isGeneratingIssues ? (
                  <>
                    <div className="w-4 h-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    Generating...
                  </>
                ) : project?.github_issues_generated ? (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Issues Generated
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Generate GitHub Issues
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <div>
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
        </div>
      </div>

      {/* Main Content - Two Panel Layout */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 h-full">
          {/* Left Panel - Mermaid Diagram */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Visualization</h2>
              <div className="overflow-auto" style={{ minHeight: '500px' }}>
                {mermaidDiagram && (
                  <MermaidDiagram 
                    chart={mermaidDiagram} 
                    className="w-full h-full"
                  />
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
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
            </div>
          </div>

          {/* Right Panel - Milestones */}
          <div className="lg:col-span-1 overflow-auto">
            {project?.milestones && (
              <MilestoneSidebar
                milestones={project.milestones}
                onMilestoneClick={handleMilestoneClick}
                onFilterChange={(filter) => {
                  setHighlightedMilestoneId(null);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 