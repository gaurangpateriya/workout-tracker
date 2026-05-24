import { useEffect, useState } from 'react';
import { StyleSheet, View as RNView } from 'react-native';

import { Text } from '@/components/Themed';
import { useTheme } from '@/src/hooks/useTheme';
import { formatTimerDuration } from '@/src/utils/formatDuration';

interface RestTimerProps {
  restStartedAt: number | null;
}

export function RestTimer({ restStartedAt }: RestTimerProps) {
  const { colors } = useTheme();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (restStartedAt === null) {
      setElapsed(0);
      return;
    }

    const tick = () => {
      setElapsed(Math.floor((Date.now() - restStartedAt) / 1000));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [restStartedAt]);

  if (restStartedAt === null) {
    return null;
  }

  return (
    <RNView style={[styles.banner, { backgroundColor: `${colors.tint}18` }]}>
      <Text style={[styles.label, { color: colors.tint }]}>
        Rest: {formatTimerDuration(elapsed)}
      </Text>
    </RNView>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
