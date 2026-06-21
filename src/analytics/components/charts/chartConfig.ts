import { Dimensions } from 'react-native';

import type { TextStyle } from 'react-native';

import type { ThemeColors } from '@/constants/Colors';

const CHART_HORIZONTAL_PADDING = 48;
export const CHART_HEIGHT = 220;

export function getChartWidth(pointCount: number, spacing: number, extraPadding = 48): number {
  return Math.max(
    Dimensions.get('window').width - CHART_HORIZONTAL_PADDING,
    pointCount * spacing + extraPadding
  );
}

export function getLineSpacing(count: number): number {
  // if (count > 60) {
  //   return 10;
  // }

  // if (count > 30) {
  //   return 14;
  // }

  // if (count > 14) {
  //   return 20;
  // }

  return 35;
}

export function getCommonLineChartProps(colors: ThemeColors): {
  yAxisTextStyle: TextStyle;
  xAxisLabelTextStyle: TextStyle;
  rulesColor: string;
  yAxisColor: string;
  xAxisColor: string;
  isAnimated: boolean;
} {
  return {
    yAxisTextStyle: { color: colors.muted, fontSize: 11 },
    xAxisLabelTextStyle: { color: colors.muted, fontSize: 10, width: 44 },
    rulesColor: colors.border,
    yAxisColor: colors.border,
    xAxisColor: colors.border,
    isAnimated: true,
  };
}

export function getCommonAreaChartProps(colors: ThemeColors): {
  areaChart: true;
  startFillColor: string;
  startOpacity: number;
  endFillColor: string;
  endOpacity: number;
} {
  return {
    areaChart: true,
    startFillColor: colors.tint,
    startOpacity: 0.8,
    endFillColor: colors.tint,
    endOpacity: 0,
  };
}
