import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { View } from '@/components/Themed';
import { EmptyState } from '@/src/components/EmptyState';
import { GraphScreenLayout } from '@/src/analytics/components/GraphScreenLayout';
import { getGraphById } from '@/src/analytics/registry';
import type { AnalyticsPeriod } from '@/src/types';

export default function GraphDetailScreen() {
  const { graphId } = useLocalSearchParams<{ graphId: string }>();
  const navigation = useNavigation();
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');

  const graph = graphId ? getGraphById(graphId) : undefined;
  const ChartComponent = graph?.component;

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
    <GraphScreenLayout period={period} onPeriodChange={setPeriod}>
      <ChartComponent period={period} />
    </GraphScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
