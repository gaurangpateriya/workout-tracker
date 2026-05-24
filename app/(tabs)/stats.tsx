import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { View } from '@/components/Themed';
import { GraphHubCard } from '@/src/analytics/components/GraphHubCard';
import { GRAPH_REGISTRY } from '@/src/analytics/registry';
import { EmptyState } from '@/src/components/EmptyState';

export default function StatsScreen() {
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      // Reserved for future summary refreshes when graph cards show live stats.
    }, [])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={GRAPH_REGISTRY}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          GRAPH_REGISTRY.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            title="No graphs available"
            subtitle="Charts will appear here once configured."
          />
        }
        renderItem={({ item }) => (
          <GraphHubCard
            graph={item}
            onPress={() => router.push(`/stats/${item.id}`)}
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
  list: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
    padding: 16,
  },
});
