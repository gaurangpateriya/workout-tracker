import { Pressable, StyleSheet, View as RNView } from 'react-native';

import { Text } from '@/components/Themed';
import { useTheme } from '@/src/hooks/useTheme';
import type { WorkoutPlanSummary } from '@/src/types';

interface PlanCardProps {
  plan: WorkoutPlanSummary;
  onPress: () => void;
  onDelete: () => void;
  onStart: () => void;
  isStarting?: boolean;
}

export function PlanCard({
  plan,
  onPress,
  onDelete,
  onStart,
  isStarting = false,
}: PlanCardProps) {
  const { colors } = useTheme();

  const exerciseLabel =
    plan.exerciseCount === 1 ? '1 exercise' : `${plan.exerciseCount} exercises`;

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
        <Text style={styles.name}>{plan.name}</Text>
        <Text style={[styles.meta, { color: colors.muted }]}>{exerciseLabel}</Text>
      </Pressable>
      <Pressable
        onPress={onDelete}
        style={({ pressed }) => [
          styles.deleteButton,
          { opacity: pressed ? 0.5 : 1 },
        ]}
        accessibilityLabel={`Delete ${plan.name}`}
      >
        <Text style={[styles.deleteLabel, { color: colors.muted }]}>✕</Text>
      </Pressable>
      <Pressable
        onPress={onStart}
        disabled={isStarting || plan.exerciseCount === 0}
        style={({ pressed }) => [
          styles.startButton,
          {
            backgroundColor: colors.tint,
            opacity: pressed || isStarting || plan.exerciseCount === 0 ? 0.6 : 1,
          },
        ]}
      >
        <Text style={[styles.startLabel, { color: colors.buttonText }]}>
          {isStarting ? '…' : 'Start'}
        </Text>
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
  name: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
    marginRight: 4,
  },
  deleteLabel: {
    fontSize: 16,
  },
  startButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 72,
    alignItems: 'center',
  },
  startLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});
