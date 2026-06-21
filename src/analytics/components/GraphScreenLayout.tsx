import { ScrollView, StyleSheet, View as RNView } from 'react-native';

import { View } from '@/components/Themed';
import { DashboardDateRangePicker } from '@/src/analytics/components/DashboardDateRangePicker';
import type { DashboardDateRange } from '@/src/analytics/types';

interface GraphScreenLayoutProps {
  days: number;
  onDaysChange: (days: number) => void;
  range: DashboardDateRange | null;
  onRangeChange: (range: DashboardDateRange | null) => void;
  children: React.ReactNode;
}

export function GraphScreenLayout({
  days,
  onDaysChange,
  range,
  onRangeChange,
  children,
}: GraphScreenLayoutProps) {
  return (
    <View style={styles.container}>
      <RNView style={styles.controls}>
        <DashboardDateRangePicker
          days={days}
          onDaysChange={onDaysChange}
          range={range}
          onRangeChange={onRangeChange}
        />
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
