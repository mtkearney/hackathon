'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  className?: string;
  config?: any;
}

/**
 * A reusable component for rendering Mermaid JS diagrams
 * 
 * @param chart - The Mermaid diagram content as a string
 * @param className - Optional CSS class for the container
 * @param config - Optional Mermaid configuration overrides
 */
export default function MermaidDiagram({ chart, className = '', config = {} }: MermaidDiagramProps) {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize mermaid with default configuration
    mermaid.initialize({
      startOnLoad: true,
      theme: 'neutral',
      securityLevel: 'loose',
      ...config
    });

    renderDiagram();
  }, [chart, config]);

  const renderDiagram = async () => {
    if (!mermaidRef.current) return;
    
    try {
      // Clear previous content
      mermaidRef.current.innerHTML = '';
      
      // Create container for the diagram
      const container = document.createElement('div');
      container.className = 'mermaid';
      container.textContent = chart;
      
      // Append to the ref container
      mermaidRef.current.appendChild(container);
      
      // Render the diagram
      await mermaid.init(undefined, '.mermaid');
    } catch (error) {
      console.error('Error rendering Mermaid diagram:', error);
      
      // Display error message for easier debugging
      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = `
          <div class="p-4 border border-red-300 bg-red-50 text-red-700 rounded">
            <p class="font-medium">Error rendering diagram</p>
            <p class="text-sm mt-1">${error instanceof Error ? error.message : String(error)}</p>
          </div>
        `;
      }
    }
  };

  return (
    <div 
      ref={mermaidRef} 
      className={`mermaid-container ${className}`}
      data-testid="mermaid-diagram"
    ></div>
  );
}