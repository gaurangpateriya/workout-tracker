import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { View } from '@/components/Themed';
import { getLastNDaysRange } from '@/src/analytics/dateRanges';
import { EmptyState } from '@/src/components/EmptyState';
import { GraphScreenLayout } from '@/src/analytics/components/GraphScreenLayout';
import { getGraphById } from '@/src/analytics/registry';
import type { DashboardDateRange } from '@/src/analytics/types';

export default function GraphDetailScreen() {
  const { graphId } = useLocalSearchParams<{ graphId: string }>();
  const navigation = useNavigation();
  const [days, setDays] = useState(7);
  const [customRange, setCustomRange] = useState<DashboardDateRange | null>(null);

  const graph = graphId ? getGraphById(graphId) : undefined;
  const ChartComponent = graph?.component;
  const activeRange = customRange ?? getLastNDaysRange(days);

  useEffect(() => {
    if (graph) {
      navigation.setOptions({ title: graph.screenTitle });
    }
  }, [graph, navigation]);

  if (!graph || !ChartComponent) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Graph not found"
          subtitle="This chart is not available."
        />
      </View>
    );
  }

  return (
    <GraphScreenLayout
      days={days}
      onDaysChange={setDays}
      range={customRange}
      onRangeChange={setCustomRange}
    >
      <ChartComponent range={activeRange} />
    </GraphScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
