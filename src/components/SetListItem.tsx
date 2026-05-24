import { StyleSheet } from 'react-native';

import { Text } from '@/components/Themed';
import type { ExerciseSet } from '@/src/types';
import { formatTimerDuration } from '@/src/utils/formatDuration';

interface SetListItemProps {
  set: ExerciseSet;
}

export function SetListItem({ set }: SetListItemProps) {
  const restLabel =
    set.restBeforeSeconds != null && set.restBeforeSeconds > 0
      ? ` · Rest ${formatTimerDuration(set.restBeforeSeconds)}`
      : '';

  const durationLabel =
    set.setDurationSeconds != null && set.setDurationSeconds >= 0
      ? ` · Set ${formatTimerDuration(set.setDurationSeconds)}`
      : '';

  return (
    <Text style={styles.set}>
      Set {set.setNumber}: {set.weight} kg × {set.reps} reps{durationLabel}
      {restLabel}
    </Text>
  );
}

const styles = StyleSheet.create({
  set: {
    fontSize: 15,
    opacity: 0.85,
    marginBottom: 4,
  },
});
