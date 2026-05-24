import { useEffect, useState } from 'react';
import { StyleSheet, View as RNView } from 'react-native';

import { Text } from '@/components/Themed';
import { formatTimerDuration } from '@/src/utils/formatDuration';

interface WorkoutTimerProps {
  startedAt: number;
}

export function WorkoutTimer({ startedAt }: WorkoutTimerProps) {
  const [elapsed, setElapsed] = useState(() =>
    Math.floor((Date.now() - startedAt) / 1000)
  );

  useEffect(() => {
    const tick = () => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <RNView style={styles.container}>
      <Text style={styles.timer}>{formatTimerDuration(elapsed)}</Text>
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 15,
  },
  timer: {
    fontSize: 17,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
