import { ScrollView, StyleSheet, View as RNView } from 'react-native';

import { View } from '@/components/Themed';
import { PeriodSelector } from '@/src/analytics/components/PeriodSelector';
import type { AnalyticsPeriod } from '@/src/types';

interface GraphScreenLayoutProps {
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  children: React.ReactNode;
}

export function GraphScreenLayout({
  period,
  onPeriodChange,
  children,
}: GraphScreenLayoutProps) {
  return (
    <View style={styles.container}>
      <RNView style={styles.controls}>
        <PeriodSelector value={period} onChange={onPeriodChange} />
      </RNView>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controls: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
});
