import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nProvider } from '../utils/i18n';
import { AuthProvider } from '../context/AuthContext';
import { LocationProvider } from '../context/LocationContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 3 // 3 minutes cache
    }
  }
});

function RootNavigation() {
  const { isDark, colors } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: '700'
          },
          contentStyle: {
            backgroundColor: colors.background
          }
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="language" options={{ title: 'Language / ቋንቋ' }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="verify-otp" options={{ title: 'Verify Phone' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="job/create" options={{ title: 'Confirm Service Request' }} />
        <Stack.Screen name="job/[id]" options={{ title: 'Job Details' }} />
        <Stack.Screen name="worker/[id]" options={{ title: 'Worker Profile' }} />
        <Stack.Screen name="worker/index" options={{ title: 'Worker Dashboard' }} />
        <Stack.Screen name="worker/jobs" options={{ title: 'Incoming Requests' }} />
        <Stack.Screen name="worker/profile" options={{ title: 'Edit Worker Profile' }} />
        <Stack.Screen name="worker/job/[id]" options={{ title: 'Active Job' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <LocationProvider>
            <ThemeProvider>
              <RootNavigation />
            </ThemeProvider>
          </LocationProvider>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
