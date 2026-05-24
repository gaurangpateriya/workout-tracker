import { useCallback, useState } from 'react';

import type { AnalyticsPeriod } from '@/src/types';

export function useGraphPeriod(initialPeriod: AnalyticsPeriod = 'week') {
  const [period, setPeriod] = useState<AnalyticsPeriod>(initialPeriod);

  const resetPeriod = useCallback(() => {
    setPeriod(initialPeriod);
  }, [initialPeriod]);

  return {
    period,
    setPeriod,
    resetPeriod,
  };
}
