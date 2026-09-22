import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nProvider } from '../utils/i18n.js';
import { AuthProvider } from '../context/AuthContext.js';
import { LocationProvider } from '../context/LocationContext.js';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 3 // 3 minutes cache
    }
  }
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <LocationProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#FFFFFF'
                },
                headerTintColor: '#0F172A',
                headerTitleStyle: {
                  fontWeight: '700'
                },
                contentStyle: {
                  backgroundColor: '#F8FAFC'
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
          </LocationProvider>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
