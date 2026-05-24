import { Pressable, StyleSheet, View as RNView } from 'react-native';

import { Text } from '@/components/Themed';
import { useTheme } from '@/src/hooks/useTheme';
import type { AnalyticsPeriod } from '@/src/types';

const PERIODS: { id: AnalyticsPeriod; label: string }[] = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'year', label: 'Year' },
];

interface PeriodSelectorProps {
  value: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const { colors } = useTheme();

  return (
    <RNView
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {PERIODS.map((period) => {
        const selected = period.id === value;

        return (
          <Pressable
            key={period.id}
            onPress={() => onChange(period.id)}
            style={({ pressed }) => [
              styles.segment,
              selected && { backgroundColor: colors.tint },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: selected ? colors.buttonText : colors.text },
              ]}
            >
              {period.label}
            </Text>
          </Pressable>
        );
      })}
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 4,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
