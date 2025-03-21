'use client';

import { useState, useEffect } from 'react';
import { generateAppStructureFromSchema } from '@/lib/llm';

interface Page {
  name: string;
  description: string;
  path?: string; // Optional path for the route
}

interface AppLayout {
  pages: Page[];
}

interface AppLayoutConfigProps {
  appLayout: AppLayout;
  onAppLayoutChange: (appLayout: AppLayout) => void;
  onNext: () => void;
  onBack: () => void;
  projectSummary: string;
  schema: any[];
}

export default function AppLayoutConfig({ 
  appLayout, 
  onAppLayoutChange, 
  onNext, 
  onBack,
  projectSummary,
  schema
}: AppLayoutConfigProps) {
  // Local state for new page input
  const [newPage, setNewPage] = useState<Page>({ name: '', description: '', path: '' });
  const [error, setError] = useState<string>('');
  const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Add a new page
  const addPage = () => {
    if (!newPage.name.trim()) {
      setError('Page name is required');
      return;
    }
    
    // Generate a path if not provided
    const path = newPage.path || `/${newPage.name.toLowerCase().replace(/\s+/g, '-')}`;
    
    onAppLayoutChange({
      pages: [...appLayout.pages, { ...newPage, path }]
    });
    
    setNewPage({ name: '', description: '', path: '' });
    setError('');
  };

  // Remove a page
  const removePage = (index: number) => {
    const updatedPages = [...appLayout.pages];
    updatedPages.splice(index, 1);
    
    onAppLayoutChange({
      pages: updatedPages
    });
    
    // Reset selected page if it was deleted
    if (selectedPageIndex === index) {
      setSelectedPageIndex(null);
    } else if (selectedPageIndex !== null && selectedPageIndex > index) {
      // Adjust selected index if a page before it was removed
      setSelectedPageIndex(selectedPageIndex - 1);
    }
  };

  // Move a page up in the list
  const movePageUp = (index: number) => {
    if (index === 0) return;
    
    const updatedPages = [...appLayout.pages];
    const temp = updatedPages[index];
    updatedPages[index] = updatedPages[index - 1];
    updatedPages[index - 1] = temp;
    
    onAppLayoutChange({
      pages: updatedPages
    });
    
    // Update selected index if it was moved
    if (selectedPageIndex === index) {
      setSelectedPageIndex(index - 1);
    } else if (selectedPageIndex === index - 1) {
      setSelectedPageIndex(index);
    }
  };

  // Move a page down in the list
  const movePageDown = (index: number) => {
    if (index === appLayout.pages.length - 1) return;
    
    const updatedPages = [...appLayout.pages];
    const temp = updatedPages[index];
    updatedPages[index] = updatedPages[index + 1];
    updatedPages[index + 1] = temp;
    
    onAppLayoutChange({
      pages: updatedPages
    });
    
    // Update selected index if it was moved
    if (selectedPageIndex === index) {
      setSelectedPageIndex(index + 1);
    } else if (selectedPageIndex === index + 1) {
      setSelectedPageIndex(index);
    }
  };

  // Select a page for detailed view
  const selectPage = (index: number) => {
    setSelectedPageIndex(selectedPageIndex === index ? null : index);
  };

  // Function to generate app structure from project summary and schema
  const generateAppStructureHandler = async () => {
    if (!projectSummary?.trim()) {
      setGenerationError('A project summary is required to generate the app structure.');
      return;
    }

    if (!schema?.length) {
      setGenerationError('Please go back to the schema page and define or generate a schema first.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      // Format schema for the LLM
      const formattedSchema = {
        tables: schema.map(table => ({
          name: table.name,
          description: table.description,
          fields: table.fields.map(field => ({
            name: field.name,
            type: field.type,
            description: field.description,
            required: field.required,
            relations: field.relations
          }))
        }))
      };

      const generatedStructure = await generateAppStructureFromSchema(projectSummary, formattedSchema);
      
      // Convert generated app structure to our format
      const convertedPages = {
        pages: generatedStructure.pages.map(page => ({
          name: page.name,
          path: page.route,
          description: page.description
        }))
      };

      // Update app layout with generated data
      onAppLayoutChange(convertedPages);
      
      // If we have recommendations, show them in a toast or similar UI element
      if (generatedStructure.recommendations) {
        console.log('App structure recommendations:', generatedStructure.recommendations);
        // TODO: Display recommendations to user
      }
    } catch (error) {
      console.error('Error generating app structure:', error);
      setGenerationError('Failed to generate app structure. Please try again or adjust your schema and project summary.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-6 transition-all">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Application Structure Configuration</h2>
        <button
          onClick={generateAppStructureHandler}
          disabled={isGenerating}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Generate App Structure'}
        </button>
      </div>
      
      {generationError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {generationError}
        </div>
      )}
      
      <h2 className="text-2xl font-semibold mb-4">App Layout & Routing</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left column - Page list */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-3">Pages</h3>
            <p className="text-gray-600 text-sm mb-4">
              Define the pages of your application and their order.
            </p>
            
            <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
              {appLayout.pages.length === 0 ? (
                <div className="text-center py-6 text-gray-500 italic">
                  No pages defined yet. Add your first page below.
                </div>
              ) : (
                appLayout.pages.map((page, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center p-2 border rounded-md cursor-pointer transition-colors ${
                      selectedPageIndex === index 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => selectPage(index)}
                  >
                    <div className="flex-grow truncate">
                      <div className="font-medium">{page.name}</div>
                      <div className="text-xs text-gray-500 truncate">{page.path}</div>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); movePageUp(index); }}
                        disabled={index === 0}
                        className={`p-1 rounded-md ${
                          index === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'
                        }`}
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); movePageDown(index); }}
                        disabled={index === appLayout.pages.length - 1}
                        className={`p-1 rounded-md ${
                          index === appLayout.pages.length - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'
                        }`}
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removePage(index); }}
                        className="p-1 text-red-600 hover:bg-red-100 rounded-md"
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Add new page form */}
            <div className="border border-gray-200 rounded-md p-3 bg-white">
              <h4 className="font-medium text-sm mb-2">Add New Page</h4>
              <div className="space-y-2">
                <div>
                  <input
                    type="text"
                    value={newPage.name}
                    onChange={(e) => setNewPage({ ...newPage, name: e.target.value })}
                    className={`w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      error ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Page Name (e.g., User Profile)"
                  />
                  {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    value={newPage.path || ''}
                    onChange={(e) => setNewPage({ ...newPage, path: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Route Path (e.g., /profile) - optional"
                  />
                </div>
                <div>
                  <textarea
                    value={newPage.description}
                    onChange={(e) => setNewPage({ ...newPage, description: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Short description of this page"
                    rows={2}
                  />
                </div>
                <button
                  onClick={addPage}
                  className="w-full py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Page
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column - Page flow visualization and details */}
        <div className="lg:col-span-2">
          {/* Flow visualization */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
            <h3 className="text-lg font-medium mb-3">Navigation Flow</h3>
            <div className="h-[200px] bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
              {appLayout.pages.length === 0 ? (
                <p className="text-gray-500 text-center">Add pages to visualize your app's navigation flow</p>
              ) : (
                <div className="w-full h-full overflow-x-auto p-4">
                  <div className="flex items-center justify-start space-x-4 min-w-max">
                    {appLayout.pages.map((page, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className={`w-32 p-2 border rounded-md text-center text-sm ${
                            selectedPageIndex === index 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : 'border-gray-300 bg-white'
                          }`}
                          onClick={() => selectPage(index)}
                        >
                          <div className="font-medium truncate">{page.name}</div>
                          <div className="text-xs text-gray-500 truncate">{page.path}</div>
                        </div>
                        {index < appLayout.pages.length - 1 && (
                          <div className="flex items-center mt-2">
                            <div className="h-0.5 w-8 bg-gray-300"></div>
                            <div className="text-gray-500">→</div>
                            <div className="h-0.5 w-8 bg-gray-300"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Selected page details */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-3">Page Details</h3>
            {selectedPageIndex !== null && selectedPageIndex < appLayout.pages.length ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Name</h4>
                  <p className="text-lg font-semibold">{appLayout.pages[selectedPageIndex].name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Path</h4>
                  <p className="text-md font-mono bg-gray-50 p-1 rounded">{appLayout.pages[selectedPageIndex].path}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Description</h4>
                  <p className="text-md">{appLayout.pages[selectedPageIndex].description || 'No description provided'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Position</h4>
                  <p className="text-md">
                    {selectedPageIndex === 0 ? 'First page' : ''}
                    {selectedPageIndex > 0 && selectedPageIndex < appLayout.pages.length - 1 ? `Page ${selectedPageIndex + 1} of ${appLayout.pages.length}` : ''}
                    {selectedPageIndex === appLayout.pages.length - 1 && selectedPageIndex !== 0 ? 'Last page' : ''}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">
                {appLayout.pages.length === 0 
                  ? 'Add pages to see details here' 
                  : 'Select a page from the list to view its details'}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Next
        </button>
      </div>
    </div>
  );
}