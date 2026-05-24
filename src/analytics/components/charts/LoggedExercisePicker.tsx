import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View as RNView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Text } from '@/components/Themed';
import { getLoggedExerciseNames } from '@/src/db/queries/analytics';
import { useTheme } from '@/src/hooks/useTheme';

interface LoggedExercisePickerProps {
  value: string | null;
  onChange: (name: string) => void;
}

export function LoggedExercisePicker({ value, onChange }: LoggedExercisePickerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [exercises, setExercises] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadExercises = useCallback(async () => {
    setLoading(true);
    try {
      const names = await getLoggedExerciseNames();
      setExercises(names);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const handleSelect = (name: string) => {
    onChange(name);
    setOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text style={[styles.triggerLabel, { color: colors.muted }]}>Exercise</Text>
        <RNView style={styles.triggerValueRow}>
          <Text style={styles.triggerValue} numberOfLines={1}>
            {value ?? 'Select exercise'}
          </Text>
          <FontAwesome name="chevron-down" size={12} color={colors.muted} />
        </RNView>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={() => setOpen(false)}>
          <Pressable
            style={[
              styles.sheet,
              {
                backgroundColor: colors.card,
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={styles.sheetTitle}>Select exercise</Text>
            {loading ? (
              <RNView style={styles.loading}>
                <ActivityIndicator size="small" />
              </RNView>
            ) : exercises.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                Log a workout to see exercises here.
              </Text>
            ) : (
              <FlatList
                data={exercises}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const selected = item === value;

                  return (
                    <Pressable
                      onPress={() => handleSelect(item)}
                      style={({ pressed }) => [
                        styles.option,
                        {
                          backgroundColor: selected ? colors.tint : 'transparent',
                          opacity: pressed ? 0.85 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          { color: selected ? colors.buttonText : colors.text },
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  triggerLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  triggerValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  triggerValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '70%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  loading: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    paddingVertical: 24,
    textAlign: 'center',
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 16,
  },
});
