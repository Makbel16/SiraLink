import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext.js';

export default function EntryScreen() {
  const router = useRouter();
  const { isLoading, isAuthenticated, isWorker } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (isWorker) {
          router.replace('/worker');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        router.replace('/language');
      }
    }
  }, [isLoading, isAuthenticated, isWorker]);

  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Text style={styles.logoText}>ስራ</Text>
      </View>
      <Text style={styles.brandTitle}>SiraLink</Text>
      <Text style={styles.brandSubtitle}>ስራLink — ኢትዮጵያ</Text>
      <ActivityIndicator size="large" color="#0F766E" style={{ marginTop: 28 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8
  },
  logoText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5
  },
  brandSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 6,
    fontWeight: '500'
  }
});
