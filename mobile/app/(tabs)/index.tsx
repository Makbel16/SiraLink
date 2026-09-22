import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Bell, SlidersHorizontal } from 'lucide-react-native';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useLocation } from '../../context/LocationContext.js';
import { useTranslation } from '../../utils/i18n.js';
import { VoiceRecorder } from '../../components/VoiceRecorder.js';
import { MapView } from '../../components/MapView.js';
import { LoadingState } from '../../components/LoadingState.js';
import { JobCategory, NearbyWorker, TranscriptionResult } from '../../types/index.js';

export default function ClientHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentLocation, refreshLocation } = useLocation();
  const { t } = useTranslation();

  const [selectedCategory, setSelectedCategory] = useState<JobCategory | undefined>(undefined);
  const [radiusKm, setRadiusKm] = useState<number>(10);

  // Fetch nearby workers using PostGIS backend
  const {
    data: workers = [],
    isLoading: isWorkersLoading,
    refetch: refetchWorkers,
    isRefetching
  } = useQuery({
    queryKey: ['nearby-workers', currentLocation.latitude, currentLocation.longitude, selectedCategory, radiusKm],
    queryFn: () =>
      api.getNearbyWorkers({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        radiusKm,
        category: selectedCategory
      })
  });

  const categories: { key?: JobCategory; label: string; emoji: string }[] = [
    { key: undefined, label: 'ሁሉንም (All)', emoji: '✨' },
    { key: 'PLUMBING', label: t('cat_plumbing'), emoji: '🔧' },
    { key: 'ELECTRICAL', label: t('cat_electrical'), emoji: '⚡' },
    { key: 'CARPENTRY', label: t('cat_carpentry'), emoji: '🪚' },
    { key: 'PAINTING', label: t('cat_painting'), emoji: '🎨' },
    { key: 'CLEANING', label: t('cat_cleaning'), emoji: '🧹' },
    { key: 'MECHANIC', label: t('cat_mechanic'), emoji: '🚗' },
    { key: 'CONSTRUCTION', label: t('cat_construction'), emoji: '🧱' },
    { key: 'MOVING', label: t('cat_moving'), emoji: '📦' },
    { key: 'GARDENING', label: t('cat_gardening'), emoji: '🌱' }
  ];

  const handleTranscriptionComplete = (result: TranscriptionResult) => {
    // Navigate to job creation with transcribed audio & detected category
    router.push({
      pathname: '/job/create',
      params: {
        audioUrl: result.audioUrl,
        transcript: result.transcript,
        category: result.category,
        detectedLanguage: result.detectedLanguage
      }
    });
  };

  const handleManualInput = () => {
    router.push('/job/create');
  };

  const handleSelectWorker = (worker: NearbyWorker) => {
    router.push(`/worker/${worker.id}`);
  };

  const handleRequestWorker = (worker: NearbyWorker) => {
    router.push({
      pathname: '/job/create',
      params: {
        workerId: worker.user_id,
        category: worker.skill_category
      }
    });
  };

  const onRefresh = async () => {
    await refreshLocation();
    await refetchWorkers();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.brandText}>ስራLink</Text>
            <View style={styles.locationRow}>
              <MapPin size={13} color="#0F766E" />
              <Text style={styles.locationText} numberOfLines={1}>
                {currentLocation.district || 'Addis Ababa'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => router.push('/(tabs)/messages')}
          >
            <Bell size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Voice-First Hero Card */}
        <View style={styles.voiceHeroCard}>
          <Text style={styles.heroGreeting}>
            {user?.full_name ? `ሰላም ${user.full_name}` : t('welcome')}
          </Text>
          <Text style={styles.heroTitle}>{t('what_do_you_need')}</Text>

          <VoiceRecorder
            onTranscriptionComplete={handleTranscriptionComplete}
            onManualInputRequested={handleManualInput}
          />
        </View>

        {/* Category Filter Chips */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('category')}</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((cat, idx) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key || idx}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(cat.key)}
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text
                  style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Nearby Workers Spatial Search Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.nearbyTitleRow}>
            <Text style={styles.sectionTitle}>{t('nearby_workers')}</Text>
            <Text style={styles.workerCountText}>
              {workers.length > 0 ? `(${workers.length} ተገኝተዋል)` : ''}
            </Text>
          </View>

          {/* Radius selector */}
          <View style={styles.radiusSelector}>
            {[5, 10, 20].map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRadiusKm(r)}
                style={[styles.radiusBtn, radiusKm === r && styles.radiusBtnActive]}
              >
                <Text style={[styles.radiusText, radiusKm === r && styles.radiusTextActive]}>
                  {r}km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {isWorkersLoading ? (
          <LoadingState message="ባለሙያዎችን በመፈለግ ላይ..." />
        ) : (
          <MapView
            userLocation={currentLocation}
            workers={workers}
            onSelectWorker={handleSelectWorker}
            onRequestWorker={handleRequestWorker}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  scrollContainer: {
    paddingBottom: 40
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  brandText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F766E',
    letterSpacing: 0.5
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B'
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  voiceHeroCard: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E6F4F1',
    alignItems: 'center'
  },
  heroGreeting: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F766E',
    marginBottom: 4
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A'
  },
  nearbyTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6
  },
  workerCountText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600'
  },
  radiusSelector: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    padding: 2
  },
  radiusBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  radiusBtnActive: {
    backgroundColor: '#0F766E'
  },
  radiusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569'
  },
  radiusTextActive: {
    color: '#FFFFFF'
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 6
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  categoryChipActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E'
  },
  categoryEmoji: {
    fontSize: 14
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155'
  },
  categoryChipTextActive: {
    color: '#FFFFFF'
  }
});
