import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nProvider, useTranslation } from '../utils/i18n';
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
  const { t } = useTranslation();

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
        <Stack.Screen name="language" options={{ title: t('select_language') }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: t('login') }} />
        <Stack.Screen name="verify-otp" options={{ title: t('verify') }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="job/create" options={{ title: t('confirm_request') }} />
        <Stack.Screen name="job/[id]" options={{ title: t('job_details') }} />
        <Stack.Screen name="worker/[id]" options={{ title: t('profile') }} />
        <Stack.Screen name="worker/index" options={{ title: t('worker_mode') }} />
        <Stack.Screen name="worker/jobs" options={{ title: t('incoming_requests') }} />
        <Stack.Screen name="worker/profile" options={{ title: t('edit_worker_profile') }} />
        <Stack.Screen name="worker/job/[id]" options={{ title: t('active_job') }} />
        <Stack.Screen name="settings" options={{ title: t('settings') }} />
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
