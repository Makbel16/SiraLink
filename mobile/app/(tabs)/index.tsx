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
import { MapPin, Bell, SlidersHorizontal, Sparkles, Navigation, Search, PenLine } from 'lucide-react-native';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useTranslation } from '../../utils/i18n';
import { useTheme } from '../../context/ThemeContext';
import { VoiceRecorder } from '../../components/VoiceRecorder';
import { MapView } from '../../components/MapView';
import { LoadingState } from '../../components/LoadingState';
import { JobCategory, NearbyWorker, TranscriptionResult } from '../../types/index';

export default function ClientHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentLocation, refreshLocation } = useLocation();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Bar */}
        <View
          style={[
            styles.headerBar,
            {
              backgroundColor: colors.surfaceCard,
              borderBottomColor: colors.border
            }
          ]}
        >
          <View>
            <View style={styles.brandRow}>
              <Text style={[styles.brandText, { color: colors.primary }]}>ስራLink</Text>
              <View style={[styles.brandDot, { backgroundColor: colors.accent }]} />
            </View>
            <TouchableOpacity
              style={styles.locationRow}
              activeOpacity={0.7}
              onPress={refreshLocation}
            >
              <MapPin size={13} color={colors.primary} />
              <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
                {currentLocation.district || 'Addis Ababa'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.bellButton,
              {
                backgroundColor: isDark ? colors.surfaceSubtle : '#F1F5F9'
              }
            ]}
            onPress={() => router.push('/(tabs)/messages')}
          >
            <Bell size={20} color={colors.textPrimary} />
            <View style={[styles.unreadDot, { backgroundColor: colors.danger }]} />
          </TouchableOpacity>
        </View>

        {/* Voice-First Hero Card */}
        <View
          style={[
            styles.voiceHeroCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border
            },
            colors.cardShadow
          ]}
        >
          {/* Subtle Ambient Glow */}
          <View
            style={[
              styles.heroAmbientGlow,
              {
                backgroundColor: isDark ? colors.primaryGlow : 'rgba(13, 148, 136, 0.05)'
              }
            ]}
          />

          <View style={styles.heroTextRow}>
            <View style={styles.greetingPill}>
              <Sparkles size={12} color={colors.accent} />
              <Text style={[styles.heroGreeting, { color: colors.accent }]}>
                {user?.full_name ? `ሰላም ${user.full_name}` : t('welcome')}
              </Text>
            </View>
          </View>

          <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
            {t('what_do_you_need')}
          </Text>

          {/* Voice Recording Centerpiece */}
          <VoiceRecorder
            onTranscriptionComplete={handleTranscriptionComplete}
            onManualInputRequested={handleManualInput}
          />

          {/* Quick Voice Prompt Suggestions */}
          <View style={styles.suggestionsContainer}>
            <Text style={[styles.suggestionsLabel, { color: colors.textMuted }]}>
              ለምሳሌ (Quick Examples):
            </Text>
            <View style={styles.suggestionsRow}>
              {[
                { label: '🔧 የቧንቧ ጥገና', cat: 'PLUMBING' as JobCategory },
                { label: '⚡ የኤሌክትሪክ ሰራተኛ', cat: 'ELECTRICAL' as JobCategory },
                { label: '🧹 የቤት ጽዳት', cat: 'CLEANING' as JobCategory }
              ].map((sug, i) => (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.75}
                  onPress={() => setSelectedCategory(sug.cat)}
                  style={[
                    styles.suggestionPill,
                    {
                      backgroundColor: isDark ? colors.surfaceSubtle : '#F8FAFC',
                      borderColor: colors.borderSubtle
                    }
                  ]}
                >
                  <Text style={[styles.suggestionText, { color: colors.textSecondary }]}>
                    {sug.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Category Filter Chips */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t('category')} (የስራ ዘርፎች)
          </Text>
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
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : colors.surfaceCard,
                    borderColor: isSelected ? colors.primary : colors.border
                  },
                  colors.cardShadow
                ]}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.categoryChipText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textPrimary,
                      fontWeight: isSelected ? '800' : '600'
                    }
                  ]}
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
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('nearby_workers')}
            </Text>
            <Text style={[styles.workerCountText, { color: colors.primary }]}>
              {workers.length > 0 ? `(${workers.length} ተገኝተዋል)` : ''}
            </Text>
          </View>

          {/* Radius selector */}
          <View
            style={[
              styles.radiusSelector,
              {
                backgroundColor: isDark ? colors.surfaceSubtle : '#F1F5F9'
              }
            ]}
          >
            {[5, 10, 20].map((r) => {
              const isActive = radiusKm === r;
              return (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRadiusKm(r)}
                  style={[
                    styles.radiusBtn,
                    isActive && [
                      styles.radiusBtnActive,
                      { backgroundColor: colors.surface, shadowColor: colors.textPrimary }
                    ]
                  ]}
                >
                  <Text
                    style={[
                      styles.radiusText,
                      {
                        color: isActive ? colors.primary : colors.textMuted,
                        fontWeight: isActive ? '800' : '600'
                      }
                    ]}
                  >
                    {r}km
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {isWorkersLoading ? (
          <LoadingState message="ባለሙያዎችን በመፈለግ ላይ..." />
        ) : (
          <View style={styles.mapCardWrapper}>
            <MapView
              userLocation={currentLocation}
              workers={workers}
              onSelectWorker={handleSelectWorker}
              onRequestWorker={handleRequestWorker}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
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
    paddingBottom: 12,
    borderBottomWidth: 1
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  brandText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.3
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600'
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  unreadDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4
  },
  voiceHeroCard: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden'
  },
  heroAmbientGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 130,
    height: 130,
    borderRadius: 65
  },
  heroTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  greetingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  heroGreeting: {
    fontSize: 13,
    fontWeight: '800'
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 16,
    letterSpacing: -0.3
  },
  suggestionsContainer: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)'
  },
  suggestionsLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  suggestionPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '600'
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2
  },
  nearbyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  workerCountText: {
    fontSize: 13,
    fontWeight: '800'
  },
  radiusSelector: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3
  },
  radiusBtn: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8
  },
  radiusBtnActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  radiusText: {
    fontSize: 12
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 10
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1
  },
  categoryEmoji: {
    fontSize: 17
  },
  categoryChipText: {
    fontSize: 13
  },
  mapCardWrapper: {
    marginTop: 4
  }
});
