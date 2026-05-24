import type { SessionExerciseWithSets } from '@/src/types';

export interface ExerciseTimeSummary {
  exerciseName: string;
  setCount: number;
  totalSetSeconds: number;
  totalRestSeconds: number;
}

export function summarizeExerciseTimes(
  exercises: SessionExerciseWithSets[]
): ExerciseTimeSummary[] {
  return exercises.map((exercise) => {
    let totalSetSeconds = 0;
    let totalRestSeconds = 0;

    for (const set of exercise.sets) {
      if (set.setDurationSeconds != null) {
        totalSetSeconds += set.setDurationSeconds;
      }
      if (set.restBeforeSeconds != null) {
        totalRestSeconds += set.restBeforeSeconds;
      }
    }

    return {
      exerciseName: exercise.exerciseName,
      setCount: exercise.sets.length,
      totalSetSeconds,
      totalRestSeconds,
    };
  });
}
