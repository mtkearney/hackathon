export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          name: string
          summary: string | null
          user_id: string
          config: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          summary?: string | null
          user_id: string
          config?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          summary?: string | null
          user_id?: string
          config?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Project configuration types to match the structure used in the app
export interface ProjectConfig {
  techStack: {
    name: string
    isDefault: boolean
  }[]
  pages: {
    name: string
    description: string
    isDefault: boolean
  }[]
  schemaTables: {
    name: string
    description: string
    isDefault: boolean
    fields: {
      name: string
      type: string
      required: boolean
    }[]
  }[]
}

// For convenience, extend the Project type
export interface Project extends Database['public']['Tables']['projects']['Row'] {
  config: ProjectConfig
}