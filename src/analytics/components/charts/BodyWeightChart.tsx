import { useCallback, useEffect, useMemo, useState } from "react";
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
import { getBodyWeightHistory } from "@/src/db/queries/analytics";
import { useTheme } from "@/src/hooks/useTheme";
import type { BodyWeightEntry } from "@/src/types";

function formatSessionLabel(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "numeric",
    day: "numeric",
  });
}

function getMaxValue(values: number[], fallback: number): number {
  const max = Math.max(...values, 0);
  if (max === 0) {
    return fallback;
  }

  return Math.ceil(max * 1.05);
}

export function BodyWeightChart({ range }: GraphComponentProps) {
  const { colors } = useTheme();
  const [entries, setEntries] = useState<BodyWeightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBodyWeightHistory(range);
      setEntries(data);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const chartConfig = useMemo(() => {
    const data = entries.map((entry) => ({
      value: entry.bodyWeight,
      label: formatSessionLabel(entry.completedAt),
      dataPointColor: colors.tint,
    }));

    const spacing = getLineSpacing(entries.length);
    const chartWidth = getChartWidth(entries.length, spacing);

    return {
      data,
      chartWidth,
      spacing,
      maxValue: getMaxValue(
        entries.map((entry) => entry.bodyWeight),
        100,
      ),
    };
  }, [colors.tint, entries]);

  if (loading) {
    return (
      <RNView style={styles.loading}>
        <ActivityIndicator size="large" />
      </RNView>
    );
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No body weight logged"
        subtitle="Add your body weight on the workout completion screen or in session history."
      />
    );
  }

  return (
    <RNView
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.axisHint, { color: colors.muted }]}>
        Weight (kg)
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <LineChart
          data={chartConfig.data}
          width={chartConfig.chartWidth}
          spacing={chartConfig.spacing}
          initialSpacing={16}
          maxValue={chartConfig.maxValue}
          {...getCommonLineChartProps(colors, ["Weight"])}
          formatYLabel={(label) => `${label}`}
        />
      </ScrollView>
      <RNView style={styles.footer}>
        {entries.slice(-5).map((entry) => (
          <Text
            key={entry.sessionId}
            style={[styles.footerRow, { color: colors.muted }]}
          >
            {formatSessionLabel(entry.completedAt)}: {entry.bodyWeight} kg
          </Text>
        ))}
      </RNView>
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
