import { useActiveWorkoutStore } from '@/src/stores/activeWorkout';

const ONGOING_BANNER_HEIGHT = 56;

export function useTabListPadding() {
  const hasActiveWorkout = useActiveWorkoutStore((s) => s.sessionId !== null);

  const bannerExtra = hasActiveWorkout ? ONGOING_BANNER_HEIGHT : 0;

  return {
    padding: 16,
    paddingBottom: 24 + bannerExtra,
  };
}
