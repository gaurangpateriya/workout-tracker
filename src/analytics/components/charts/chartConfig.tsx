import { Dimensions } from "react-native";

import { Text, TextStyle, View } from "react-native";

import type { ThemeColors } from "@/constants/Colors";

const CHART_HORIZONTAL_PADDING = 48;
export const CHART_HEIGHT = 220;

export function getChartWidth(
  pointCount: number,
  spacing: number,
  extraPadding = 48,
): number {
  return Math.max(
    Dimensions.get("window").width - CHART_HORIZONTAL_PADDING,
    pointCount * spacing + extraPadding,
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
  height: number;
  adjustToWidth: boolean;
  formatYLabel: (label: string) => string;
  renderTooltip: Function;
  hideDataPoints: boolean;
  color: string;
  noOfSections: number;
  thickness: number;
  dataPointsColor: string;
  areaChart: true;
  startFillColor: string;
  startOpacity: number;
  endFillColor: string;
  endOpacity: number;
  dataPointsRadius: number;
} {
  return {
    yAxisTextStyle: { color: colors.muted, fontSize: 11 },
    xAxisLabelTextStyle: { color: colors.muted, fontSize: 10, width: 44 },
    rulesColor: colors.border,
    yAxisColor: colors.border,
    xAxisColor: colors.border,
    isAnimated: true,
    height: CHART_HEIGHT,
    adjustToWidth: true,
    hideDataPoints: false,
    color: colors.tint,
    noOfSections: 4,
    thickness: 2,
    dataPointsColor: colors.tint,
    dataPointsRadius: 4,
    formatYLabel: (label) => `${label}`,
    areaChart: true,
    startFillColor: colors.tint,
    startOpacity: 0.8,
    endFillColor: colors.tint,
    endOpacity: 0,
    renderTooltip: (item: { value: string }, index: number) => {
      return (
        <View
          style={{
            marginBottom: 20,
            marginLeft: -6,
            backgroundColor: "#ffcefe",
            paddingHorizontal: 6,
            paddingVertical: 4,
            borderRadius: 4,
          }}
        >
          <Text>{item.value}</Text>
        </View>
      );
    },
  };
}
