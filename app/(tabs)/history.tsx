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
import { deleteSession } from '@/src/db/queries/sessions';
import { useTabListPadding } from '@/src/hooks/useTabListPadding';
import type { CompletedSessionSummary } from '@/src/types';
import { showAlert } from '@/src/utils/alert';

export default function HistoryScreen() {
  const router = useRouter();
  const listPadding = useTabListPadding();
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

  const confirmDelete = (session: CompletedSessionSummary) => {
    showAlert(
      'Delete Workout',
      `Delete "${session.planName}" from ${new Date(session.completedAt).toLocaleDateString()}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSession(session.id);
            loadSessions();
          },
        },
      ]
    );
  };

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
          sessions.length === 0
            ? { ...styles.emptyList, ...listPadding }
            : listPadding
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
            onDelete={() => confirmDelete(item)}
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
