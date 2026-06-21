import { View as RNView, StyleSheet } from "react-native";

import { Text } from "@/components/Themed";
import { useTheme } from "@/src/hooks/useTheme";

interface ChartPointSummaryProps {
  title: string;
  rows: Array<{
    label: string;
    value: string;
  }>;
}

export function ChartPointSummary({ title, rows }: ChartPointSummaryProps) {
  const { colors } = useTheme();

  return (
    <RNView
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={styles.title}>{title}</Text>
      <RNView style={styles.rows}>
        {rows.map((row) => (
          <RNView key={`${row.label}-${row.value}`} style={styles.row}>
            <Text style={[styles.label, { color: colors.muted }]}>
              {row.label}
            </Text>
            <Text style={styles.value}>{row.value}</Text>
          </RNView>
        ))}
      </RNView>
    </RNView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  rows: {
    gap: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  value: {
    fontSize: 12,
    fontWeight: "600",
  },
});
