import { uuidv4 } from '@/src/utils/uuid';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  View as RNView,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import { ExerciseRow } from '@/src/components/ExerciseRow';
import { deletePlan, getPlanWithExercises, upsertPlan } from '@/src/db/queries/plans';
import { useTheme } from '@/src/hooks/useTheme';
import { showAlert } from '@/src/utils/alert';

interface DraftExercise {
  id: string;
  name: string;
}

export default function PlanEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const isNew = id === 'new';
  const [planId] = useState(() => (isNew ? uuidv4() : id!));
  const [planName, setPlanName] = useState('');
  const [exercises, setExercises] = useState<DraftExercise[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) {
      return;
    }

    let cancelled = false;

    getPlanWithExercises(id!)
      .then((plan) => {
        if (cancelled) {
          return;
        }
        if (!plan) {
          showAlert('Not Found', 'This plan no longer exists.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
          return;
        }
        setPlanName(plan.name);
        setExercises(
          plan.exercises.map((exercise) => ({
            id: exercise.id,
            name: exercise.name,
          }))
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, isNew, router]);

  const updateExerciseName = useCallback((index: number, name: string) => {
    setExercises((prev) =>
      prev.map((exercise, i) => (i === index ? { ...exercise, name } : exercise))
    );
  }, []);

  const moveExercise = useCallback((index: number, direction: -1 | 1) => {
    setExercises((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) {
        return prev;
      }
      const next = [...prev];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }, []);

  const removeExercise = useCallback((index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addExercise = useCallback(() => {
    setExercises((prev) => [...prev, { id: uuidv4(), name: '' }]);
  }, []);

  const handleDelete = () => {
    showAlert(
      'Delete Plan',
      `Delete "${planName.trim() || 'this plan'}"? Completed workout history will be kept.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              await deletePlan(planId);
              router.back();
            } catch (err) {
              showAlert(
                'Delete Failed',
                err instanceof Error ? err.message : 'Could not delete plan.'
              );
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    const trimmedName = planName.trim();
    if (!trimmedName) {
      showAlert('Missing Name', 'Enter a name for this workout plan.');
      return;
    }

    const trimmedExercises = exercises
      .map((exercise) => ({ ...exercise, name: exercise.name.trim() }))
      .filter((exercise) => exercise.name.length > 0);

    if (trimmedExercises.length === 0) {
      showAlert('No Exercises', 'Add at least one exercise to this plan.');
      return;
    }

    setSaving(true);
    try {
      await upsertPlan(
        { id: planId, name: trimmedName },
        trimmedExercises.map((exercise, index) => ({
          id: exercise.id,
          name: exercise.name,
          sortOrder: index,
        }))
      );
      router.back();
    } catch (err) {
      showAlert(
        'Save Failed',
        err instanceof Error ? err.message : 'Could not save plan.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: isNew ? 'New Plan' : 'Edit Plan',
          headerRight: () => (
            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={({ pressed }) => [
                styles.saveButton,
                { opacity: pressed || saving ? 0.5 : 1 },
              ]}
            >
              <Text style={[styles.saveHeader, { color: colors.tint }]}>
                {saving ? 'Saving…' : 'Save'}
              </Text>
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Plan Name</Text>
          <TextInput
            value={planName}
            onChangeText={setPlanName}
            placeholder="e.g. Push Day"
            placeholderTextColor={colors.placeholder}
            style={[
              styles.nameInput,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.card,
              },
            ]}
          />

          <RNView style={styles.exerciseHeader}>
            <Text style={styles.label}>Exercises</Text>
            <Pressable
              onPress={addExercise}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Text style={[styles.addLink, { color: colors.tint }]}>+ Add</Text>
            </Pressable>
          </RNView>

          {exercises.length === 0 ? (
            <Text style={[styles.hint, { color: colors.muted }]}>
              No exercises yet. Tap + Add to create one.
            </Text>
          ) : (
            exercises.map((exercise, index) => (
              <ExerciseRow
                key={exercise.id}
                name={exercise.name}
                index={index}
                total={exercises.length}
                onChangeName={(name) => updateExerciseName(index, name)}
                onMoveUp={() => moveExercise(index, -1)}
                onMoveDown={() => moveExercise(index, 1)}
                onRemove={() => removeExercise(index)}
              />
            ))
          )}

          {!isNew ? (
            <Pressable
              onPress={handleDelete}
              disabled={saving}
              style={({ pressed }) => [
                styles.deleteButton,
                { opacity: pressed || saving ? 0.5 : 1 },
              ]}
            >
              <Text style={[styles.deleteHeader, { color: colors.error }]}>Delete Plan</Text>
            </Pressable>
          ) : null}
        </ScrollView>
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
    paddingBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.7,
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 17,
    marginBottom: 24,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addLink: {
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 15,
  },
  saveButton: {
    marginHorizontal: 8,
    minWidth: 44,
    // minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveHeader: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },
  deleteHeader: {
    fontSize: 17,
    fontWeight: '600',
  },
  deleteButton: {
    marginTop: 32,
    paddingVertical: 14,
    alignItems: 'center',
  },
});
