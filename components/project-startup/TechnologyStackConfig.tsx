'use client';

import { useState } from 'react';

interface TechStack {
  default: boolean;
  technologies: string[];
  customTechnologies: string[];
}

interface TechnologyStackConfigProps {
  techStack: TechStack;
  onTechStackChange: (techStack: TechStack) => void;
  onNext: () => void;
}

export default function TechnologyStackConfig({ 
  techStack, 
  onTechStackChange, 
  onNext 
}: TechnologyStackConfigProps) {
  // Local state for custom technology input
  const [newTech, setNewTech] = useState<string>('');

  // Toggle between default and custom tech stack
  const toggleDefaultStack = () => {
    onTechStackChange({
      ...techStack,
      default: !techStack.default
    });
  };

  // Add a custom technology
  const addCustomTechnology = () => {
    if (!newTech.trim()) return;
    
    onTechStackChange({
      ...techStack,
      customTechnologies: [...techStack.customTechnologies, newTech.trim()]
    });
    
    setNewTech('');
  };

  // Remove a custom technology
  const removeCustomTechnology = (index: number) => {
    const updatedCustomTech = [...techStack.customTechnologies];
    updatedCustomTech.splice(index, 1);
    
    onTechStackChange({
      ...techStack,
      customTechnologies: updatedCustomTech
    });
  };

  // Handle key press for adding new technology
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomTechnology();
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 transition-all">
      <h2 className="text-2xl font-semibold mb-4">Technology Stack Configuration</h2>
      
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={techStack.default}
              onChange={toggleDefaultStack}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900">Use Default Stack</span>
          </label>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Default Technologies</h3>
          <div className="flex flex-wrap gap-2">
            {techStack.technologies.map((tech, index) => (
              <span 
                key={index} 
                className={`px-3 py-1 rounded-full text-sm ${
                  techStack.default ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
        
        {!techStack.default && (
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Custom Technologies</h3>
            
            <div className="flex mb-2">
              <input
                type="text"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Add a technology..."
                className="flex-grow p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                onClick={addCustomTechnology}
                className="px-4 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {techStack.customTechnologies.map((tech, index) => (
                <div 
                  key={index} 
                  className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tech}
                  <button
                    onClick={() => removeCustomTechnology(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                  >
                    ×
                  </button>
                </div>
              ))}
              {techStack.customTechnologies.length === 0 && (
                <p className="text-gray-500 text-sm">No custom technologies added yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-end">
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