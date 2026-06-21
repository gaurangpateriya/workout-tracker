import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  View as RNView,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";

import {
  getChartWidth,
  getCommonLineChartProps,
  getLineSpacing,
} from "@/src/analytics/components/charts/chartConfig";
import type { GraphComponentProps } from "@/src/analytics/types";
import { EmptyState } from "@/src/components/EmptyState";
import { getDailyWorkoutTime } from "@/src/db/queries/analytics";
import { useTheme } from "@/src/hooks/useTheme";
import type { DailyWorkoutTimePoint } from "@/src/types";

function toChartMinutes(totalSeconds: number): number {
  return Math.round((totalSeconds / 60) * 10) / 10;
}

function getMaxChartValue(points: DailyWorkoutTimePoint[]): number {
  const maxMinutes = Math.max(
    ...points.map((point) => toChartMinutes(point.totalSeconds)),
    0,
  );
  if (maxMinutes === 0) {
    return 60;
  }

  return Math.ceil(maxMinutes * 1.2);
}

export function DailyWorkoutTimeChart({ range }: GraphComponentProps) {
  const { colors } = useTheme();
  const [points, setPoints] = useState<DailyWorkoutTimePoint[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDailyWorkoutTime(range);
      setPoints(data);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <RNView style={styles.loading}>
        <ActivityIndicator size="large" />
      </RNView>
    );
  }

  const hasData = points.some((point) => point.totalSeconds > 0);

  if (!hasData) {
    return (
      <EmptyState
        title="No workout time yet"
        subtitle="Complete workouts in this date range to see your time chart."
      />
    );
  }

  const lineData = points.map((point) => ({
    value: toChartMinutes(point.totalSeconds),
    label: point.label,
    dataPointColor: colors.tint,
  }));

  const maxValue = getMaxChartValue(points);
  const spacing = getLineSpacing(points.length);
  const chartWidth = getChartWidth(points.length, spacing, 80);

  return (
    <RNView
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.axisHint, { color: colors.muted }]}>
        Minutes per bucket
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <LineChart
          data={lineData}
          width={chartWidth}
          spacing={spacing}
          maxValue={maxValue}
          {...getCommonLineChartProps(colors)}
        />
      </ScrollView>
      {/* <RNView style={styles.footer}>
        {points
          .filter((point) => point.totalSeconds > 0)
          .slice(-5)
          .map((point) => (
            <Text
              key={point.dateKey}
              style={[styles.footerRow, { color: colors.muted }]}
            >
              {point.label}: {formatWorkoutDuration(point.totalSeconds)}
            </Text>
          ))}
      </RNView> */}
    </RNView>
  );
}

const styles = StyleSheet.create({
  loading: {
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
  axisHint: {
    fontSize: 13,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  footer: {
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 4,
  },
  footerRow: {
    fontSize: 13,
  },
});
