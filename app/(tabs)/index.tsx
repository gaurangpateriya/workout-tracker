import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from 'react-native';

import { View } from '@/components/Themed';
import { EmptyState } from '@/src/components/EmptyState';
import { PlanCard } from '@/src/components/PlanCard';
import { deletePlan, getAllPlans } from '@/src/db/queries/plans';
import { useTabListPadding } from '@/src/hooks/useTabListPadding';
import { useActiveWorkoutStore } from '@/src/stores/activeWorkout';
import type { WorkoutPlanSummary } from '@/src/types';
import { showAlert } from '@/src/utils/alert';

export default function PlansScreen() {
  const router = useRouter();
  const listPadding = useTabListPadding();
  const startWorkout = useActiveWorkoutStore((s) => s.startWorkout);
  const [plans, setPlans] = useState<WorkoutPlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingPlanId, setStartingPlanId] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    try {
      const data = await getAllPlans();
      setPlans(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadPlans();
    }, [loadPlans])
  );

  const confirmDelete = (plan: WorkoutPlanSummary) => {
    showAlert(
      'Delete Plan',
      `Delete "${plan.name}"? Completed workout history will be kept.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePlan(plan.id);
            loadPlans();
          },
        },
      ]
    );
  };

  const handleStart = async (plan: WorkoutPlanSummary) => {
    if (plan.exerciseCount === 0) {
      showAlert(
        'No Exercises',
        'Add at least one exercise to this plan before starting a workout.'
      );
      return;
    }

    setStartingPlanId(plan.id);
    try {
      const sessionId = await startWorkout(plan.id);
      router.push(`/workout/${sessionId}`);
    } catch (err) {
      showAlert(
        'Could Not Start',
        err instanceof Error ? err.message : 'Failed to start workout.'
      );
    } finally {
      setStartingPlanId(null);
    }
  };

  if (loading && plans.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={plans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          plans.length === 0
            ? { ...styles.emptyList, ...listPadding }
            : listPadding
        }
        ListEmptyComponent={
          <EmptyState
            title="No plans yet"
            subtitle="Tap + to create your first workout plan."
          />
        }
        renderItem={({ item }) => (
          <PlanCard
            plan={item}
            onPress={() => router.push(`/plan/${item.id}`)}
            onDelete={() => confirmDelete(item)}
            onStart={() => handleStart(item)}
            isStarting={startingPlanId === item.id}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyList: {
    flexGrow: 1,
  },
});
