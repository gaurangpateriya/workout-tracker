import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from 'react-native';

import { View } from '@/components/Themed';
import { EmptyState } from '@/src/components/EmptyState';
import { SessionCard } from '@/src/components/SessionCard';
import { getCompletedSessions } from '@/src/db/queries/history';
import type { CompletedSessionSummary } from '@/src/types';

export default function HistoryScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<CompletedSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    try {
      const data = await getCompletedSessions();
      setSessions(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadSessions();
    }, [loadSessions])
  );

  if (loading && sessions.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          sessions.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            title="No workouts completed"
            subtitle="Finish a workout to see it here."
          />
        }
        renderItem={({ item }) => (
          <SessionCard
            session={item}
            onPress={() => router.push(`/session/${item.id}`)}
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
  list: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
    padding: 16,
  },
});
