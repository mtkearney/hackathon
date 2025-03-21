import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Initialize the LLM with the NVIDIA Nemotron configuration
export const createLLM = () => {
  // Handle environment variables safely in client components
  const apiKey = typeof process !== 'undefined' && process.env && process.env.NVIDIA_NIM_API_KEY
    ? process.env.NVIDIA_NIM_API_KEY
    : '';
    
  if (!apiKey) {
    console.warn('NVIDIA_NIM_API_KEY is not set. LLM functionality will not work properly.');
  }
  
  // Create LLM configuration
  // Use NextJS API route as a proxy to avoid CORS issues
  const isClient = typeof window !== 'undefined';
  const baseURL = isClient 
    ? '/api/llm/proxy' // Use relative path to our NextJS API proxy endpoint
    : 'https://integrate.api.nvidia.com/v1'; // Direct call from server-side
    
  return new ChatOpenAI({
    openAIApiKey: apiKey || 'placeholder-key', // Ensure a key is always provided
    modelName: "nvidia/llama-3.3-nemotron-super-49b-v1",
    temperature: 0.2, // Lower temperature for more consistent structured outputs
    maxTokens: 4000, // Set a reasonable token limit
    configuration: {
      baseURL,
      defaultHeaders: {
        "Authorization": `Bearer ${apiKey}`
      },
      // Add timeout and retry options
      timeout: 60000, // 60 second timeout
    }
  });
};

// General purpose function to generate structured output from the LLM
export async function generateStructuredOutput<T extends z.ZodTypeAny>({
  schema,
  prompt,
  model = createLLM(),
}: {
  schema: T;
  prompt: string;
  model?: ChatOpenAI;
}): Promise<z.infer<T>> {
  try {
    const parser = StructuredOutputParser.fromZodSchema(schema);
    
    // Create more explicit format instructions to guide the LLM
    const schemaStr = JSON.stringify(zodToJsonSchema(schema));
    const formatInstructions = `
You must respond with a JSON object that conforms to this schema:
${schemaStr}

Important guidelines:
1. Your entire response must be valid JSON that matches the schema.
2. Do NOT include additional text, explanations, or code blocks around the JSON.
3. Do NOT use escape characters in strings that don't need them.
4. Ensure all property names match exactly as specified in the schema.
5. Make sure all required properties are included.
6. Use null for optional properties you choose not to include.
7. For array properties, always return an array, even if empty.
`;
    
    const promptTemplate = PromptTemplate.fromTemplate(`
{prompt}

{formatInstructions}
`);
    
    const formattedPrompt = await promptTemplate.format({
      prompt,
      formatInstructions,
    });
    
    const response = await model.invoke(formattedPrompt);
    
    // Extract content from response safely
    let content = '';
    if (typeof response.content === 'string') {
      content = response.content;
    } else if (Array.isArray(response.content)) {
      content = response.content
        .map(item => {
          if (typeof item === 'string') return item;
          if ('text' in item) return item.text;
          return '';
        })
        .join('\n');
    }

    // Clean up the content to extract just the JSON
    // This handles cases where the LLM adds markdown code blocks or extra text
    let jsonContent = content.trim();
    
    // Strip markdown code blocks if present
    const jsonBlockRegex = /```(?:json)?([\s\S]+?)```/;
    const match = jsonContent.match(jsonBlockRegex);
    if (match && match[1]) {
      jsonContent = match[1].trim();
    }
    
    // Try to find JSON object boundaries if the response contains extra text
    if (!jsonContent.startsWith('{')) {
      const startIdx = jsonContent.indexOf('{');
      if (startIdx >= 0) {
        jsonContent = jsonContent.substring(startIdx);
      }
    }
    
    // Try to end at the last closing brace if there's text after the JSON
    if (!jsonContent.endsWith('}')) {
      const lastBraceIdx = jsonContent.lastIndexOf('}');
      if (lastBraceIdx >= 0) {
        jsonContent = jsonContent.substring(0, lastBraceIdx + 1);
      }
    }
    
    // Try parsing directly first
    try {
      return parser.parse(jsonContent);
    } catch (parseError) {
      // If direct parsing fails, try parsing as JSON and validating with Zod
      try {
        const parsedJson = JSON.parse(jsonContent);
        return schema.parse(parsedJson);
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError);
        console.error("Raw content:", content);
        throw new Error(`Failed to parse LLM response as JSON: ${jsonError.message}`);
      }
    }
  } catch (error) {
    console.error("Error generating structured output:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}

// Schema generation from project summary
export const SchemaGenerationSchema = z.object({
  tables: z.array(
    z.object({
      name: z.string().describe("The name of the table"),
      description: z.string().describe("A description of what this table represents"),
      fields: z.array(
        z.object({
          name: z.string().describe("The name of the field"),
          type: z.string().describe("The data type of the field (text, uuid, integer, boolean, timestamp, jsonb, float)"),
          description: z.string().describe("A description of what this field represents"),
          required: z.boolean().describe("Whether this field is required"),
          relations: z.string().optional().describe("Relations to other tables in the format tableName.fieldName")
        })
      )
    })
  ),
  recommendations: z.object({
    additionalTables: z.array(z.string()).describe("Recommendations for additional tables that might be useful"),
    suggestedIndexes: z.array(z.string()).describe("Suggestions for indexes that might improve performance")
  })
});

// App structure generation from schema and summary
export const AppStructureSchema = z.object({
  pages: z.array(
    z.object({
      name: z.string().describe("The name of the page"),
      route: z.string().describe("The route for this page (e.g., /dashboard)"),
      description: z.string().describe("A description of what this page is for"),
      components: z.array(
        z.object({
          name: z.string().describe("The name of the component"),
          description: z.string().describe("What this component does"),
          dataRequirements: z.array(z.string()).describe("What data this component needs")
        })
      )
    })
  ),
  recommendations: z.object({
    additionalPages: z.array(z.string()).describe("Recommendations for additional pages that might be useful"),
    authentication: z.string().describe("Recommendations for authentication requirements")
  })
});

// Tech stack recommendations based on project summary
export const TechStackSchema = z.object({
  frontendFramework: z.string().describe("Recommended frontend framework"),
  backendFramework: z.string().describe("Recommended backend framework"),
  database: z.string().describe("Recommended database technology"),
  authenticationService: z.string().describe("Recommended authentication service"),
  hostingService: z.string().describe("Recommended hosting service"),
  additionalLibraries: z.array(
    z.object({
      name: z.string().describe("Library name"),
      purpose: z.string().describe("What this library is used for"),
      recommendation: z.string().describe("Why this library is recommended")
    })
  ),
  reasoning: z.string().describe("Reasoning behind these technology recommendations")
});

// Generate database schema from project summary
export async function generateSchemaFromSummary(summary: string) {
  const prompt = `
    Based on the following project summary, suggest an appropriate database schema:
    
    PROJECT SUMMARY:
    ${summary}
    
    Generate a comprehensive database schema with appropriate tables and fields.
    Consider common entities, relationships, and necessary fields for this type of project.
    Include data types, descriptions, and relationships between tables.
  `;
  
  return generateStructuredOutput({
    schema: SchemaGenerationSchema,
    prompt,
  });
}

// Generate app structure from schema and summary
export async function generateAppStructureFromSchema(summary: string, schema: any) {
  const prompt = `
    Based on the following project summary and database schema, suggest an appropriate application structure:
    
    PROJECT SUMMARY:
    ${summary}
    
    DATABASE SCHEMA:
    ${JSON.stringify(schema, null, 2)}
    
    Generate a comprehensive application structure with appropriate pages and components.
    Consider user flows, necessary screens, and components needed to interact with the database.
    Include routes, descriptions, and data requirements for each component.
  `;
  
  return generateStructuredOutput({
    schema: AppStructureSchema,
    prompt,
  });
}

// Generate tech stack recommendations from project summary
export async function generateTechStackRecommendations(summary: string) {
  const prompt = `
    Based on the following project summary, recommend an appropriate technology stack:
    
    PROJECT SUMMARY:
    ${summary}
    
    Recommend a comprehensive technology stack that would be appropriate for this project.
    Consider the project requirements, scale, and potential future growth.
    Include frontend, backend, database, authentication, hosting recommendations, and any additional libraries.
    Provide reasoning for each recommendation.
  `;
  
  return generateStructuredOutput({
    schema: TechStackSchema,
    prompt,
  });
}

// Feature Tree generation schema and types
export interface FeatureTreeNode {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  complexity: 'high' | 'medium' | 'low';
  status: 'planned' | 'in_progress' | 'completed' | 'deferred';
  estimatedHours: number;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'testing' | 'documentation' | 'other';
  children?: FeatureTreeNode[];
}

export const FeatureTreeSchema = z.object({
  features: z.array(
    z.object({
      title: z.string().describe("The name of the feature category"),
      description: z.string().describe("A description of what this feature category represents"),
      priority: z.enum(['high', 'medium', 'low']).describe("The priority level of this feature category"),
      complexity: z.enum(['high', 'medium', 'low']).describe("The complexity level of this feature category"),
      estimatedHours: z.number().describe("Estimated hours to complete this feature category"),
      category: z.enum(['frontend', 'backend', 'database', 'devops', 'testing', 'documentation', 'other']).describe("The development category this feature belongs to"),
      children: z.array(
        z.object({
          title: z.string().describe("The name of the specific feature"),
          description: z.string().describe("A description of what this feature does"),
          priority: z.enum(['high', 'medium', 'low']).describe("The priority level of this feature"),
          complexity: z.enum(['high', 'medium', 'low']).describe("The complexity level of this feature"),
          estimatedHours: z.number().describe("Estimated hours to complete this feature"),
          category: z.enum(['frontend', 'backend', 'database', 'devops', 'testing', 'documentation', 'other']).describe("The development category this feature belongs to"),
          children: z.array(
            z.object({
              title: z.string().describe("The name of the individual task"),
              description: z.string().describe("A description of what this task involves"),
              priority: z.enum(['high', 'medium', 'low']).describe("The priority level of this task"),
              complexity: z.enum(['high', 'medium', 'low']).describe("The complexity level of this task"),
              estimatedHours: z.number().describe("Estimated hours to complete this task"),
              category: z.enum(['frontend', 'backend', 'database', 'devops', 'testing', 'documentation', 'other']).describe("The development category this task belongs to"),
            })
          ).describe("Individual tasks within this feature")
        })
      ).describe("Specific features within this category")
    })
  )
});

// Generate feature tree roadmap from project summary, schema, and app structure
export async function generateFeatureTree(
  summary: string, 
  schema: any, 
  appStructure: any,
  techStack: any
): Promise<{ features: FeatureTreeNode[] }> {
  const prompt = `
    You are an experienced project manager tasked with creating a detailed project roadmap.
    
    PROJECT SUMMARY:
    ${summary}
    
    DATABASE SCHEMA:
    ${JSON.stringify(schema, null, 2)}
    
    APPLICATION STRUCTURE:
    ${JSON.stringify(appStructure, null, 2)}
    
    TECHNOLOGY STACK:
    ${JSON.stringify(techStack, null, 2)}
    
    Create a hierarchical feature tree that covers all aspects of developing this application:
    
    1. Level 1: Major feature categories (e.g., "User Authentication", "Data Management")
    2. Level 2: Specific features within each category (e.g., "Login System", "User Registration")
    3. Level 3: Individual tasks for implementing each feature (e.g., "Create login form UI", "Implement password reset")
    
    For each node in the tree, include:
    - A descriptive title
    - A detailed description explaining what needs to be done
    - Priority level (high/medium/low)
    - Complexity level (high/medium/low)
    - Estimated hours to complete
    - Development category (frontend, backend, database, devops, testing, documentation, or other)
    
    Make sure to cover all aspects of development including frontend, backend, database, testing, deployment, and documentation.
    Be realistic with time estimates and prioritize features appropriately.
  `;
  
  const result = await generateStructuredOutput({
    schema: FeatureTreeSchema,
    prompt,
  });
  
  // Post-process to add IDs and default status
  const processNode = (node: any, prefix: string, index: number): FeatureTreeNode => {
    const id = `${prefix}-${index}`;
    return {
      id,
      title: node.title,
      description: node.description,
      priority: node.priority,
      complexity: node.complexity,
      status: 'planned',
      estimatedHours: node.estimatedHours,
      category: node.category,
      children: node.children ? node.children.map((child: any, childIndex: number) => 
        processNode(child, id, childIndex)) : undefined
    };
  };
  
  return {
    features: result.features.map((feature: any, index: number) => 
      processNode(feature, 'feature', index))
  };
}