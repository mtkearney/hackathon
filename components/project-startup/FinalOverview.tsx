'use client';

// Import the WorkflowStep enum
enum WorkflowStep {
  PROJECT_SUMMARY,
  TECH_STACK,
  APP_LAYOUT,
  SCHEMA_CONFIG,
  FEATURE_TREE,
  FINAL_OVERVIEW
}

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

interface FinalOverviewProps {
  projectConfig: ProjectConfig;
  onConfirm: () => void;
  onBack: () => void;
  onEdit: (step: WorkflowStep) => void;
}

export default function FinalOverview({ 
  projectConfig, 
  onConfirm, 
  onBack, 
  onEdit 
}: FinalOverviewProps) {
  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white rounded-lg shadow-md transition-all">
      {/* Fixed Header */}
      <div className="flex-none p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Project Overview</h2>
            <p className="text-gray-600 mt-1">
              Review your configuration before finalizing
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Project Name</p>
            <p className="text-lg font-medium text-gray-900">{projectConfig.summary}</p>
          </div>
        </div>
      </div>
      
      {/* Scrollable Content Area */}
      <div className="flex-grow overflow-y-auto p-6">
        <div className="space-y-4">
          {/* Project Summary Section */}
          <div className="border border-gray-200 rounded-md p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Project Summary</h3>
              <button
                onClick={() => onEdit(WorkflowStep.PROJECT_SUMMARY)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
            </div>
            <p className="text-gray-700">
              {projectConfig.summary}
            </p>
          </div>
          
          {/* Technology Stack Section */}
          <div className="border border-gray-200 rounded-md p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Technology Stack</h3>
              <button
                onClick={() => onEdit(WorkflowStep.TECH_STACK)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">
                {projectConfig.techStack.default ? 'Using default technology stack' : 'Using custom technology stack'}
              </p>
              <div className="mb-2">
                <h4 className="text-sm font-medium mb-1">Default Technologies:</h4>
                <div className="flex flex-wrap gap-2">
                  {projectConfig.techStack.technologies.map((tech, index) => (
                    <span 
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm ${
                        projectConfig.techStack.default ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              
              {!projectConfig.techStack.default && projectConfig.techStack.customTechnologies.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Custom Technologies:</h4>
                  <div className="flex flex-wrap gap-2">
                    {projectConfig.techStack.customTechnologies.map((tech, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* App Layout Section */}
          <div className="border border-gray-200 rounded-md p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">App Layout & Routing</h3>
              <button
                onClick={() => onEdit(WorkflowStep.APP_LAYOUT)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Pages:</h4>
              <div className="space-y-2">
                {projectConfig.appLayout.pages.map((page, index) => (
                  <div key={index} className="p-2 border border-gray-200 rounded-md">
                    <h5 className="font-medium">{page.name}</h5>
                    <p className="text-sm text-gray-600">{page.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Schema Section */}
          <div className="border border-gray-200 rounded-md p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Database Schema</h3>
              <button
                onClick={() => onEdit(WorkflowStep.SCHEMA_CONFIG)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
            </div>
            <div className="space-y-4">
              {projectConfig.schema.tables.map((table, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-3">
                  <h4 className="font-medium mb-2">{table.name}</h4>
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-2 border-b">Field</th>
                        <th className="text-left p-2 border-b">Type</th>
                        <th className="text-left p-2 border-b">Relations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.fields.map((field, fieldIndex) => (
                        <tr key={fieldIndex} className="border-b border-gray-100">
                          <td className="p-2">{field.name}</td>
                          <td className="p-2 text-gray-600">{field.type}</td>
                          <td className="p-2 text-blue-600">{field.relations || '-'}</td>
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
      
      {/* Fixed Footer with Buttons */}
      <div className="flex-none p-6 border-t border-gray-200 bg-white flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Confirm & Finalize
        </button>
      </div>
    </div>
  );
} 