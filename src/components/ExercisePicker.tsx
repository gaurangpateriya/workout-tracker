import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View as RNView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Themed';
import {
  ensureExerciseInCatalog,
  searchCatalogExercises,
} from '@/src/db/queries/exercises';
import { useTheme } from '@/src/hooks/useTheme';
import type { CatalogExercise } from '@/src/types';

interface ExercisePickerProps {
  value: string;
  onChange: (name: string) => void;
  placeholder?: string;
}

export function ExercisePicker({
  value,
  onChange,
  placeholder = 'Select exercise',
}: ExercisePickerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CatalogExercise[]>([]);
  const [loading, setLoading] = useState(false);

  const loadResults = useCallback(async (searchQuery: string) => {
    setLoading(true);
    try {
      const exercises = await searchCatalogExercises(searchQuery);
      setResults(exercises);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeout = setTimeout(() => {
      loadResults(query);
    }, 150);

    return () => clearTimeout(timeout);
  }, [open, query, loadResults]);

  const trimmedQuery = query.trim();
  const hasExactMatch = useMemo(
    () =>
      results.some(
        (exercise) => exercise.name.toLowerCase() === trimmedQuery.toLowerCase()
      ),
    [results, trimmedQuery]
  );

  const openPicker = () => {
    setQuery(value);
    setOpen(true);
  };

  const selectExercise = (name: string) => {
    onChange(name);
    void ensureExerciseInCatalog(name);
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <Pressable
        onPress={openPicker}
        style={({ pressed }) => [
          styles.trigger,
          {
            borderColor: colors.border,
            backgroundColor: colors.card,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.triggerText,
            { color: value ? colors.text : colors.placeholder },
          ]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <Text style={[styles.chevron, { color: colors.muted }]}>▾</Text>
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <RNView
          style={[
            styles.container,
            {
              backgroundColor: colors.card,
              paddingTop: insets.top + 16,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <Text style={[styles.sheetTitle, { color: colors.text }]}>
            Choose Exercise
          </Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search exercises…"
            placeholderTextColor={colors.placeholder}
            autoFocus
            style={[
              styles.searchInput,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
          />

          {loading ? (
            <RNView style={styles.loading}>
              <ActivityIndicator color={colors.tint} />
            </RNView>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              ListEmptyComponent={
                trimmedQuery ? (
                  <Text style={[styles.emptyText, { color: colors.muted }]}>
                    No matches found
                  </Text>
                ) : null
              }
              ListFooterComponent={
                trimmedQuery && !hasExactMatch ? (
                  <Pressable
                    onPress={() => selectExercise(trimmedQuery)}
                    style={({ pressed }) => [
                      styles.customOption,
                      {
                        borderColor: colors.border,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.customLabel, { color: colors.tint }]}>
                      Use custom: "{trimmedQuery}"
                    </Text>
                  </Pressable>
                ) : null
              }
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => selectExercise(item.name)}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor:
                        item.name === value ? `${colors.tint}18` : 'transparent',
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {item.name}
                  </Text>
                </Pressable>
              )}
            />
          )}

          <Pressable
            onPress={() => setOpen(false)}
            style={({ pressed }) => [
              styles.cancelButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Text style={[styles.cancelLabel, { color: colors.muted }]}>
              Cancel
            </Text>
          </Pressable>
        </RNView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  triggerText: {
    flex: 1,
    fontSize: 16,
  },
  chevron: {
    fontSize: 14,
    marginLeft: 8,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 8,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 16,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 16,
  },
  customOption: {
    marginTop: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  customLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelLabel: {
    fontSize: 16,
  },
});
