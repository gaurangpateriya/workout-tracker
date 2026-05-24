import { Stack, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View as RNView,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import { RestTimer } from '@/src/components/RestTimer';
import { SetInputRow } from '@/src/components/SetInputRow';
import { SetListItem } from '@/src/components/SetListItem';
import { WorkoutTimer } from '@/src/components/WorkoutTimer';
import { useTheme } from '@/src/hooks/useTheme';
import { useActiveWorkoutStore } from '@/src/stores/activeWorkout';
import { showAlert } from '@/src/utils/alert';

export default function ActiveWorkoutScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useTheme();

  const loadSession = useActiveWorkoutStore((s) => s.loadSession);
  const addSet = useActiveWorkoutStore((s) => s.addSet);
  const finishWorkout = useActiveWorkoutStore((s) => s.finishWorkout);
  const startSet = useActiveWorkoutStore((s) => s.startSet);
  const startRest = useActiveWorkoutStore((s) => s.startRest);
  const planName = useActiveWorkoutStore((s) => s.planName);
  const startedAt = useActiveWorkoutStore((s) => s.startedAt);
  const exercises = useActiveWorkoutStore((s) => s.exercises);
  const activeSet = useActiveWorkoutStore((s) => s.activeSet);
  const restStartedAt = useActiveWorkoutStore((s) => s.restStartedAt);
  const isLoading = useActiveWorkoutStore((s) => s.isLoading);
  const error = useActiveWorkoutStore((s) => s.error);

  const [finishing, setFinishing] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    let cancelled = false;

    loadSession(sessionId).catch(() => {
      if (!cancelled) {
        setLoadFailed(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [sessionId, loadSession]);

  useLayoutEffect(() => {
    if (startedAt > 0) {
      navigation.setOptions({
        headerRight: () => <WorkoutTimer startedAt={startedAt} />,
      });
    }
  }, [navigation, startedAt]);

  const handleStartSet = (exerciseId: string) => {
    startSet(exerciseId);
  };

  const handleEndSet = async (
    exerciseId: string,
    weight: number,
    reps: number,
    setDurationSeconds: number
  ) => {
    try {
      await addSet(exerciseId, weight, reps, setDurationSeconds);
      startRest();
    } catch (err) {
      showAlert(
        'Could Not Save Set',
        err instanceof Error ? err.message : 'Failed to save set.'
      );
    }
  };

  const handleFinish = () => {
    showAlert(
      'Finish Workout',
      'Mark this workout as complete?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          onPress: async () => {
            setFinishing(true);
            try {
              await finishWorkout();
              router.replace(`/workout/complete/${sessionId}`);
            } catch (err) {
              setFinishing(false);
              showAlert(
                'Could Not Finish',
                err instanceof Error ? err.message : 'Failed to finish workout.'
              );
            }
          },
        },
      ]
    );
  };

  const showRestTimer = restStartedAt !== null && activeSet === null;

  if (loadFailed) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Workout session not found.
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, marginTop: 16 }]}
        >
          <Text style={{ color: colors.tint, fontSize: 16, fontWeight: '600' }}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading && startedAt === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: planName || 'Workout' }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {showRestTimer ? <RestTimer restStartedAt={restStartedAt} /> : null}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {error ? (
            <RNView
              style={[
                styles.errorBanner,
                { backgroundColor: colors.errorBackground },
              ]}
            >
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error}
              </Text>
            </RNView>
          ) : null}

          {exercises.map((exercise) => {
            const isSetActive = activeSet?.exerciseId === exercise.id;
            const isAnotherSetActive =
              activeSet !== null && activeSet.exerciseId !== exercise.id;

            return (
              <RNView
                key={exercise.id}
                style={[
                  styles.exerciseCard,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
              >
                <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
                {exercise.sets.map((set) => (
                  <SetListItem key={set.id} set={set} />
                ))}
                <SetInputRow
                  isSetActive={isSetActive}
                  isAnotherSetActive={isAnotherSetActive}
                  setStartedAt={isSetActive ? activeSet.startedAt : null}
                  onStartSet={() => handleStartSet(exercise.id)}
                  onEndSet={(weight, reps, setDurationSeconds) =>
                    handleEndSet(
                      exercise.id,
                      weight,
                      reps,
                      setDurationSeconds
                    )
                  }
                  disabled={finishing}
                />
              </RNView>
            );
          })}
        </ScrollView>

        <RNView style={[styles.footer, { borderTopColor: colors.border }]}>
          <Pressable
            onPress={handleFinish}
            disabled={finishing || isLoading}
            style={({ pressed }) => [
              styles.finishButton,
              {
                backgroundColor: colors.tint,
                opacity: pressed || finishing || isLoading ? 0.6 : 1,
              },
            ]}
          >
            {finishing ? (
              <ActivityIndicator color={colors.buttonText} />
            ) : (
              <Text style={[styles.finishLabel, { color: colors.buttonText }]}>
                Finish Workout
              </Text>
            )}
          </Pressable>
        </RNView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  exerciseCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  finishButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  finishLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  errorBanner: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
  },
});
