import { Pressable, StyleSheet, View as RNView } from 'react-native';

import { Text } from '@/components/Themed';
import { useTheme } from '@/src/hooks/useTheme';
import type { CompletedSessionSummary } from '@/src/types';
import { formatWorkoutDuration } from '@/src/utils/formatDuration';

interface SessionCardProps {
  session: CompletedSessionSummary;
  onPress: () => void;
  onDelete: () => void;
}

function formatSessionDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function SessionCard({ session, onPress, onDelete }: SessionCardProps) {
  const { colors } = useTheme();

  const exerciseLabel =
    session.exerciseCount === 1
      ? '1 exercise'
      : `${session.exerciseCount} exercises`;

  return (
    <RNView
      style={[
        styles.card,
        { borderColor: colors.border, backgroundColor: colors.card },
      ]}
    >
      <Pressable
        onPress={onPress}
        onLongPress={onDelete}
        style={({ pressed }) => [styles.content, { opacity: pressed ? 0.85 : 1 }]}
      >
        <RNView style={styles.header}>
          <Text style={styles.name}>{session.planName}</Text>
          <Text style={[styles.duration, { color: colors.muted }]}>
            {formatWorkoutDuration(session.durationSeconds)}
          </Text>
        </RNView>
        <Text style={[styles.meta, { color: colors.muted }]}>
          {formatSessionDate(session.completedAt)} · {exerciseLabel}
        </Text>
      </Pressable>
      <Pressable
        onPress={onDelete}
        style={({ pressed }) => [
          styles.deleteButton,
          { opacity: pressed ? 0.5 : 1 },
        ]}
        accessibilityLabel={`Delete ${session.planName} workout`}
      >
        <Text style={[styles.deleteLabel, { color: colors.muted }]}>✕</Text>
      </Pressable>
    </RNView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    marginRight: 12,
  },
  duration: {
    fontSize: 15,
    fontWeight: '600',
  },
  meta: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
  deleteLabel: {
    fontSize: 16,
  },
});
