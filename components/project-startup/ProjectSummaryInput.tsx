'use client';

import { useState } from 'react';

interface ProjectSummaryInputProps {
  summary: string;
  onSummaryChange: (summary: string) => void;
  onContinue: () => void;
}

export default function ProjectSummaryInput({ summary, onSummaryChange, onContinue }: ProjectSummaryInputProps) {
  // Local state to track validation errors
  const [error, setError] = useState<string>('');

  // Handle summary input change
  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onSummaryChange(e.target.value);
    // Clear any existing error when user types
    if (error) setError('');
  };

  // Validate and proceed to next step
  const handleContinue = () => {
    if (!summary.trim()) {
      setError('Please provide a project summary before continuing.');
      return;
    }
    onContinue();
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 transition-all">
      <h2 className="text-2xl font-semibold mb-4">Project Summary</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-2">
          Provide a concise summary of your project. This will help guide the setup process and 
          provide context for your development team.
        </p>
        
        <textarea
          value={summary}
          onChange={handleSummaryChange}
          className={`w-full h-32 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Describe your project's purpose, main features, and any specific requirements..."
        />
        
        {error && <p className="text-red-500 mt-1 text-sm">{error}</p>}
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Continue
        </button>
      </div>
    </div>
  );
}