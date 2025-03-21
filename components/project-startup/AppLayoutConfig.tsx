'use client';

import { useState } from 'react';

interface Page {
  name: string;
  description: string;
}

interface AppLayout {
  pages: Page[];
}

interface AppLayoutConfigProps {
  appLayout: AppLayout;
  onAppLayoutChange: (appLayout: AppLayout) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function AppLayoutConfig({ 
  appLayout, 
  onAppLayoutChange, 
  onNext, 
  onBack 
}: AppLayoutConfigProps) {
  // Local state for new page input
  const [newPage, setNewPage] = useState<Page>({ name: '', description: '' });
  const [error, setError] = useState<string>('');

  // Add a new page
  const addPage = () => {
    if (!newPage.name.trim()) {
      setError('Page name is required');
      return;
    }
    
    onAppLayoutChange({
      pages: [...appLayout.pages, { ...newPage }]
    });
    
    setNewPage({ name: '', description: '' });
    setError('');
  };

  // Remove a page
  const removePage = (index: number) => {
    const updatedPages = [...appLayout.pages];
    updatedPages.splice(index, 1);
    
    onAppLayoutChange({
      pages: updatedPages
    });
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
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 transition-all">
      <h2 className="text-2xl font-semibold mb-4">App Layout & Routing</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Pages Configuration</h3>
        <p className="text-gray-600 mb-4">
          Define the pages and functionality of your application. You can add, remove, and reorder pages to 
          set up your app's routing structure.
        </p>
        
        <div className="space-y-4 mb-6">
          {appLayout.pages.map((page, index) => (
            <div key={index} className="flex items-start p-3 border border-gray-200 rounded-md bg-gray-50">
              <div className="flex-grow">
                <h4 className="font-medium">{page.name}</h4>
                <p className="text-sm text-gray-600">{page.description}</p>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => movePageUp(index)}
                  disabled={index === 0}
                  className={`p-1 rounded-md ${
                    index === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => movePageDown(index)}
                  disabled={index === appLayout.pages.length - 1}
                  className={`p-1 rounded-md ${
                    index === appLayout.pages.length - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  onClick={() => removePage(index)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded-md"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
          <h4 className="font-medium mb-2">Add New Page</h4>
          <div className="space-y-3">
            <div>
              <label htmlFor="pageName" className="block text-sm font-medium text-gray-700 mb-1">
                Page Name
              </label>
              <input
                id="pageName"
                type="text"
                value={newPage.name}
                onChange={(e) => setNewPage({ ...newPage, name: e.target.value })}
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., User Profile"
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <div>
              <label htmlFor="pageDesc" className="block text-sm font-medium text-gray-700 mb-1">
                Page Description
              </label>
              <input
                id="pageDesc"
                type="text"
                value={newPage.description}
                onChange={(e) => setNewPage({ ...newPage, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g., Displays user profile information and settings"
              />
            </div>
            <button
              onClick={addPage}
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Page
            </button>
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