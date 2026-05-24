import type { ComponentType } from 'react';
import type { AnalyticsPeriod } from '@/src/types';

export interface GraphComponentProps {
  period: AnalyticsPeriod;
}

export interface GraphDefinition {
  id: string;
  title: string;
  description: string;
  screenTitle: string;
  component: ComponentType<GraphComponentProps>;
}
