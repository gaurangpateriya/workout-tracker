import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

function getSystemScheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return 'light';
}

export function useColorScheme(): 'light' | 'dark' {
  const rnScheme = useRNColorScheme();
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(getSystemScheme);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => {
      setSystemScheme(event.matches ? 'dark' : 'light');
    };

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  if (rnScheme === 'dark' || rnScheme === 'light') {
    return rnScheme;
  }

  return systemScheme;
}
