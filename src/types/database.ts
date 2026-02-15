/**
 * Database Type Definitions
 * TypeScript interfaces for Supabase database entities
 */

// Database row types (snake_case - matches Supabase schema)
export interface TutorialRow {
  id: string;
  title: string;
  description: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface StepRow {
  id: string;
  tutorial_id: string;
  step_number: number;
  description: string | null;
  photo_url: string | null;
  created_at: string;
}

// Application types (camelCase - for React components)
// This combines tutorial with its steps for easier rendering
export interface Tutorial {
  id: string;
  title: string;
  description: string | null;
  photoUrl: string | null;
  createdAt: Date;
  steps: TutorialStep[];
}

export interface TutorialStep {
  id: string;
  stepNumber: number;
  description: string | null;
  photoUrl: string | null;
  createdAt: Date;
}

// Supabase Database type definition
// This enables full type safety in Supabase queries
export interface Database {
  public: {
    Tables: {
      tutorials: {
        Row: TutorialRow;
        Insert: Omit<TutorialRow, 'id' | 'created_at'>;
        Update: Partial<Omit<TutorialRow, 'id' | 'created_at'>>;
      };
      steps: {
        Row: StepRow;
        Insert: Omit<StepRow, 'id' | 'created_at'>;
        Update: Partial<Omit<StepRow, 'id' | 'created_at'>>;
      };
    };
  };
}
