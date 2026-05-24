import { DailyWorkoutTimeChart } from '@/src/analytics/components/charts/DailyWorkoutTimeChart';
import { BodyWeightChart } from '@/src/analytics/components/charts/BodyWeightChart';
import { ExerciseProgressChart } from '@/src/analytics/components/charts/ExerciseProgressChart';
import type { GraphDefinition } from '@/src/analytics/types';

export const GRAPH_REGISTRY: GraphDefinition[] = [
  {
    id: 'daily-workout-time',
    title: 'Workout Time',
    description: 'Total time spent working out each day',
    screenTitle: 'Workout Time',
    component: DailyWorkoutTimeChart,
  },
  {
    id: 'body-weight',
    title: 'Body Weight',
    description: 'Track your body weight over time',
    screenTitle: 'Body Weight',
    component: BodyWeightChart,
  },
  {
    id: 'exercise-progress',
    title: 'Exercise Progress',
    description: 'Max weight and reps per session for an exercise',
    screenTitle: 'Exercise Progress',
    component: ExerciseProgressChart,
  },
];

export function getGraphById(graphId: string): GraphDefinition | undefined {
  return GRAPH_REGISTRY.find((graph) => graph.id === graphId);
}
