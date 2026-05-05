export type MuscleGroup = 'Chest' | 'Back' | 'Shoulders' | 'Legs' | 'Biceps' | 'Triceps';

export interface WorkoutSet {
  weight: string;
  reps: string;
  unit: 'lbs' | 'kg';
}

export interface LoggedExercise {
  muscleGroup: MuscleGroup;
  exerciseName: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: string;
  exercises: LoggedExercise[];
}
