# Database Schema Setup

This directory contains the PostgreSQL schema for the Dragon's Breath application. The schema is designed to work with Supabase and includes integration with Supabase Auth.

## Schema Design

The database schema follows best practices for Supabase applications:

1. **Auth Integration**: The schema properly integrates with Supabase's `auth.users` table
2. **Custom User Profiles**: Extends auth.users with a custom `public.users` table for additional user data
3. **Projects Storage**: Stores project configurations using JSONB for flexibility

## Setup Instructions

### Option 1: Using the Supabase SQL Editor

1. Log in to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy the contents of `schema.sql` into the editor
5. Run the query to create all tables and set up permissions

### Option 2: Using Migrations (Recommended for Production)

For more controlled deployments:

1. Install the Supabase CLI:
   ```
   npm install -g supabase
   ```

2. Initialize Supabase in your project (if not already done):
   ```
   supabase init
   ```

3. Create a new migration:
   ```
   supabase migration new initial_schema
   ```

4. Copy the contents of `schema.sql` into the newly created migration file

5. Apply the migration:
   ```
   supabase db push
   ```

## Schema Overview

The database consists of the following main tables:

1. `public.users` - Extends `auth.users` with additional user profile data
   - References auth.users(id) as the primary key
   - Has automatic trigger to create profiles when new auth users are registered
   - Stores user preferences, avatars, and other custom data

2. `public.projects` - Stores project data with configuration as JSONB
   - References auth.users(id) directly, not public.users
   - Stores flexible project configuration

### Key Features

- **Auth Integration**: Properly hooks into Supabase Auth's user management
- **Row Level Security (RLS)**: Implemented to ensure users can only access their own data
- **Foreign Key Relationships**: Maintain data integrity between tables
- **Automatic User Creation**: Trigger to create profile when a user signs up
- **Automatic Timestamps**: For created_at and updated_at columns
- **JSON Storage**: For flexible configuration data
- **Proper Indexing**: For optimized query performance

## Type Generation

If you're using TypeScript, you can generate types from your Supabase schema:

```
npx supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

The `types/supabase.ts` file in this project contains manually created types that match this schema. 