import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View as RNView,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import { SessionMetadataSection } from '@/src/components/SessionMetadataSection';
import { SetListItem } from '@/src/components/SetListItem';
import { getSessionDetail } from '@/src/db/queries/history';
import { deleteSession } from '@/src/db/queries/sessions';
import { useTheme } from '@/src/hooks/useTheme';
import type { WorkoutSessionWithDetails } from '@/src/types';
import { formatWorkoutDuration } from '@/src/utils/formatDuration';
import { showAlert } from '@/src/utils/alert';

function formatSessionDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const [session, setSession] = useState<WorkoutSessionWithDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadSession = useCallback(async () => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      const data = await getSessionDetail(id);
      if (!data) {
        setNotFound(true);
      } else {
        setSession(data);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const confirmDelete = () => {
    if (!session) {
      return;
    }

    showAlert(
      'Delete Workout',
      `Delete this workout? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSession(session.id);
            router.back();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (notFound || !session || session.completedAt === null) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Session not found.
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

  const durationSeconds = Math.round(
    (session.completedAt - session.startedAt) / 1000
  );

  return (
    <>
      <Stack.Screen options={{ title: session.planName }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <RNView
          style={[
            styles.summaryCard,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <Text style={styles.durationLabel}>
            {formatWorkoutDuration(durationSeconds)}
          </Text>
          <Text style={[styles.dateLabel, { color: colors.muted }]}>
            {formatSessionDateTime(session.completedAt)}
          </Text>
        </RNView>

        <SessionMetadataSection
          sessionId={session.id}
          bodyWeight={session.bodyWeight}
          onUpdate={(metadata) =>
            setSession((current) =>
              current
                ? {
                    ...current,
                    bodyWeight: metadata.bodyWeight,
                  }
                : current
            )
          }
        />

        {session.exercises.map((exercise) => (
          <RNView
            key={exercise.id}
            style={[
              styles.exerciseCard,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
            {exercise.sets.length === 0 ? (
              <Text style={[styles.noSets, { color: colors.muted }]}>
                No sets logged
              </Text>
            ) : (
              exercise.sets.map((set) => (
                <SetListItem key={set.id} set={set} />
              ))
            )}
          </RNView>
        ))}

        <Pressable
          onPress={confirmDelete}
          style={({ pressed }) => [
            styles.deleteButton,
            { opacity: pressed ? 0.5 : 1 },
          ]}
        >
          <Text style={[styles.deleteLabel, { color: colors.error }]}>
            Delete Workout
          </Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  durationLabel: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 15,
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
  noSets: {
    fontSize: 15,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 16,
  },
  deleteButton: {
    marginTop: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
});
