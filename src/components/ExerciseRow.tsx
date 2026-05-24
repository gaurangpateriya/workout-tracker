import { Pressable, StyleSheet, View as RNView } from 'react-native';

import { Text } from '@/components/Themed';
import { ExercisePicker } from '@/src/components/ExercisePicker';
import { useTheme } from '@/src/hooks/useTheme';

interface ExerciseRowProps {
  name: string;
  index: number;
  total: number;
  onChangeName: (name: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export function ExerciseRow({
  name,
  index,
  total,
  onChangeName,
  onMoveUp,
  onMoveDown,
  onRemove,
}: ExerciseRowProps) {
  const { colors } = useTheme();

  return (
    <RNView style={styles.row}>
      <RNView style={styles.reorder}>
        <Pressable
          onPress={onMoveUp}
          disabled={index === 0}
          style={({ pressed }) => [
            styles.arrowButton,
            { opacity: index === 0 ? 0.25 : pressed ? 0.5 : 1 },
          ]}
        >
          <Text style={[styles.arrow, { color: colors.tint }]}>↑</Text>
        </Pressable>
        <Pressable
          onPress={onMoveDown}
          disabled={index === total - 1}
          style={({ pressed }) => [
            styles.arrowButton,
            { opacity: index === total - 1 ? 0.25 : pressed ? 0.5 : 1 },
          ]}
        >
          <Text style={[styles.arrow, { color: colors.tint }]}>↓</Text>
        </Pressable>
      </RNView>
      <ExercisePicker value={name} onChange={onChangeName} />
      <Pressable
        onPress={onRemove}
        style={({ pressed }) => [styles.removeButton, { opacity: pressed ? 0.5 : 1 }]}
      >
        <Text style={[styles.removeLabel, { color: colors.muted }]}>✕</Text>
      </Pressable>
    </RNView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  reorder: {
    width: 32,
    alignItems: 'center',
  },
  arrowButton: {
    paddingVertical: 2,
  },
  arrow: {
    fontSize: 18,
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
  },
  removeLabel: {
    fontSize: 16,
  },
});
