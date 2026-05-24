import { useRouter, useSegments } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View as RNView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Themed';
import { useTheme } from '@/src/hooks/useTheme';
import { useActiveWorkoutStore } from '@/src/stores/activeWorkout';
import { formatTimerDuration } from '@/src/utils/formatDuration';

const TAB_BAR_HEIGHT = Platform.select({ ios: 49, default: 56 }) ?? 56;

function ElapsedTimer({ startedAt }: { startedAt: number }) {
  const { colors } = useTheme();
  const [elapsed, setElapsed] = useState(() =>
    Math.floor((Date.now() - startedAt) / 1000)
  );

  useEffect(() => {
    const tick = () => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <Text style={[styles.timer, { color: colors.tint }]}>
      {formatTimerDuration(elapsed)}
    </Text>
  );
}

export function OngoingWorkoutBanner() {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const sessionId = useActiveWorkoutStore((s) => s.sessionId);
  const startedAt = useActiveWorkoutStore((s) => s.startedAt);
  const planName = useActiveWorkoutStore((s) => s.planName);
  const exercises = useActiveWorkoutStore((s) => s.exercises);
  const activeSet = useActiveWorkoutStore((s) => s.activeSet);
  const restStartedAt = useActiveWorkoutStore((s) => s.restStartedAt);

  const isOnWorkoutScreen = segments[0] === 'workout';
  const isOnTabs = segments[0] === '(tabs)';

  const bannerContent = useMemo(() => {
    if (activeSet) {
      const exercise = exercises.find((e) => e.id === activeSet.exerciseId);
      const setNumber = (exercise?.sets.length ?? 0) + 1;
      return {
        title: exercise?.exerciseName ?? 'Exercise',
        subtitle: `Set ${setNumber}`,
        timerStartedAt: activeSet.startedAt,
      };
    }

    if (restStartedAt !== null) {
      return {
        title: 'Rest',
        subtitle: null,
        timerStartedAt: restStartedAt,
      };
    }

    return {
      title: planName || 'Workout',
      subtitle: 'In progress',
      timerStartedAt: startedAt,
    };
  }, [activeSet, exercises, restStartedAt, planName, startedAt]);

  if (!sessionId || startedAt === 0 || isOnWorkoutScreen) {
    return null;
  }

  const bottom = insets.bottom + (isOnTabs ? TAB_BAR_HEIGHT : 0);

  return (
    <Pressable
      onPress={() => router.push(`/workout/${sessionId}`)}
      style={({ pressed }) => [
        styles.banner,
        {
          bottom,
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <RNView style={styles.textColumn}>
        <Text style={styles.title} numberOfLines={1}>
          {bannerContent.title}
        </Text>
        {bannerContent.subtitle ? (
          <Text
            style={[styles.subtitle, { color: colors.muted }]}
            numberOfLines={1}
          >
            {bannerContent.subtitle}
          </Text>
        ) : null}
      </RNView>
      <ElapsedTimer startedAt={bannerContent.timerStartedAt} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 8,
  },
  textColumn: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  timer: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
