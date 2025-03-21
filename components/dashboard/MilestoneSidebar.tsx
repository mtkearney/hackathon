'use client';

import { useState } from 'react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completionPercentage: number;
  tags: string[];
}

interface MilestoneSidebarProps {
  milestones: Milestone[];
  onMilestoneClick?: (milestoneId: string) => void;
  onFilterChange?: (filter: string | null) => void;
}

/**
 * A sidebar component for displaying project milestones with timeline visualization
 */
export default function MilestoneSidebar({ 
  milestones, 
  onMilestoneClick,
  onFilterChange
}: MilestoneSidebarProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Filter milestones based on the selected filter
  const filteredMilestones = activeFilter
    ? milestones.filter(milestone => {
        if (activeFilter === 'in-progress') {
          return milestone.completionPercentage > 0 && milestone.completionPercentage < 100;
        } else if (activeFilter === 'completed') {
          return milestone.completionPercentage === 100;
        } else if (activeFilter === 'upcoming') {
          return milestone.completionPercentage === 0;
        }
        return true;
      })
    : milestones;

  const handleFilterClick = (filter: string | null) => {
    setActiveFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  const handleMilestoneClick = (milestoneId: string) => {
    if (onMilestoneClick) {
      onMilestoneClick(milestoneId);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow h-full">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Milestones</h2>
      
      {/* Timeline visualization */}
      <div className="mt-4 mb-6">
        <div className="relative">
          <div className="absolute left-1/2 h-full w-0.5 -ml-px bg-gray-200"></div>
          {filteredMilestones.map((milestone, index) => (
            <div 
              key={milestone.id} 
              className="relative mb-6 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors duration-150 -ml-2 -mr-2 p-2"
              onClick={() => handleMilestoneClick(milestone.id)}
            >
              <div className="flex items-center">
                <div className="z-10 flex items-center justify-center w-6 h-6 bg-white rounded-full ring-8 ring-white shrink-0">
                  <div 
                    className={`w-4 h-4 rounded-full ${
                      milestone.completionPercentage === 100 
                        ? 'bg-green-500' 
                        : milestone.completionPercentage > 0 
                          ? 'bg-indigo-500' 
                          : 'bg-gray-400'
                    }`}
                  ></div>
                </div>
                <div className="flex-grow ml-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">{milestone.title}</h3>
                    <span className="text-sm font-medium text-gray-500">
                      {milestone.completionPercentage}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{milestone.description}</p>
                  <p className="text-xs text-gray-500 mt-1">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>
                  
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${
                        milestone.completionPercentage === 100 
                          ? 'bg-green-500' 
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${milestone.completionPercentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-1">
                    {milestone.tags.map(tag => (
                      <span 
                        key={tag}
                        className="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Quick access filters */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Filters</h3>
        <div className="flex flex-wrap gap-2">
          <button 
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              activeFilter === null 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => handleFilterClick(null)}
          >
            All
          </button>
          <button 
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              activeFilter === 'in-progress' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => handleFilterClick('in-progress')}
          >
            In Progress
          </button>
          <button 
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              activeFilter === 'completed' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => handleFilterClick('completed')}
          >
            Completed
          </button>
          <button 
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              activeFilter === 'upcoming' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => handleFilterClick('upcoming')}
          >
            Upcoming
          </button>
        </div>
      </div>
      
      {filteredMilestones.length === 0 && (
        <div className="mt-6 text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No milestones match the selected filter</p>
        </div>
      )}
    </div>
  );
} 