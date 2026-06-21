import { Dimensions } from "react-native";

import { Text, TextStyle, View } from "react-native";

import type { ThemeColors } from "@/constants/Colors";
import { Pointer } from "react-native-gifted-charts";

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

export function getCommonLineChartProps(
  colors: ThemeColors,
  titles: Array<string>,
): {
  yAxisTextStyle: TextStyle;
  xAxisLabelTextStyle: TextStyle;
  rulesColor: string;
  yAxisColor: string;
  xAxisColor: string;
  isAnimated: boolean;
  height: number;
  adjustToWidth: boolean;
  formatYLabel: (label: string) => string;
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
  pointerConfig?: Pointer;
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
    pointerConfig: {
      pointerStripUptoDataPoint: true,
      pointerStripColor: "rgba(255,255,255,0.2)",
      pointerStripWidth: 2,
      strokeDashArray: [2, 5], // Creates a dashed indicator line
      pointerColor: colors.tint,
      // 2. Build the floating tooltip layout
      pointerLabelComponent: (items) => {
        return (
          <View
            style={{
              height: 50,
              width: 80,
              backgroundColor: "#2C2C2E",
              borderRadius: 6,
              justifyContent: "center",
              alignItems: "left",
              paddingTop: 10,
              paddingLeft: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            {items.map(
              (
                element: {
                  dataPointColor: string;
                  label: string;
                  value: number;
                },
                index: number,
              ) => (
                <Text
                  style={{
                    color: element.dataPointColor,
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  {titles[index]}: {element.value}
                </Text>
              ),
            )}
          </View>
        );
      },
    },
  };
}
