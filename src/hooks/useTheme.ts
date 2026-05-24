import Colors, { type ColorScheme, type ThemeColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export function useTheme(): { colorScheme: ColorScheme; colors: ThemeColors } {
  const colorScheme = useColorScheme();
  return { colorScheme, colors: Colors[colorScheme] };
}
