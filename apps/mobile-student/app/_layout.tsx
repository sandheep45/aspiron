import { QueryProvider } from '@aspiron/tanstack-client'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useMemo } from 'react'
import 'react-native-reanimated'
import '@/assets/global.css'

import type { AxiosConfigOptions } from '@aspiron/api-client'
import { useColorScheme } from '@/hooks/use-color-scheme'

export const unstable_settings = {
  anchor: '(tabs)',
}

const axiosConfig: AxiosConfigOptions = {
  headers: {
    'X-client-type': 'BROWSER',
  },
}

function AppProviders({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme()

  const theme = useMemo(
    () => (colorScheme === 'dark' ? DarkTheme : DefaultTheme),
    [colorScheme],
  )

  return (
    <QueryProvider axiosConfig={axiosConfig}>
      <ThemeProvider value={theme}>{children}</ThemeProvider>
    </QueryProvider>
  )
}

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack>
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        <Stack.Screen
          name='modal'
          options={{ presentation: 'modal', title: 'Modal' }}
        />
      </Stack>
      <StatusBar style='auto' />
    </AppProviders>
  )
}
