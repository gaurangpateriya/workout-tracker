import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View as RNView } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

import { EmptyState } from '@/src/components/EmptyState';
import { getDailyWorkoutTime } from '@/src/db/queries/analytics';
import { useTheme } from '@/src/hooks/useTheme';
import type { GraphComponentProps } from '@/src/analytics/types';
import type { DailyWorkoutTimePoint } from '@/src/types';
import { formatWorkoutDuration } from '@/src/utils/formatDuration';

const CHART_HEIGHT = 220;

function toChartMinutes(totalSeconds: number): number {
  return Math.round((totalSeconds / 60) * 10) / 10;
}

function getMaxChartValue(points: DailyWorkoutTimePoint[]): number {
  const maxMinutes = Math.max(...points.map((point) => toChartMinutes(point.totalSeconds)), 0);
  if (maxMinutes === 0) {
    return 60;
  }

  return Math.ceil(maxMinutes * 1.2);
}

export function DailyWorkoutTimeChart({ period }: GraphComponentProps) {
  const { colors } = useTheme();
  const [points, setPoints] = useState<DailyWorkoutTimePoint[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDailyWorkoutTime(period);
      setPoints(data);
    } finally {
      setLoading(false);
    }
  }, [period]);

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
        subtitle="Complete workouts in this period to see your time chart."
      />
    );
  }

  const barData = points.map((point) => ({
    value: toChartMinutes(point.totalSeconds),
    label: point.label,
    frontColor: colors.tint,
  }));

  const maxValue = getMaxChartValue(points);
  const barWidth = period === 'month' ? 8 : period === 'year' ? 18 : 28;
  const spacing = period === 'month' ? 4 : period === 'year' ? 12 : 16;
  const chartWidth = Math.max(
    Dimensions.get('window').width - 48,
    points.length * (barWidth + spacing) + 40
  );

  return (
    <RNView
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.axisHint, { color: colors.muted }]}>Minutes per bucket</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={barData}
          height={CHART_HEIGHT}
          width={chartWidth}
          barWidth={barWidth}
          spacing={spacing}
          maxValue={maxValue}
          noOfSections={4}
          yAxisTextStyle={{ color: colors.muted, fontSize: 11 }}
          xAxisLabelTextStyle={{ color: colors.muted, fontSize: 10, width: 40 }}
          rulesColor={colors.border}
          yAxisColor={colors.border}
          xAxisColor={colors.border}
          isAnimated
          formatYLabel={(label) => `${label}m`}
        />
      </ScrollView>
      <RNView style={styles.footer}>
        {points
          .filter((point) => point.totalSeconds > 0)
          .slice(-5)
          .map((point) => (
            <Text key={point.dateKey} style={[styles.footerRow, { color: colors.muted }]}>
              {point.label}: {formatWorkoutDuration(point.totalSeconds)}
            </Text>
          ))}
      </RNView>
    </RNView>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    paddingTop: 16,
    paddingBottom: 12,
    paddingLeft: 8,
    overflow: 'hidden',
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
