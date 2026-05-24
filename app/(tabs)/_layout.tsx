import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

const TAB_BAR_HEIGHT = Platform.select({ ios: 49, default: 56 }) ?? 56;

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom,
          height: TAB_BAR_HEIGHT + insets.bottom,
        },
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        sceneStyle: { backgroundColor: colors.background },
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Plans',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="list" size={28} color={color} />
          ),
          headerRight: () => (
            <Link href="/plan/new" asChild>
              <Pressable style={{ marginRight: 15 }}>
                {({ pressed }) => (
                  <FontAwesome
                    name="plus"
                    size={25}
                    color={colors.tint}
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="history" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="bar-chart" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
