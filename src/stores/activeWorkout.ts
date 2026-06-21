import { create } from 'zustand';

import {
  addExerciseToSession,
  deleteExerciseFromSession,
  addSet as addSetToDb,
  finishWorkout as finishWorkoutInDb,
  getSessionWithDetails,
  startWorkout as startWorkoutInDb,
} from '@/src/db/queries/sessions';
import type { ActiveWorkout, SessionExerciseWithSets } from '@/src/types';

interface ActiveWorkoutStore extends ActiveWorkout {
  isLoading: boolean;
  error: string | null;
  loadSession: (sessionId: string) => Promise<void>;
  startWorkout: (planId: string) => Promise<string>;
  addExercise: (exerciseName: string) => Promise<void>;
  deleteExercise: (sessionExerciseId: string) => Promise<void>;
  addSet: (
    sessionExerciseId: string,
    weight: number,
    reps: number,
    setDurationSeconds: number
  ) => Promise<void>;
  finishWorkout: () => Promise<void>;
  startSet: (sessionExerciseId: string) => void;
  startRest: () => void;
  reset: () => void;
}

const emptyWorkout: ActiveWorkout = {
  sessionId: '',
  planId: '',
  planName: '',
  startedAt: 0,
  exercises: [],
  lastSetLoggedAt: null,
  activeSet: null,
  restStartedAt: null,
};

const initialState: Pick<
  ActiveWorkoutStore,
  keyof ActiveWorkout | 'isLoading' | 'error'
> = {
  ...emptyWorkout,
  isLoading: false,
  error: null,
};

function getLatestSetLoggedAt(
  exercises: SessionExerciseWithSets[]
): number | null {
  let latest: number | null = null;
  for (const exercise of exercises) {
    for (const set of exercise.sets) {
      if (latest === null || set.loggedAt > latest) {
        latest = set.loggedAt;
      }
    }
  }
  return latest;
}

function sessionToActiveWorkout(
  session: NonNullable<Awaited<ReturnType<typeof getSessionWithDetails>>>
): Omit<ActiveWorkout, 'activeSet' | 'restStartedAt'> {
  return {
    sessionId: session.id,
    planId: session.planId,
    planName: session.planName,
    startedAt: session.startedAt,
    exercises: session.exercises,
    lastSetLoggedAt: getLatestSetLoggedAt(session.exercises),
  };
}

export const useActiveWorkoutStore = create<ActiveWorkoutStore>((set, get) => ({
  ...initialState,

  loadSession: async (sessionId) => {
    const previous = get();
    set({ isLoading: true, error: null });
    try {
      const session = await getSessionWithDetails(sessionId);
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }

      const workout = sessionToActiveWorkout(session);
      const isSameSession = previous.sessionId === sessionId;
      const previousActiveExerciseExists = session.exercises.some(
        (exercise) => exercise.id === previous.activeSet?.exerciseId
      );

      set({
        ...workout,
        activeSet:
          isSameSession && previousActiveExerciseExists
            ? previous.activeSet
            : null,
        restStartedAt:
          isSameSession && previousActiveExerciseExists
            ? previous.restStartedAt
            : workout.lastSetLoggedAt,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load session',
        isLoading: false,
      });
      throw err;
    }
  },

  startWorkout: async (planId) => {
    set({ isLoading: true, error: null });
    try {
      const sessionId = await startWorkoutInDb(planId);
      await get().loadSession(sessionId);
      return sessionId;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to start workout',
        isLoading: false,
      });
      throw err;
    }
  },

  addExercise: async (exerciseName) => {
    const { sessionId } = get();
    if (!sessionId) {
      throw new Error('No active workout session');
    }

    set({ error: null });
    try {
      await addExerciseToSession(sessionId, exerciseName);
      await get().loadSession(sessionId);
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to add exercise',
      });
      throw err;
    }
  },

  deleteExercise: async (sessionExerciseId) => {
    const { sessionId } = get();
    if (!sessionId) {
      throw new Error('No active workout session');
    }

    set({ error: null });
    try {
      await deleteExerciseFromSession(sessionId, sessionExerciseId);
      await get().loadSession(sessionId);
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to delete exercise',
      });
      throw err;
    }
  },

  addSet: async (sessionExerciseId, weight, reps, setDurationSeconds) => {
    const { sessionId, exercises } = get();
    if (!sessionId) {
      throw new Error('No active workout session');
    }

    const exercise = exercises.find((e) => e.id === sessionExerciseId);
    if (!exercise) {
      throw new Error(`Exercise not found: ${sessionExerciseId}`);
    }

    const previousSet = exercise.sets.at(-1);
    const loggedAt = Date.now();
    const setNumber = (previousSet?.setNumber ?? 0) + 1;
    const restBeforeSeconds = previousSet
      ? Math.round((loggedAt - previousSet.loggedAt) / 1000)
      : null;
    const tempId = `temp-${loggedAt}`;

    const optimisticSet = {
      id: tempId,
      sessionExerciseId,
      setNumber,
      weight,
      reps,
      loggedAt,
      restBeforeSeconds,
      setDurationSeconds,
    };

    set((state) => ({
      exercises: state.exercises.map((ex) =>
        ex.id === sessionExerciseId
          ? { ...ex, sets: [...ex.sets, optimisticSet] }
          : ex
      ),
      lastSetLoggedAt: loggedAt,
      error: null,
    }));

    try {
      const savedSet = await addSetToDb(
        sessionExerciseId,
        weight,
        reps,
        setDurationSeconds
      );

      set((state) => ({
        exercises: state.exercises.map((ex) =>
          ex.id === sessionExerciseId
            ? {
                ...ex,
                sets: ex.sets.map((s) => (s.id === tempId ? savedSet : s)),
              }
            : ex
        ),
        lastSetLoggedAt: savedSet.loggedAt,
      }));
    } catch (err) {
      set((state) => ({
        exercises: state.exercises.map((ex) =>
          ex.id === sessionExerciseId
            ? { ...ex, sets: ex.sets.filter((s) => s.id !== tempId) }
            : ex
        ),
        lastSetLoggedAt: getLatestSetLoggedAt(
          state.exercises.map((ex) =>
            ex.id === sessionExerciseId
              ? { ...ex, sets: ex.sets.filter((s) => s.id !== tempId) }
              : ex
          )
        ),
        error: err instanceof Error ? err.message : 'Failed to add set',
      }));
      throw err;
    }
  },

  finishWorkout: async () => {
    const { sessionId, exercises } = get();
    if (!sessionId) {
      throw new Error('No active workout session');
    }

    set({ isLoading: true, error: null });
    try {
      await finishWorkoutInDb(
        sessionId,
        exercises
          .filter((exercise) => exercise.sourcePlanExerciseId === null)
          .map((exercise) => exercise.exerciseName)
      );
      set({ ...initialState });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to finish workout',
        isLoading: false,
      });
      throw err;
    }
  },

  startSet: (sessionExerciseId) => {
    set({
      activeSet: { exerciseId: sessionExerciseId, startedAt: Date.now() },
      restStartedAt: null,
    });
  },

  startRest: () => {
    set({ activeSet: null, restStartedAt: Date.now() });
  },

  reset: () => set({ ...initialState }),
}));
