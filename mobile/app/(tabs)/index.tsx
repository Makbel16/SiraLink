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
  SlidersHorizontal,
  Flame,
  Award,
  Zap,
  ArrowRight,
  TrendingUp
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

  // Rich 3D Category Data with tailored gradients, tags, and realistic price baselines
  const categoryCards: CategoryItemData[] = [
    {
      key: undefined,
      label: 'ሁሉንም ስራዎች',
      enLabel: 'All Services',
      emoji: '✨',
      workerCount: 140,
      startingPrice: 'ከ 300 ETB',
      tag: '⭐ ሙሉ ዝርዝር',
      gradient: ['#F0FDFA', '#CCFBF1'],
      darkGradient: ['#162036', '#0F172A']
    },
    {
      key: 'PLUMBING',
      label: 'የቧንቧ ጥገና',
      enLabel: 'Plumbing',
      emoji: '🔧',
      workerCount: 48,
      startingPrice: 'ከ 350 ETB',
      tag: '🔥 ተፈላጊ',
      gradient: ['#ECFEFF', '#CFFAFE'],
      darkGradient: ['#0E2A38', '#081B26']
    },
    {
      key: 'ELECTRICAL',
      label: 'የኤሌክትሪክ ስራ',
      enLabel: 'Electrical',
      emoji: '⚡',
      workerCount: 36,
      startingPrice: 'ከ 400 ETB',
      tag: '⚡ ፈጣን ጥሪ',
      gradient: ['#FFFBEB', '#FEF3C7'],
      darkGradient: ['#2E2208', '#1A1303']
    },
    {
      key: 'CLEANING',
      label: 'የቤት ጽዳት',
      enLabel: 'House Cleaning',
      emoji: '🧹',
      workerCount: 52,
      startingPrice: 'ከ 250 ETB',
      tag: '💎 የታመነ',
      gradient: ['#EFF6FF', '#DBEAFE'],
      darkGradient: ['#0F2445', '#081426']
    },
    {
      key: 'PAINTING',
      label: 'የቀለም ቅብ',
      enLabel: 'Painting',
      emoji: '🎨',
      workerCount: 29,
      startingPrice: 'ከ 450 ETB',
      tag: '🎨 ባለሙያ',
      gradient: ['#FAF5FF', '#F3E8FF'],
      darkGradient: ['#26153B', '#150A21']
    },
    {
      key: 'CARPENTRY',
      label: 'የእንጨት ስራ',
      enLabel: 'Carpentry',
      emoji: '🪚',
      workerCount: 31,
      startingPrice: 'ከ 400 ETB',
      tag: '🪵 ጥራት',
      gradient: ['#FFF7ED', '#FFEDD5'],
      darkGradient: ['#2D1A0C', '#1A0E06']
    },
    {
      key: 'MECHANIC',
      label: 'የመኪና ጥገና',
      enLabel: 'Auto Mechanic',
      emoji: '🚗',
      workerCount: 24,
      startingPrice: 'ከ 500 ETB',
      tag: '🚗 ፈጣን',
      gradient: ['#FEF2F2', '#FEE2E2'],
      darkGradient: ['#301010', '#1C0808']
    },
    {
      key: 'CONSTRUCTION',
      label: 'የግንባታ ስራ',
      enLabel: 'Construction',
      emoji: '🧱',
      workerCount: 42,
      startingPrice: 'ከ 450 ETB',
      tag: '🧱 ጠንካራ',
      gradient: ['#FFF1F2', '#FFE4E6'],
      darkGradient: ['#2A1016', '#17080B']
    },
    {
      key: 'MOVING',
      label: 'የእቃ ማጓጓዝ',
      enLabel: 'Movers & Truck',
      emoji: '📦',
      workerCount: 19,
      startingPrice: 'ከ 600 ETB',
      tag: '📦 አስተማማኝ',
      gradient: ['#F0FDF4', '#DCFCE7'],
      darkGradient: ['#0C2918', '#06170D']
    },
    {
      key: 'GARDENING',
      label: 'የአትክልት ስራ',
      enLabel: 'Gardening',
      emoji: '🌱',
      workerCount: 22,
      startingPrice: 'ከ 300 ETB',
      tag: '🌿 ተፈጥሮ',
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
              { backgroundColor: isDark ? colors.surfaceSubtle : '#F1F5F9' }
            ]}
            onPress={() => router.push('/(tabs)/messages')}
          >
            <Bell size={20} color={colors.textPrimary} />
            <View style={[styles.unreadDot, { backgroundColor: colors.danger }]} />
          </TouchableOpacity>
        </View>

        {/* 3D Voice-First Hero Card */}
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
          {/* Subtle Ambient Radial Glow */}
          <LinearGradient
            colors={
              isDark
                ? ['rgba(20, 184, 166, 0.25)', 'transparent']
                : ['rgba(13, 148, 136, 0.12)', 'transparent']
            }
            start={{ x: 0.8, y: 0 }}
            end={{ x: 0, y: 0.8 }}
            style={styles.heroAmbientGlow}
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
              ፈጣን የስራ ጥያቄዎች (Tap to quick select):
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

        {/* SECTION 1: Large 3D Horizontally Scrollable Category Cards */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              የስራ ዘርፎች (Service Categories)
            </Text>
            <View
              style={[
                styles.popularBadge,
                { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.18)' : '#FEF3C7' }
              ]}
            >
              <Flame size={12} color="#F59E0B" />
              <Text style={styles.popularBadgeText}>ተወዳጅ</Text>
            </View>
          </View>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            የሚፈልጉትን ሙያ ይምረጡ
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

        {/* SECTION 2: Large 3D Horizontally Scrollable Featured Workers */}
        {workers.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  ተወዳጅ ባለሙያዎች (Top Rated Workers)
                </Text>
                <View
                  style={[
                    styles.popularBadge,
                    { backgroundColor: isDark ? 'rgba(20, 184, 166, 0.18)' : '#CCFBF1' }
                  ]}
                >
                  <Award size={12} color={colors.primary} />
                  <Text style={[styles.popularBadgeText, { color: colors.primary }]}>ደረጃ 1</Text>
                </View>
              </View>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                በአቅራቢያዎ ያሉ ከፍተኛ ግምገማ ያገኙ ባለሙያዎች
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
              {t('nearby_workers')} (ካርታ እና ራዳር)
            </Text>
            <Text style={[styles.workerCountPill, { color: colors.primary }]}>
              {workers.length > 0 ? `(${workers.length} ተገኝተዋል)` : ''}
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
  voiceHeroCard: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderRadius: 26,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden'
  },
  heroAmbientGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80
  },
  heroTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  greetingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  heroGreeting: {
    fontSize: 12,
    fontWeight: '800'
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 16,
    letterSpacing: -0.4
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
    paddingHorizontal: 20,
    marginTop: 26,
    marginBottom: 14
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706'
  },
  sectionSub: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500'
  },
  workerCountPill: {
    fontSize: 13,
    fontWeight: '800'
  },
  radiusSelector: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    marginTop: 8,
    alignSelf: 'flex-start'
  },
  radiusBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  radiusBtnActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2
  },
  radiusText: {
    fontSize: 12
  },
  largeCardsScroll: {
    paddingHorizontal: 16,
    gap: 12,
    paddingVertical: 6
  },
  mapCardWrapper: {
    marginHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 4
  }
});
