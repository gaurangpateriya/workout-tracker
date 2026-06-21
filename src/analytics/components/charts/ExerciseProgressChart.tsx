import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  View as RNView,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { LineChart, yAxisSides } from "react-native-gifted-charts";

import {
  CHART_HEIGHT,
  getChartWidth,
  getCommonAreaChartProps,
  getCommonLineChartProps,
  getLineSpacing,
} from "@/src/analytics/components/charts/chartConfig";
import { LoggedExercisePicker } from "@/src/analytics/components/charts/LoggedExercisePicker";
import type { GraphComponentProps } from "@/src/analytics/types";
import { EmptyState } from "@/src/components/EmptyState";
import {
  getExerciseProgress,
  getLoggedExerciseNames,
} from "@/src/db/queries/analytics";
import { useTheme } from "@/src/hooks/useTheme";
import type { ExerciseSessionStats } from "@/src/types";

function formatSessionLabel(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getMaxValue(values: number[], fallback: number): number {
  const max = Math.max(...values, 0);
  if (max === 0) {
    return fallback;
  }

  return Math.ceil(max * 1.15);
}

export function ExerciseProgressChart({ range }: GraphComponentProps) {
  const { colors } = useTheme();
  const [exerciseName, setExerciseName] = useState<string | null>(null);
  const [stats, setStats] = useState<ExerciseSessionStats[]>([]);
  const [initializing, setInitializing] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [hasExercises, setHasExercises] = useState(true);

  useEffect(() => {
    getLoggedExerciseNames().then((names) => {
      setHasExercises(names.length > 0);
      if (names.length > 0) {
        setExerciseName((current) => current ?? names[0]);
      }
      setInitializing(false);
    });
  }, []);

  const loadStats = useCallback(async () => {
    if (!exerciseName) {
      setStats([]);
      return;
    }

    setLoadingStats(true);
    try {
      const data = await getExerciseProgress(exerciseName, range);
      setStats(data);
    } finally {
      setLoadingStats(false);
    }
  }, [exerciseName, range]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const chartConfig = useMemo(() => {
    const weightData = stats.map((entry) => ({
      value: entry.maxWeight,
      label: formatSessionLabel(entry.completedAt),
      dataPointColor: colors.tint,
    }));

    const repsData = stats.map((entry) => ({
      value: entry.maxReps,
      label: formatSessionLabel(entry.completedAt),
      dataPointColor: colors.muted,
    }));

    const spacing = getLineSpacing(stats.length);
    const chartWidth = getChartWidth(stats.length, spacing);

    return {
      weightData,
      repsData,
      chartWidth,
      spacing,
      maxWeight: getMaxValue(
        stats.map((entry) => entry.maxWeight),
        100,
      ),
      maxReps: getMaxValue(
        stats.map((entry) => entry.maxReps),
        12,
      ),
    };
  }, [colors.muted, colors.tint, stats]);

  if (initializing) {
    return (
      <RNView style={styles.loading}>
        <ActivityIndicator size="large" />
      </RNView>
    );
  }

  if (!hasExercises) {
    return (
      <EmptyState
        title="No exercises logged"
        subtitle="Complete a workout to track exercise progress."
      />
    );
  }

  return (
    <>
      <LoggedExercisePicker value={exerciseName} onChange={setExerciseName} />

      {loadingStats ? (
        <RNView style={styles.loading}>
          <ActivityIndicator size="large" />
        </RNView>
      ) : !exerciseName ? (
        <EmptyState
          title="Select an exercise"
          subtitle="Choose an exercise to view progress."
        />
      ) : stats.length === 0 ? (
        <EmptyState
          title="No data for this period"
          subtitle={`No logged sets for ${exerciseName} in the selected date range.`}
        />
      ) : (
        <RNView
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <RNView style={styles.legendRow}>
            <RNView style={styles.legendItem}>
              <RNView
                style={[styles.legendDot, { backgroundColor: colors.tint }]}
              />
              <Text style={[styles.legendLabel, { color: colors.text }]}>
                Max weight
              </Text>
            </RNView>
            <RNView style={styles.legendItem}>
              <RNView
                style={[styles.legendDot, { backgroundColor: colors.muted }]}
              />
              <Text style={[styles.legendLabel, { color: colors.text }]}>
                Max reps
              </Text>
            </RNView>
          </RNView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              {...getCommonAreaChartProps(colors)}
              data={chartConfig.weightData}
              data2={chartConfig.repsData}
              height={CHART_HEIGHT}
              width={chartConfig.chartWidth}
              spacing={chartConfig.spacing}
              initialSpacing={16}
              maxValue={chartConfig.maxWeight}
              noOfSections={4}
              color1={colors.tint}
              color2={colors.muted}
              thickness={2}
              dataPointsColor1={colors.tint}
              dataPointsColor2={colors.muted}
              {...getCommonLineChartProps(colors)}
              secondaryYAxis={{
                maxValue: chartConfig.maxReps,
                noOfSections: 4,
                yAxisSide: yAxisSides.RIGHT,
                yAxisColor: colors.border,
                yAxisTextStyle: { color: colors.muted, fontSize: 11 },
              }}
            />
          </ScrollView>
        </RNView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    paddingTop: 16,
    paddingBottom: 12,
    paddingLeft: 8,
    overflow: "hidden",
  },
  legendRow: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
});
