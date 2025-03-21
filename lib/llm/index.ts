import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Initialize the LLM with the NVIDIA Nemotron configuration
export const createLLM = () => {
  return new ChatOpenAI({
    openAIApiKey: process.env.NVIDIA_NIM_API_KEY,
    modelName: "nvidia/llama-3.3-nemotron-super-49b-v1",
    configuration: {
      baseURL: "https://integrate.api.nvidia.com/v1",
      defaultHeaders: {
        "Authorization": `Bearer ${process.env.NVIDIA_NIM_API_KEY}`
      }
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
    
    const formatInstructions = parser.getFormatInstructions();
    
    const promptTemplate = PromptTemplate.fromTemplate(`
      {prompt}
      
      {formatInstructions}
    `);
    
    const formattedPrompt = await promptTemplate.format({
      prompt,
      formatInstructions,
    });
    
    const response = await model.invoke(formattedPrompt);
    
    return parser.parse(response.content);
  } catch (error) {
    console.error("Error generating structured output:", error);
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