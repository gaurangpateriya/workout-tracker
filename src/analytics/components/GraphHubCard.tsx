import { Pressable, StyleSheet, View as RNView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Text } from '@/components/Themed';
import { useTheme } from '@/src/hooks/useTheme';
import type { GraphDefinition } from '@/src/analytics/types';

interface GraphHubCardProps {
  graph: GraphDefinition;
  onPress: () => void;
}

export function GraphHubCard({ graph, onPress }: GraphHubCardProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: colors.border,
          backgroundColor: colors.card,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <RNView style={styles.content}>
        <Text style={styles.title}>{graph.title}</Text>
        <Text style={[styles.description, { color: colors.muted }]}>
          {graph.description}
        </Text>
      </RNView>
      <FontAwesome name="chevron-right" size={14} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
});
