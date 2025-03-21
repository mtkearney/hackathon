'use client';

import { useState, useEffect } from 'react';
import { useAppStructureGenerator } from '../../lib/hooks/useLLM';
import { generateSchemaFromSummary } from '@/lib/llm';

interface Field {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  relations?: string;
}

interface Table {
  name: string;
  description?: string;
  fields: Field[];
}

interface Schema {
  tables: Table[];
}

interface AppLayout {
  pages: Array<{
    name: string;
    description: string;
  }>;
}

interface SchemaConfigProps {
  schema: Schema;
  appLayout: AppLayout;
  onSchemaChange: (schema: Schema) => void;
  onNext: () => void;
  onBack: () => void;
}

interface GeneratedSchema {
  tables: Array<{
    name: string;
    description: string;
    fields: Array<{
      name: string;
      type: string;
      description: string;
      required: boolean;
      relations?: string;
    }>;
  }>;
  recommendations: {
    additionalTables: string[];
    suggestedIndexes: string[];
  };
}

export default function SchemaConfig({ 
  schema, 
  appLayout,
  onSchemaChange, 
  onNext, 
  onBack 
}: SchemaConfigProps) {
  // Local state for table editing
  const [selectedTableIndex, setSelectedTableIndex] = useState<number | null>(null);
  const [newTable, setNewTable] = useState<Table>({ name: '', fields: [] });
  const [newField, setNewField] = useState<Field>({ name: '', type: 'text' });
  const [tableError, setTableError] = useState<string>('');
  const [fieldError, setFieldError] = useState<string>('');
  const [aiRecommendations, setAIRecommendations] = useState<GeneratedSchema | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);
  const [appSummary, setAppSummary] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // App Structure generation
  const { loading: appStructureLoading, error: appStructureError, execute: generateAppStructure } = useAppStructureGenerator();

  const dataTypes = ['text', 'uuid', 'integer', 'boolean', 'timestamp', 'jsonb', 'float'];

  // Load AI recommendations on mount
  useEffect(() => {
    try {
      // Load the project summary
      const summary = localStorage.getItem('projectSummary');
      if (summary) {
        setAppSummary(summary);
      }
      
      // Load schema recommendations
      const storedSchema = localStorage.getItem('generatedSchema');
      if (storedSchema) {
        const parsedSchema = JSON.parse(storedSchema) as GeneratedSchema;
        setAIRecommendations(parsedSchema);
        
        // If we have an AI recommended schema and the current schema is empty or has only default tables,
        // update the schema with the AI recommendations
        if (parsedSchema?.tables && 
            (schema.tables.length === 0 || 
             (schema.tables.length === 2 && 
              schema.tables[0].name === 'users' && 
              schema.tables[1].name === 'projects'))) {
          
          onSchemaChange({
            tables: parsedSchema.tables.map(table => ({
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
          });
        }
      }
    } catch (error) {
      console.error('Error loading schema recommendations:', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  }, []);

  // Add a new table
  const addTable = () => {
    if (!newTable.name.trim()) {
      setTableError('Table name is required');
      return;
    }

    if (newTable.fields.length === 0) {
      setTableError('Table must have at least one field');
      return;
    }
    
    onSchemaChange({
      tables: [...schema.tables, { ...newTable }]
    });
    
    setNewTable({ name: '', fields: [] });
    setTableError('');
  };

  // Remove a table
  const removeTable = (index: number) => {
    const updatedTables = [...schema.tables];
    updatedTables.splice(index, 1);
    
    onSchemaChange({
      tables: updatedTables
    });

    if (selectedTableIndex === index) {
      setSelectedTableIndex(null);
    }
  };

  // Select a table for editing
  const selectTable = (index: number) => {
    setSelectedTableIndex(index);
  };

  // Add a field to the new table
  const addField = () => {
    if (!newField.name.trim()) {
      setFieldError('Field name is required');
      return;
    }

    setNewTable({
      ...newTable,
      fields: [...newTable.fields, { ...newField }]
    });
    
    setNewField({ name: '', type: 'text' });
    setFieldError('');
  };

  // Remove a field from the new table
  const removeField = (index: number) => {
    const updatedFields = [...newTable.fields];
    updatedFields.splice(index, 1);
    
    setNewTable({
      ...newTable,
      fields: updatedFields
    });
  };

  // Add a field to an existing table
  const addFieldToExistingTable = () => {
    if (selectedTableIndex === null) return;
    if (!newField.name.trim()) {
      setFieldError('Field name is required');
      return;
    }

    const updatedTables = [...schema.tables];
    updatedTables[selectedTableIndex].fields.push({ ...newField });
    
    onSchemaChange({
      tables: updatedTables
    });
    
    setNewField({ name: '', type: 'text' });
    setFieldError('');
  };

  // Remove a field from an existing table
  const removeFieldFromExistingTable = (tableIndex: number, fieldIndex: number) => {
    const updatedTables = [...schema.tables];
    updatedTables[tableIndex].fields.splice(fieldIndex, 1);
    
    onSchemaChange({
      tables: updatedTables
    });
  };

  // Apply recommendations from AI
  const applyRecommendation = (tableIndex: number) => {
    if (!aiRecommendations || !aiRecommendations.tables[tableIndex]) return;
    
    const recommendedTable = aiRecommendations.tables[tableIndex];
    
    onSchemaChange({
      tables: [...schema.tables, {
        name: recommendedTable.name,
        description: recommendedTable.description,
        fields: recommendedTable.fields.map(field => ({
          name: field.name,
          type: field.type,
          description: field.description,
          required: field.required,
          relations: field.relations
        }))
      }]
    });
  };

  // Generate app structure based on the schema and summary
  const handleGenerateAppStructure = async () => {
    if (!appSummary) return;
    
    try {
      const appStructure = await generateAppStructure({ 
        summary: appSummary, 
        schema 
      });
      
      localStorage.setItem('generatedAppStructure', JSON.stringify(appStructure));
    } catch (error) {
      console.error('Error generating app structure:', error);
    }
  };

  // Handle next step and generate app structure if needed
  const handleNext = async () => {
    await handleGenerateAppStructure();
    onNext();
  };

  // Check if a table from AI recommendations is already added to the schema
  const isTableAlreadyAdded = (tableName: string) => {
    return schema.tables.some(table => table.name.toLowerCase() === tableName.toLowerCase());
  };

  // Function to generate schema from project summary
  const generateSchemaFromSummaryHandler = async () => {
    if (!appSummary?.trim()) {
      // Can't generate without a summary
      setGenerationError('A project summary is required to generate the schema.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      // Call the API route instead of the LLM function directly
      const response = await fetch('/api/llm/generate-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary: appSummary }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate schema');
      }
      
      const generatedSchema = await response.json();
      
      // Convert generated schema to our format
      const convertedSchema = {
        tables: generatedSchema.tables.map(table => ({
          name: table.name,
          description: table.description,
          fields: table.fields.map(field => ({
            name: field.name,
            type: field.type,
            description: field.description,
            required: field.required,
            relations: field.relations || ''
          }))
        }))
      };

      // Update schema with generated data
      onSchemaChange(convertedSchema);
      
      // Store the generated schema for other components
      localStorage.setItem('generatedSchema', JSON.stringify(generatedSchema));
      
      // If we have recommendations, show them in a toast or similar UI element
      if (generatedSchema.recommendations) {
        console.log('Schema generation recommendations:', generatedSchema.recommendations);
        // TODO: Display recommendations to user
      }
    } catch (error) {
      console.error('Error generating schema:', error);
      setGenerationError(typeof error === 'object' && error !== null && 'message' in error
        ? error.message as string
        : 'Failed to generate schema. Please try again or adjust your project summary.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-6 transition-all">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Database Schema Configuration</h2>
        <button
          onClick={generateSchemaFromSummaryHandler}
          disabled={isGenerating}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Generate Schema'}
        </button>
      </div>
      
      {generationError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {generationError}
        </div>
      )}
      
      {isLoadingRecommendations ? (
        <div className="flex items-center justify-center py-4">
          <svg className="animate-spin h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading recommendations...</span>
        </div>
      ) : (
        <>
          {aiRecommendations && (
            <div className="mb-6 p-4 bg-blue-50 rounded-md border border-blue-200">
              <h3 className="text-lg font-medium text-blue-800 mb-2">AI Recommended Schema</h3>
              
              {aiRecommendations.recommendations.additionalTables.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-600 mb-1">Recommended Additional Tables:</p>
                  <ul className="list-disc ml-5 text-sm">
                    {aiRecommendations.recommendations.additionalTables.map((table, index) => (
                      <li key={index} className="mb-1">{table}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {aiRecommendations.recommendations.suggestedIndexes.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-600 mb-1">Suggested Indexes:</p>
                  <ul className="list-disc ml-5 text-sm">
                    {aiRecommendations.recommendations.suggestedIndexes.map((index, i) => (
                      <li key={i} className="mb-1">{index}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-600 mb-1">Recommended Tables:</p>
                <div className="space-y-2">
                  {aiRecommendations.tables
                    .filter(table => !isTableAlreadyAdded(table.name))
                    .map((table, index) => (
                    <div key={index} className="p-2 border border-blue-200 rounded-md bg-white">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{table.name}</span>
                          <p className="text-xs text-gray-500">{table.description}</p>
                        </div>
                        <button
                          onClick={() => applyRecommendation(
                            aiRecommendations.tables.findIndex(t => t.name === table.name)
                          )}
                          className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
                        >
                          Add Table
                        </button>
                      </div>
                      <div className="mt-1">
                        <p className="text-xs text-gray-600">Fields: {table.fields.map(f => f.name).join(', ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Database Schema</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="col-span-1 border rounded-md p-4 bg-gray-50">
                <h4 className="font-medium mb-2">Tables</h4>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {schema.tables.map((table, index) => (
                    <div 
                      key={index}
                      onClick={() => selectTable(index)}
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        selectedTableIndex === index 
                          ? 'bg-blue-100 border border-blue-300' 
                          : 'bg-white border hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{table.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTable(index);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">{table.fields.length} fields</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="col-span-2 border rounded-md p-4">
                {selectedTableIndex !== null ? (
                  <div>
                    <h4 className="font-medium mb-2">
                      Fields for {schema.tables[selectedTableIndex].name}
                    </h4>
                    
                    <div className="mb-4">
                      <div className="flex mb-2">
                        <input
                          type="text"
                          value={newField.name}
                          onChange={(e) => setNewField({...newField, name: e.target.value})}
                          placeholder="Field name"
                          className="flex-grow p-2 border rounded-l-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <select
                          value={newField.type}
                          onChange={(e) => setNewField({...newField, type: e.target.value})}
                          className="p-2 border-t border-b border-r focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          {dataTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={newField.relations || ''}
                          onChange={(e) => setNewField({...newField, relations: e.target.value})}
                          placeholder="Relations (optional)"
                          className="w-1/3 p-2 border-t border-b focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <button
                          onClick={addFieldToExistingTable}
                          className="px-4 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Add
                        </button>
                      </div>
                      {fieldError && <p className="text-red-500 text-sm mt-1">{fieldError}</p>}
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relations</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {schema.tables[selectedTableIndex].fields.map((field, fieldIndex) => (
                            <tr key={fieldIndex}>
                              <td className="px-3 py-2 whitespace-nowrap">{field.name}</td>
                              <td className="px-3 py-2 whitespace-nowrap">{field.type}</td>
                              <td className="px-3 py-2 whitespace-nowrap">{field.relations || '-'}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-right">
                                <button
                                  onClick={() => removeFieldFromExistingTable(selectedTableIndex, fieldIndex)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <svg className="h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-medium mb-2">Add New Table</h4>
                    
                    <div className="mb-4">
                      <input
                        type="text"
                        value={newTable.name}
                        onChange={(e) => setNewTable({...newTable, name: e.target.value})}
                        placeholder="Table name"
                        className="w-full p-2 border rounded-md mb-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      
                      <div className="flex mb-2">
                        <input
                          type="text"
                          value={newField.name}
                          onChange={(e) => setNewField({...newField, name: e.target.value})}
                          placeholder="Field name"
                          className="flex-grow p-2 border rounded-l-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <select
                          value={newField.type}
                          onChange={(e) => setNewField({...newField, type: e.target.value})}
                          className="p-2 border-t border-b focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          {dataTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={newField.relations || ''}
                          onChange={(e) => setNewField({...newField, relations: e.target.value})}
                          placeholder="Relations (optional)"
                          className="w-1/3 p-2 border-t border-b focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <button
                          onClick={addField}
                          className="px-4 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Add
                        </button>
                      </div>
                      
                      {fieldError && <p className="text-red-500 text-sm mt-1">{fieldError}</p>}
                      
                      {newTable.fields.length > 0 && (
                        <div className="overflow-x-auto mt-2">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relations</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {newTable.fields.map((field, index) => (
                                <tr key={index}>
                                  <td className="px-3 py-2 whitespace-nowrap">{field.name}</td>
                                  <td className="px-3 py-2 whitespace-nowrap">{field.type}</td>
                                  <td className="px-3 py-2 whitespace-nowrap">{field.relations || '-'}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-right">
                                    <button
                                      onClick={() => removeField(index)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <svg className="h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                      </svg>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <button
                          onClick={addTable}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Add Table
                        </button>
                        {tableError && <p className="text-red-500 text-sm mt-1">{tableError}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Back
        </button>
        
        <button
          onClick={handleNext}
          className={`px-6 py-2 bg-blue-600 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isLoadingRecommendations || appStructureLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
          disabled={isLoadingRecommendations || appStructureLoading}
        >
          {appStructureLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating App Structure...
            </span>
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </div>
  );
}