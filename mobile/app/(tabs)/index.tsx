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
import {
  MapPin,
  Bell,
  Sparkles,
  Flame,
  Award
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useTranslation } from '../../utils/i18n';
import { useTheme } from '../../context/ThemeContext';
import { VoiceRecorder } from '../../components/VoiceRecorder';
import { MapView } from '../../components/MapView';
import { LoadingState } from '../../components/LoadingState';
import { CategoryCard3D, CategoryItemData } from '../../components/CategoryCard3D';
import { FeaturedWorkerCard3D } from '../../components/FeaturedWorkerCard3D';
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

  // Rich 3D Category Data with tailored gradients, tags, and price baselines
  const categoryCards: CategoryItemData[] = [
    {
      key: undefined,
      label: t('all_services'),
      enLabel: 'All Services',
      emoji: '✨',
      workerCount: 140,
      startingPrice: 300,
      tag: t('all_services_tag'),
      tagKey: 'all_services_tag',
      gradient: ['#F0FDFA', '#CCFBF1'],
      darkGradient: ['#162036', '#0F172A']
    },
    {
      key: 'PLUMBING',
      label: t('cat_plumbing'),
      enLabel: 'Plumbing',
      emoji: '🔧',
      workerCount: 48,
      startingPrice: 350,
      tag: t('popular_tag'),
      tagKey: 'popular_tag',
      gradient: ['#ECFEFF', '#CFFAFE'],
      darkGradient: ['#0E2A38', '#081B26']
    },
    {
      key: 'ELECTRICAL',
      label: t('cat_electrical'),
      enLabel: 'Electrical',
      emoji: '⚡',
      workerCount: 36,
      startingPrice: 400,
      tag: t('fast_call_tag'),
      tagKey: 'fast_call_tag',
      gradient: ['#FFFBEB', '#FEF3C7'],
      darkGradient: ['#2E2208', '#1A1303']
    },
    {
      key: 'CLEANING',
      label: t('cat_cleaning'),
      enLabel: 'House Cleaning',
      emoji: '🧹',
      workerCount: 52,
      startingPrice: 250,
      tag: t('trusted_tag'),
      tagKey: 'trusted_tag',
      gradient: ['#EFF6FF', '#DBEAFE'],
      darkGradient: ['#0F2445', '#081426']
    },
    {
      key: 'PAINTING',
      label: t('cat_painting'),
      enLabel: 'Painting',
      emoji: '🎨',
      workerCount: 29,
      startingPrice: 450,
      tag: t('quality_tag'),
      tagKey: 'quality_tag',
      gradient: ['#FAF5FF', '#F3E8FF'],
      darkGradient: ['#26153B', '#150A21']
    },
    {
      key: 'CARPENTRY',
      label: t('cat_carpentry'),
      enLabel: 'Carpentry',
      emoji: '🪚',
      workerCount: 31,
      startingPrice: 400,
      tag: t('quality_tag'),
      tagKey: 'quality_tag',
      gradient: ['#FFF7ED', '#FFEDD5'],
      darkGradient: ['#2D1A0C', '#1A0E06']
    },
    {
      key: 'MECHANIC',
      label: t('cat_mechanic'),
      enLabel: 'Auto Mechanic',
      emoji: '🚗',
      workerCount: 24,
      startingPrice: 500,
      tag: t('speed_tag'),
      tagKey: 'speed_tag',
      gradient: ['#FEF2F2', '#FEE2E2'],
      darkGradient: ['#301010', '#1C0808']
    },
    {
      key: 'CONSTRUCTION',
      label: t('cat_construction'),
      enLabel: 'Construction',
      emoji: '🧱',
      workerCount: 42,
      startingPrice: 450,
      tag: t('quality_tag'),
      tagKey: 'quality_tag',
      gradient: ['#FFF1F2', '#FFE4E6'],
      darkGradient: ['#2A1016', '#17080B']
    },
    {
      key: 'MOVING',
      label: t('cat_moving'),
      enLabel: 'Movers & Truck',
      emoji: '📦',
      workerCount: 19,
      startingPrice: 600,
      tag: t('trusted_tag'),
      tagKey: 'trusted_tag',
      gradient: ['#F0FDF4', '#DCFCE7'],
      darkGradient: ['#0C2918', '#06170D']
    },
    {
      key: 'GARDENING',
      label: t('cat_gardening'),
      enLabel: 'Gardening',
      emoji: '🌱',
      workerCount: 22,
      startingPrice: 300,
      tag: t('quality_tag'),
      tagKey: 'quality_tag',
      gradient: ['#F7FEE7', '#ECFCCB'],
      darkGradient: ['#1C2608', '#0E1404']
    }
  ];

  const handleTranscriptionComplete = (result: TranscriptionResult) => {
    router.push({
      pathname: '/job/create',
      params: {
        audioUrl: result.audioUrl,
        transcript: result.transcript,
        category: result.category
      }
    });
  };

  const handleManualInput = () => {
    router.push({
      pathname: '/job/create',
      params: {
        category: selectedCategory || 'PLUMBING'
      }
    });
  };

  const handleSelectWorker = (worker: NearbyWorker) => {
    router.push(`/worker/${worker.id}`);
  };

  const handleRequestWorker = (worker: NearbyWorker) => {
    router.push({
      pathname: '/job/create',
      params: {
        workerId: worker.id,
        category: worker.skill_category
      }
    });
  };

  const onRefresh = async () => {
    await Promise.all([refetchWorkers(), refreshLocation()]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
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
            <Text style={[styles.brandText, { color: colors.primary }]}>
              {t('app_name')}
            </Text>
            <View style={[styles.brandDot, { backgroundColor: colors.accent }]} />
          </View>
          <View style={styles.locationRow}>
            <MapPin size={13} color={colors.textSecondary} />
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>
              {currentLocation.district || t('addis_ababa')}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/messages')}
          style={[styles.bellButton, { backgroundColor: isDark ? colors.surfaceSubtle : '#F1F5F9' }]}
        >
          <Bell size={20} color={colors.textPrimary} />
          <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
      >
        {/* Ambient Glow Voice Centerpiece Hero Card */}
        <View
          style={[
            styles.voiceHeroContainer,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border
            },
            colors.cardShadow
          ]}
        >
          {/* Subtle Ambient Radial Backlight */}
          <LinearGradient
            colors={isDark ? ['rgba(20, 184, 166, 0.12)', 'transparent'] : ['rgba(20, 184, 166, 0.08)', 'transparent']}
            style={styles.ambientGlowEffect}
          />

          <View style={styles.heroTextRow}>
            <View
              style={[
                styles.greetingPill,
                { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : '#FEF3C7' }
              ]}
            >
              <Sparkles size={13} color={colors.accent} />
              <Text style={[styles.heroGreeting, { color: colors.accent }]}>
                {user?.full_name ? `${t('welcome')} ${user.full_name}` : t('welcome')}
              </Text>
            </View>
          </View>

          <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
            {t('what_do_you_need')}
          </Text>

          {/* Voice Recording Centerpiece */}
          <VoiceRecorder
            compact={true}
            onTranscriptionComplete={handleTranscriptionComplete}
            onManualInputRequested={handleManualInput}
          />

          {/* Quick Voice Prompt Suggestions */}
          <View style={styles.suggestionsContainer}>
            <Text style={[styles.suggestionsLabel, { color: colors.textMuted }]}>
              {t('quick_prompts')}:
            </Text>
            <View style={styles.suggestionsRow}>
              {[
                { label: `🔧 ${t('cat_plumbing')}`, cat: 'PLUMBING' as JobCategory },
                { label: `⚡ ${t('cat_electrical')}`, cat: 'ELECTRICAL' as JobCategory },
                { label: `🧹 ${t('cat_cleaning')}`, cat: 'CLEANING' as JobCategory }
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

        {/* SECTION 1: Category Cards */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('category')}
            </Text>
            <View
              style={[
                styles.popularBadge,
                { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.18)' : '#FEF3C7' }
              ]}
            >
              <Flame size={12} color="#F59E0B" />
              <Text style={styles.popularBadgeText}>{t('popular_tag')}</Text>
            </View>
          </View>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            {t('tap_and_speak')}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.largeCardsScroll}
          decelerationRate="fast"
          snapToInterval={166}
        >
          {categoryCards.map((cat, idx) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <CategoryCard3D
                key={cat.key || idx}
                item={cat}
                isSelected={isSelected}
                onPress={() => setSelectedCategory(cat.key)}
              />
            );
          })}
        </ScrollView>

        {/* SECTION 2: Featured Workers */}
        {workers.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  {t('top_rated_workers')}
                </Text>
                <View
                  style={[
                    styles.popularBadge,
                    { backgroundColor: isDark ? 'rgba(20, 184, 166, 0.18)' : '#CCFBF1' }
                  ]}
                >
                  <Award size={12} color={colors.primary} />
                  <Text style={[styles.popularBadgeText, { color: colors.primary }]}>{t('verified')}</Text>
                </View>
              </View>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                {t('top_rated_workers_sub')}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.largeCardsScroll}
              decelerationRate="fast"
              snapToInterval={262}
            >
              {workers.slice(0, 6).map((w) => (
                <FeaturedWorkerCard3D
                  key={w.id}
                  worker={w}
                  onRequest={handleRequestWorker}
                  onPressDetails={handleSelectWorker}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* SECTION 3: Nearby Spatial Radar & Interactive Map */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('nearby_workers')}
            </Text>
            <Text style={[styles.workerCountPill, { color: colors.primary }]}>
              {workers.length > 0 ? `(${workers.length} ${t('jobs_found')})` : ''}
            </Text>
          </View>

          {/* Radius selector */}
          <View
            style={[
              styles.radiusSelector,
              { backgroundColor: isDark ? colors.surfaceSubtle : '#F1F5F9' }
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
                    {r}{t('km')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {isWorkersLoading ? (
          <LoadingState message={t('loading')} />
        ) : (
          <View
            style={[
              styles.mapCardWrapper,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border
              },
              colors.cardShadow
            ]}
          >
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
  voiceHeroContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    position: 'relative',
    overflow: 'hidden'
  },
  ambientGlowEffect: {
    position: 'absolute',
    top: -30,
    left: '20%',
    width: 200,
    height: 200,
    borderRadius: 100
  },
  heroTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  greetingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10
  },
  heroGreeting: {
    fontSize: 11,
    fontWeight: '800'
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: 8
  },
  suggestionsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)'
  },
  suggestionsLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  suggestionPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '700'
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 8
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706'
  },
  sectionSub: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500'
  },
  largeCardsScroll: {
    paddingHorizontal: 18,
    gap: 12,
    paddingBottom: 8
  },
  workerCountPill: {
    fontSize: 12,
    fontWeight: '700'
  },
  radiusSelector: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    marginTop: 8,
    alignSelf: 'flex-start'
  },
  radiusBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
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
  mapCardWrapper: {
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    marginTop: 4
  }
});
