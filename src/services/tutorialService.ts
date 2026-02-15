/**
 * Tutorial Service
 * Handles tutorial and step data operations with Supabase
 */

import { supabase } from './supabase';
import type { Tutorial, TutorialRow, StepRow } from '../types/database';
import { ApiError } from './api';

/**
 * Fetch all tutorials (without steps)
 * Used for the tutorial listing page
 *
 * @returns Promise with array of tutorials (steps array will be empty)
 * @throws ApiError if query fails
 */
export async function fetchAllTutorials(): Promise<Tutorial[]> {
  const { data, error }: { data: TutorialRow[] | null; error: any } = await supabase
    .from('tutorials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new ApiError(
      'Failed to fetch tutorials',
      500,
      error.message
    );
  }

  if (!data) {
    return [];
  }

  return data.map(tutorial => ({
    id: tutorial.id,
    title: tutorial.title,
    description: tutorial.description,
    photoUrl: tutorial.photo_url,
    createdAt: new Date(tutorial.created_at),
    steps: [], // Empty for list view
  }));
}

/**
 * Fetch a single tutorial by ID with all its steps
 * Steps are ordered by step_number in ascending order
 *
 * @param tutorialId - UUID of the tutorial
 * @returns Promise with tutorial including ordered steps
 * @throws ApiError if query fails or tutorial not found
 */
export async function fetchTutorialWithSteps(
  tutorialId: string
): Promise<Tutorial> {
  // Type for tutorial with nested steps
  type TutorialWithSteps = TutorialRow & { steps: StepRow[] };

  // Fetch tutorial with nested steps using Supabase's join syntax
  const { data, error }: { data: TutorialWithSteps | null; error: any } = await supabase
    .from('tutorials')
    .select(`
      *,
      steps (*)
    `)
    .eq('id', tutorialId)
    .single();

  if (error) {
    throw new ApiError(
      `Failed to fetch tutorial ${tutorialId}`,
      error.code === 'PGRST116' ? 404 : 500,
      error.message
    );
  }

  if (!data) {
    throw new ApiError(
      `Tutorial ${tutorialId} not found`,
      404
    );
  }

  // Sort steps by step_number ascending (client-side for reliability)
  const sortedSteps = (data.steps || []).sort(
    (a: StepRow, b: StepRow) => a.step_number - b.step_number
  );

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    photoUrl: data.photo_url,
    createdAt: new Date(data.created_at),
    steps: sortedSteps.map((step: StepRow) => ({
      id: step.id,
      stepNumber: step.step_number,
      description: step.description,
      photoUrl: step.photo_url,
      createdAt: new Date(step.created_at),
    })),
  };
}
