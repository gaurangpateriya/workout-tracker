const tintColorLight = '#2563eb';
const tintColorDark = '#60a5fa';

export type ColorScheme = 'light' | 'dark';

export type ThemeColors = {
  text: string;
  background: string;
  card: string;
  tint: string;
  tabIconDefault: string;
  tabIconSelected: string;
  border: string;
  placeholder: string;
  muted: string;
  error: string;
  errorBackground: string;
  buttonText: string;
  tabBar: string;
  overlay: string;
};

const Colors: Record<ColorScheme, ThemeColors> = {
  light: {
    text: '#111827',
    background: '#f9fafb',
    card: '#ffffff',
    tint: tintColorLight,
    tabIconDefault: '#9ca3af',
    tabIconSelected: tintColorLight,
    border: 'rgba(0,0,0,0.1)',
    placeholder: 'rgba(0,0,0,0.4)',
    muted: 'rgba(0,0,0,0.55)',
    error: '#dc2626',
    errorBackground: 'rgba(220,38,38,0.12)',
    buttonText: '#ffffff',
    tabBar: '#ffffff',
    overlay: 'rgba(0,0,0,0.45)',
  },
  dark: {
    text: '#f9fafb',
    background: '#0f172a',
    card: '#1e293b',
    tint: tintColorDark,
    tabIconDefault: '#64748b',
    tabIconSelected: tintColorDark,
    border: 'rgba(255,255,255,0.12)',
    placeholder: 'rgba(255,255,255,0.4)',
    muted: 'rgba(255,255,255,0.55)',
    error: '#f87171',
    errorBackground: 'rgba(248,113,113,0.15)',
    buttonText: '#0f172a',
    tabBar: '#1e293b',
    overlay: 'rgba(0,0,0,0.6)',
  },
};

export default Colors;
