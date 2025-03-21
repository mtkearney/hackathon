import { createClient } from '@/lib/supabase/client';
import type { Project, ProjectConfig, Tables } from '@/types/supabase';

/**
 * Fetch all projects for the current user
 */
export async function fetchUserProjects() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  return data as Project[];
}

/**
 * Fetch a specific project by ID
 */
export async function fetchProjectById(projectId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();
    
  if (error) throw error;
  
  return data as Project;
}

/**
 * Create a new project
 */
export async function createProject({
  name,
  summary,
  userId,
  projectConfig
}: {
  name: string;
  summary: string;
  userId: string;
  projectConfig: {
    techStack: {
      default: boolean;
      technologies: string[];
      customTechnologies: string[];
    };
    appLayout: {
      pages: Array<{
        name: string;
        description: string;
      }>;
    };
    schema: {
      tables: Array<{
        name: string;
        fields: Array<{
          name: string;
          type: string;
          relations?: string;
        }>;
      }>;
    };
  };
}) {
  if (!userId) {
    console.error('createProject called with no userId');
    throw new Error('User ID is required to create a project');
  }

  console.log('Creating project for user:', userId);
  const supabase = createClient();
  
  // Check if the user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.error('No active session when creating project');
    throw new Error('Authentication required. Please log in again.');
  }
  
  // Verify that the authenticated user ID matches the provided user ID
  if (session.user.id !== userId) {
    console.error('User ID mismatch:', { sessionUserId: session.user.id, providedUserId: userId });
    throw new Error('User ID mismatch. Please log in again.');
  }
  
  // Transform the project config to match the database schema
  const config: ProjectConfig = {
    techStack: [
      ...projectConfig.techStack.technologies.map(name => ({
        name,
        isDefault: projectConfig.techStack.default
      })),
      ...projectConfig.techStack.customTechnologies.map(name => ({
        name,
        isDefault: false
      }))
    ],
    pages: projectConfig.appLayout.pages.map(page => ({
      ...page,
      isDefault: true
    })),
    schemaTables: projectConfig.schema.tables.map(table => ({
      name: table.name,
      description: '',
      isDefault: true,
      fields: table.fields.map(field => ({
        name: field.name,
        type: field.type,
        required: field.name === 'id'
      }))
    }))
  };
  
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name,
        summary,
        user_id: userId,
        config
      })
      .select('id')
      .single();
      
    if (error) {
      console.error('Supabase error creating project:', error);
      throw error;
    }
    
    console.log('Project created successfully:', data);
    return data;
  } catch (error: any) {
    console.error('Error in createProject:', error);
    
    // Provide more specific error message based on the error code
    if (error.code === '42501') {
      throw new Error('Permission denied: Your account does not have permission to create projects');
    } else if (error.code === '23505') {
      throw new Error('A project with this name already exists');
    } else if (error.message && error.message.includes('JWT')) {
      throw new Error('Authentication error: Please log out and log in again');
    }
    
    throw error;
  }
}

/**
 * Update an existing project
 */
export async function updateProject(
  projectId: string,
  updates: Partial<Omit<Tables<'projects'>, 'id' | 'created_at' | 'updated_at' | 'user_id'>> & { config?: ProjectConfig }
) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();
    
  if (error) throw error;
  
  return data as Project;
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);
    
  if (error) throw error;
  
  return true;
} 