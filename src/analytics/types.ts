import type { ComponentType } from 'react';
export interface DashboardDateRange {
  startMs: number;
  endMs: number;
}

export interface GraphComponentProps {
  range: DashboardDateRange;
}

export interface GraphDefinition {
  id: string;
  title: string;
  description: string;
  screenTitle: string;
  component: ComponentType<GraphComponentProps>;
}
