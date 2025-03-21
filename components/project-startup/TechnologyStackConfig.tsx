'use client';

import { useState, useEffect } from 'react';
import { 
  FaReact, FaVuejs, FaAngular, FaNodeJs, FaPython, 
  FaJava, FaDatabase, FaDocker, FaAws, FaGoogle 
} from 'react-icons/fa';
import { 
  SiNextdotjs, SiTypescript, SiMongodb, SiPostgresql, 
  SiMysql, SiGraphql, SiFirebase, SiTailwindcss,
  SiDjango, SiFlask, SiSpring, SiExpress, SiDotnet 
} from 'react-icons/si';
import { Tab } from '@headlessui/react';
import Tooltip from '../ui/Tooltip';
import Badge from '../ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { generateTechStackRecommendations } from '@/lib/llm';

interface Technology {
  name: string;
  icon: JSX.Element;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'other';
}

interface TechStack {
  default: boolean;
  technologies: string[];
  customTechnologies: string[];
  selectedTechnologies?: string[];
}

interface TechnologyStackConfigProps {
  techStack: TechStack;
  onTechStackChange: (techStack: TechStack) => void;
  onNext: () => void;
  projectSummary: string;
}

// Technology catalog with icons
const TECH_CATALOG: Technology[] = [
  // Frontend
  { name: 'React', icon: <FaReact className="text-blue-500" />, category: 'frontend' },
  { name: 'Next.js', icon: <SiNextdotjs className="text-black" />, category: 'frontend' },
  { name: 'Vue.js', icon: <FaVuejs className="text-green-500" />, category: 'frontend' },
  { name: 'Angular', icon: <FaAngular className="text-red-500" />, category: 'frontend' },
  { name: 'TypeScript', icon: <SiTypescript className="text-blue-600" />, category: 'frontend' },
  { name: 'Tailwind CSS', icon: <SiTailwindcss className="text-blue-400" />, category: 'frontend' },
  
  // Backend
  { name: 'Node.js', icon: <FaNodeJs className="text-green-600" />, category: 'backend' },
  { name: 'Express', icon: <SiExpress className="text-gray-600" />, category: 'backend' },
  { name: 'Python', icon: <FaPython className="text-yellow-500" />, category: 'backend' },
  { name: 'Django', icon: <SiDjango className="text-green-800" />, category: 'backend' },
  { name: 'Flask', icon: <SiFlask className="text-black" />, category: 'backend' },
  { name: 'Java', icon: <FaJava className="text-red-600" />, category: 'backend' },
  { name: 'Spring', icon: <SiSpring className="text-green-500" />, category: 'backend' },
  { name: '.NET', icon: <SiDotnet className="text-purple-600" />, category: 'backend' },
  
  // Database
  { name: 'MongoDB', icon: <SiMongodb className="text-green-500" />, category: 'database' },
  { name: 'PostgreSQL', icon: <SiPostgresql className="text-blue-800" />, category: 'database' },
  { name: 'MySQL', icon: <SiMysql className="text-blue-700" />, category: 'database' },
  { name: 'GraphQL', icon: <SiGraphql className="text-pink-600" />, category: 'database' },
  { name: 'Firebase', icon: <SiFirebase className="text-yellow-500" />, category: 'database' },
  
  // DevOps
  { name: 'Docker', icon: <FaDocker className="text-blue-600" />, category: 'devops' },
  { name: 'AWS', icon: <FaAws className="text-yellow-600" />, category: 'devops' },
  { name: 'Google Cloud', icon: <FaGoogle className="text-blue-500" />, category: 'devops' },
];

export default function TechnologyStackConfig({ 
  techStack, 
  onTechStackChange, 
  onNext,
  projectSummary
}: TechnologyStackConfigProps) {
  // Local state for custom technology input
  const [newTech, setNewTech] = useState<string>('');
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [clickedTech, setClickedTech] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // Initialize selected technologies if not present
  const initializedTechStack = {
    ...techStack,
    selectedTechnologies: techStack.selectedTechnologies || [...techStack.technologies]
  };

  // Simulate loading on initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Toggle between default and custom tech stack
  const toggleDefaultStack = () => {
    onTechStackChange({
      ...initializedTechStack,
      default: !initializedTechStack.default,
      selectedTechnologies: initializedTechStack.default 
        ? [] 
        : [...initializedTechStack.technologies]
    });
  };

  // Toggle selection of a technology with visual feedback
  const toggleTechnology = (techName: string) => {
    if (initializedTechStack.default) return;
    
    // Set the clicked tech for animation feedback
    setClickedTech(techName);
    setTimeout(() => setClickedTech(null), 300);
    
    const selected = initializedTechStack.selectedTechnologies || [];
    const newSelected = selected.includes(techName)
      ? selected.filter(t => t !== techName)
      : [...selected, techName];
    
    onTechStackChange({
      ...initializedTechStack,
      selectedTechnologies: newSelected
    });
  };

  // Add a custom technology
  const addCustomTechnology = () => {
    if (!newTech.trim()) return;
    
    onTechStackChange({
      ...initializedTechStack,
      customTechnologies: [...initializedTechStack.customTechnologies, newTech.trim()],
      selectedTechnologies: initializedTechStack.selectedTechnologies 
        ? [...initializedTechStack.selectedTechnologies, newTech.trim()]
        : [newTech.trim()]
    });
    
    setNewTech('');
  };

  // Remove a custom technology
  const removeCustomTechnology = (tech: string) => {
    onTechStackChange({
      ...initializedTechStack,
      customTechnologies: initializedTechStack.customTechnologies.filter(t => t !== tech),
      selectedTechnologies: initializedTechStack.selectedTechnologies 
        ? initializedTechStack.selectedTechnologies.filter(t => t !== tech)
        : []
    });
  };

  // Handle key press for adding new technology
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomTechnology();
    }
  };

  // Filter technologies by category
  const getTechnologiesByCategory = (category: string) => {
    return TECH_CATALOG.filter(tech => tech.category === category);
  };

  // Check if a technology is selected
  const isTechnologySelected = (techName: string) => {
    return initializedTechStack.selectedTechnologies?.includes(techName) || false;
  };

  // Categories for tabs
  const categories = [
    { name: 'All', value: 'all' },
    { name: 'Frontend', value: 'frontend' },
    { name: 'Backend', value: 'backend' },
    { name: 'Database', value: 'database' },
    { name: 'DevOps', value: 'devops' },
    { name: 'Custom', value: 'custom' }
  ];

  // Filter technologies based on active tab
  const getFilteredTechnologies = () => {
    const category = categories[activeTab].value;
    if (category === 'all') return TECH_CATALOG;
    if (category === 'custom') return [];
    return getTechnologiesByCategory(category);
  };

  // Function to generate tech stack recommendations from project summary
  const generateTechStackHandler = async () => {
    if (!projectSummary?.trim()) {
      // Can't generate without a summary
      setGenerationError('A project summary is required to generate tech stack recommendations.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const generatedTechStack = await generateTechStackRecommendations(projectSummary);
      
      // Update tech stack selections based on recommendations
      if (generatedTechStack) {
        const recommendedTechs: string[] = [];
        
        // Add frontend framework
        if (generatedTechStack.frontendFramework) {
          const frontendTech = TECH_CATALOG.find(
            tech => tech.name.toLowerCase().includes(generatedTechStack.frontendFramework.toLowerCase())
          );
          if (frontendTech) {
            recommendedTechs.push(frontendTech.name);
          }
        }
        
        // Add backend framework
        if (generatedTechStack.backendFramework) {
          const backendTech = TECH_CATALOG.find(
            tech => tech.name.toLowerCase().includes(generatedTechStack.backendFramework.toLowerCase())
          );
          if (backendTech) {
            recommendedTechs.push(backendTech.name);
          }
        }
        
        // Add database
        if (generatedTechStack.database) {
          const dbTech = TECH_CATALOG.find(
            tech => tech.name.toLowerCase().includes(generatedTechStack.database.toLowerCase())
          );
          if (dbTech) {
            recommendedTechs.push(dbTech.name);
          }
        }
        
        // Add any additional libraries that match our catalog
        if (generatedTechStack.additionalLibraries) {
          generatedTechStack.additionalLibraries.forEach(lib => {
            const matchingTech = TECH_CATALOG.find(
              tech => tech.name.toLowerCase().includes(lib.name.toLowerCase())
            );
            if (matchingTech) {
              recommendedTechs.push(matchingTech.name);
            }
          });
        }
        
        // Add custom technologies for those not in our catalog
        const customTechs: string[] = [];
        if (generatedTechStack.additionalLibraries) {
          generatedTechStack.additionalLibraries.forEach(lib => {
            const matchingTech = TECH_CATALOG.find(
              tech => tech.name.toLowerCase().includes(lib.name.toLowerCase())
            );
            if (!matchingTech) {
              customTechs.push(lib.name);
            }
          });
        }
        
        // Update the tech stack
        onTechStackChange({
          ...techStack,
          default: false, // Switch to custom mode
          selectedTechnologies: recommendedTechs,
          customTechnologies: [...techStack.customTechnologies, ...customTechs]
        });
        
        // Store reasoning for later display
        if (generatedTechStack.reasoning) {
          console.log('Tech stack reasoning:', generatedTechStack.reasoning);
          // TODO: Display reasoning to user
        }
      }
    } catch (error) {
      console.error('Error generating tech stack recommendations:', error);
      setGenerationError('Failed to generate tech stack recommendations. Please try again or adjust your project summary.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6 transition-all min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-500">Loading technology options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6 transition-all">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Technology Stack Selection</h2>
        <button
          onClick={generateTechStackHandler}
          disabled={isGenerating}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Recommend Tech Stack'}
        </button>
      </div>
      
      {generationError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {generationError}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Technology Stack Configuration</h2>
        
        <div className="flex items-center">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={initializedTechStack.default}
              onChange={toggleDefaultStack}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900">
              {initializedTechStack.default ? 'Using Default Stack' : 'Custom Stack'}
            </span>
          </label>
        </div>
      </div>
      
      {/* Selected technologies summary */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3 text-gray-700">Selected Technologies</h3>
        <div className="flex flex-wrap gap-2 p-4 border border-gray-200 rounded-lg bg-gray-50 min-h-16">
          <AnimatePresence>
            {(initializedTechStack.selectedTechnologies || []).length > 0 ? (
              (initializedTechStack.selectedTechnologies || []).map((tech) => {
                const techInfo = TECH_CATALOG.find(t => t.name === tech);
                return (
                  <motion.div
                    key={tech}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 group"
                    >
                      {techInfo?.icon}
                      <span>{tech}</span>
                      {!initializedTechStack.default && (
                        <button
                          onClick={() => toggleTechnology(tech)}
                          className="ml-1 opacity-60 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  </motion.div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm p-2">No technologies selected. {initializedTechStack.default ? 'Toggle custom mode to select.' : 'Select from below.'}</p>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Technology selection area - only interactive if not using default */}
      <div className={`${initializedTechStack.default ? 'opacity-75 pointer-events-none' : ''}`}>
        <Tab.Group onChange={setActiveTab} selectedIndex={activeTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-50 p-1 mb-4">
            {categories.map((category) => (
              <Tab
                key={category.value}
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                  ${selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-gray-600 hover:bg-white/[0.12] hover:text-blue-600'
                  }`
                }
              >
                {category.name}
              </Tab>
            ))}
          </Tab.List>
          
          <Tab.Panels>
            {categories.map((category, idx) => (
              <Tab.Panel
                key={idx}
                className={`rounded-xl p-3 transition-all
                  ${category.value === 'custom' ? '' : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'}`
                }
              >
                {category.value === 'custom' ? (
                  <div className="space-y-4">
                    <div className="flex">
                      <input
                        type="text"
                        value={newTech}
                        onChange={(e) => setNewTech(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Add a custom technology..."
                        className="flex-grow p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        disabled={initializedTechStack.default}
                      />
                      <button
                        onClick={addCustomTechnology}
                        className="px-4 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400"
                        disabled={initializedTechStack.default}
                      >
                        Add
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence>
                        {initializedTechStack.customTechnologies.map((tech) => (
                          <motion.div
                            key={tech}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-800"
                            >
                              {tech}
                              <button
                                onClick={() => removeCustomTechnology(tech)}
                                className="ml-1.5 text-purple-600 hover:text-purple-800 focus:outline-none"
                                disabled={initializedTechStack.default}
                              >
                                ×
                              </button>
                            </Badge>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {initializedTechStack.customTechnologies.length === 0 && (
                        <p className="text-gray-500 text-sm">No custom technologies added yet.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  getFilteredTechnologies().map((tech) => (
                    <Tooltip key={tech.name} content={tech.name}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        animate={clickedTech === tech.name ? { scale: [1, 0.9, 1.1, 1] } : {}}
                        transition={{ duration: 0.3 }}
                        onClick={() => toggleTechnology(tech.name)}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                          isTechnologySelected(tech.name) 
                            ? 'bg-blue-50 border-blue-300 shadow-sm' 
                            : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
                        } cursor-pointer transition-all relative`}
                      >
                        <div className="text-4xl mb-2">{tech.icon}</div>
                        <span className="text-sm font-medium text-gray-700">{tech.name}</span>
                        <Badge 
                          variant="outline" 
                          className="mt-2 text-xs capitalize"
                        >
                          {tech.category}
                        </Badge>
                        
                        {isTechnologySelected(tech.name) && (
                          <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </motion.div>
                    </Tooltip>
                  ))
                )}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
      
      <div className="flex justify-end mt-8">
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