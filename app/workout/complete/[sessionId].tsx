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
import { getSessionDetail } from '@/src/db/queries/history';
import { useTheme } from '@/src/hooks/useTheme';
import type { WorkoutSessionWithDetails } from '@/src/types';
import { summarizeExerciseTimes } from '@/src/utils/exerciseSummary';
import { formatTimerDuration, formatWorkoutDuration } from '@/src/utils/formatDuration';

export default function WorkoutCompleteScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const [session, setSession] = useState<WorkoutSessionWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadSession = useCallback(async () => {
    if (!sessionId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      const data = await getSessionDetail(sessionId);
      if (!data) {
        setNotFound(true);
      } else {
        setSession(data);
      }
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

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
          Workout not found.
        </Text>
        <Pressable
          onPress={() => router.replace('/(tabs)/history')}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, marginTop: 16 }]}
        >
          <Text style={{ color: colors.tint, fontSize: 16, fontWeight: '600' }}>
            Go to History
          </Text>
        </Pressable>
      </View>
    );
  }

  const durationSeconds = Math.round(
    (session.completedAt - session.startedAt) / 1000
  );
  const exerciseSummaries = summarizeExerciseTimes(session.exercises);

  return (
    <>
      <Stack.Screen options={{ title: 'Workout Complete', headerBackVisible: false }} />
      <View style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
        <RNView style={styles.hero}>
          <Text style={styles.heroTitle}>Great work!</Text>
          <Text style={[styles.heroSubtitle, { color: colors.muted }]}>
            {session.planName} · {formatWorkoutDuration(durationSeconds)}
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

        <Text style={styles.sectionTitle}>Exercise Summary</Text>
        {exerciseSummaries.map((summary) => (
          <RNView
            key={summary.exerciseName}
            style={[
              styles.exerciseCard,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <Text style={styles.exerciseName}>{summary.exerciseName}</Text>
            <Text style={[styles.exerciseMeta, { color: colors.muted }]}>
              {summary.setCount === 0
                ? 'No sets logged'
                : `${summary.setCount} set${summary.setCount === 1 ? '' : 's'}`}
            </Text>
            {summary.setCount > 0 ? (
              <RNView style={styles.timeRow}>
                <Text style={styles.timeLabel}>
                  Set time: {formatTimerDuration(summary.totalSetSeconds)}
                </Text>
                {summary.totalRestSeconds > 0 ? (
                  <Text style={[styles.timeLabel, { color: colors.muted }]}>
                    Rest: {formatTimerDuration(summary.totalRestSeconds)}
                  </Text>
                ) : null}
              </RNView>
            ) : null}
          </RNView>
        ))}
        </ScrollView>

        <RNView style={[styles.footer, { borderTopColor: colors.border }]}>
          <Pressable
            onPress={() => router.replace('/(tabs)/history')}
            style={({ pressed }) => [
              styles.doneButton,
              {
                backgroundColor: colors.tint,
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <Text style={[styles.doneLabel, { color: colors.buttonText }]}>Done</Text>
          </Pressable>
        </RNView>
      </View>
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
  hero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
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
    marginBottom: 4,
  },
  exerciseMeta: {
    fontSize: 15,
    marginBottom: 4,
  },
  timeRow: {
    gap: 2,
  },
  timeLabel: {
    fontSize: 15,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  doneButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
  },
});
