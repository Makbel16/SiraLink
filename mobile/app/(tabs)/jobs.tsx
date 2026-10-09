import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ScrollView,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  ListFilter,
  Plus,
  Zap,
  Award,
  ChevronRight,
  TrendingUp,
  FolderOpen,
  ArrowUpRight,
  Layers
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../services/api';
import { useTranslation } from '../../utils/i18n';
import { useTheme } from '../../context/ThemeContext';
import { JobCard } from '../../components/JobCard';
import { LoadingState } from '../../components/LoadingState';
import { JobRequest } from '../../types/index';

type FilterType = 'ALL' | 'ACTIVE' | 'COMPLETED';

interface StatusCardData {
  id: FilterType;
  label: string;
  subLabel: string;
  emoji: string;
  countKey: 'all' | 'active' | 'completed';
  tag: string;
  footerLabel: string;
}

interface StatusCard3DProps {
  item: StatusCardData;
  count: number;
  isSelected: boolean;
  onPress: () => void;
}

/**
 * Modern Clean Status Filter Card
 * Clean borders, subtle shadows, and cohesive brand palette.
 */
function StatusCard3D({ item, count, isSelected, onPress }: StatusCard3DProps) {
  const { colors, isDark } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.statusCardContainer,
        {
          backgroundColor: isSelected
            ? (isDark ? 'rgba(59, 130, 246, 0.16)' : '#EFF6FF')
            : colors.surfaceCard,
          borderColor: isSelected ? colors.primary : colors.border
        },
        colors.cardShadow
      ]}
    >
      {/* Top Tag & Active Check */}
      <View style={styles.cardTopRow}>
        <View
          style={[
            styles.cardTagPill,
            {
              backgroundColor: isSelected
                ? colors.primary
                : (isDark ? colors.surfaceSubtle : '#F1F5F9')
            }
          ]}
        >
          <Text
            style={[
              styles.cardTagText,
              { color: isSelected ? '#FFFFFF' : colors.textSecondary }
            ]}
          >
            {item.tag}
          </Text>
        </View>
      </View>

      {/* Flat Icon Badge */}
      <View style={styles.iconCenterWrapper}>
        <View
          style={[
            styles.emojiBubble,
            {
              backgroundColor: isSelected
                ? (isDark ? 'rgba(59, 130, 246, 0.25)' : '#DBEAFE')
                : colors.surfaceSubtle
            }
          ]}
        >
          <Text style={styles.cardEmoji}>{item.emoji}</Text>
        </View>
      </View>

      {/* Localized Title & Subtitle */}
      <View style={styles.cardTitles}>
        <Text
          style={[
            styles.mainCardTitle,
            { color: isSelected ? colors.primary : colors.textPrimary }
          ]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
        <Text
          style={[styles.subCardTitle, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {item.subLabel}
        </Text>
      </View>

      {/* Card Footer with Details & Bold Count */}
      <View
        style={[
          styles.cardFooter,
          {
            borderTopColor: colors.borderSubtle
          }
        ]}
      >
        <View style={styles.footerLabelGroup}>
          {item.id === 'ALL' ? (
            <Briefcase size={12} color={isSelected ? colors.primary : colors.textSecondary} />
          ) : item.id === 'ACTIVE' ? (
            <Clock size={12} color={isSelected ? colors.primary : colors.textSecondary} />
          ) : (
            <CheckCircle2 size={12} color={isSelected ? colors.primary : colors.textSecondary} />
          )}
          <Text
            style={[styles.footerText, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {item.footerLabel}
          </Text>
        </View>

        <View
          style={[
            styles.countBadge,
            {
              backgroundColor: isSelected
                ? colors.primary
                : colors.surfaceSubtle
            }
          ]}
        >
          <Text
            style={[
              styles.countNumber,
              { color: isSelected ? '#FFFFFF' : colors.textPrimary }
            ]}
          >
            {count}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function JobsTabScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [filter, setFilter] = useState<FilterType>('ALL');

  const {
    data: jobs = [],
    isLoading,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: () => api.getJobs()
  });

  const activeCount = jobs.filter(
    (j) => j.status === 'OPEN' || j.status === 'ASSIGNED' || j.status === 'IN_PROGRESS'
  ).length;

  const completedCount = jobs.filter((j) => j.status === 'COMPLETED').length;

  const filteredJobs = jobs.filter((job) => {
    if (filter === 'ACTIVE') {
      return job.status === 'OPEN' || job.status === 'ASSIGNED' || job.status === 'IN_PROGRESS';
    }
    if (filter === 'COMPLETED') {
      return job.status === 'COMPLETED';
    }
    return true;
  });

  // Status Cards tailored dynamically by language
  const statusCardsData: StatusCardData[] = [
    {
      id: 'ALL',
      label: t('all_filter'),
      subLabel: t('all_requests'),
      emoji: '📋',
      countKey: 'all',
      tag: `⭐ ${t('tag_all')}`,
      footerLabel: t('total_jobs')
    },
    {
      id: 'ACTIVE',
      label: t('pending_filter'),
      subLabel: t('pending_and_active'),
      emoji: '⚡',
      countKey: 'active',
      tag: `🔥 ${t('tag_pending')}`,
      footerLabel: t('tag_pending')
    },
    {
      id: 'COMPLETED',
      label: t('completed_filter'),
      subLabel: t('completed_and_done'),
      emoji: '🏆',
      countKey: 'completed',
      tag: `🎉 ${t('tag_completed')}`,
      footerLabel: t('completed_filter')
    }
  ];

  const getCountForCard = (id: FilterType) => {
    if (id === 'ALL') return jobs.length;
    if (id === 'ACTIVE') return activeCount;
    return completedCount;
  };

  const handleJobPress = (job: JobRequest) => {
    router.push(`/job/${job.id}`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Luxury Elevated Header */}
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: colors.surfaceCard,
            borderBottomColor: colors.border
          },
          colors.cardShadow
        ]}
      >
        {/* Top Brand / Title Row */}
        <View style={styles.headerTopRow}>
          <View style={styles.headerLeftCol}>
            {/* 3D App Icon Badge */}
            <View style={styles.headerBrandBadgeRow}>
              <View
                style={[styles.headerIconBubble, { backgroundColor: colors.primary }]}
              >
                <Briefcase size={20} color="#FFFFFF" />
              </View>

              <View>
                <View style={styles.titleWithBadge}>
                  <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    {t('my_jobs')}
                  </Text>
                  {/* Live Status Indicator Pill */}
                  <View
                    style={[
                      styles.liveIndicatorPill,
                      {
                        backgroundColor: colors.primaryLight
                      }
                    ]}
                  >
                    <View
                      style={[styles.pulsingDot, { backgroundColor: colors.primary }]}
                    />
                    <Text style={[styles.liveIndicatorText, { color: colors.primary }]}>
                      {jobs.length} {t('jobs')}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                  {t('my_jobs_subtitle')}
                </Text>
              </View>
            </View>
          </View>

          {/* "+ New Job" Action Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/job/create')}
            style={styles.newJobBtnWrap}
          >
            <View
              style={[styles.newJobGradient, { backgroundColor: colors.primary }]}
            >
              <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.newJobText}>{t('post_job')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Header Quick Metrics Bar */}
        <View
          style={[
            styles.headerMetricsBar,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.04)'
                : 'rgba(0, 0, 0, 0.02)',
              borderColor: colors.borderSubtle
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => setFilter('ALL')}
            style={[
              styles.metricItem,
              filter === 'ALL' && [
                styles.metricItemActive,
                { backgroundColor: colors.primaryLight }
              ]
            ]}
          >
            <Text style={styles.metricEmoji}>📋</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {t('all_filter')}:
            </Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
              {jobs.length}
            </Text>
          </TouchableOpacity>

          <View style={[styles.metricDivider, { backgroundColor: colors.borderSubtle }]} />

          <TouchableOpacity
            onPress={() => setFilter('ACTIVE')}
            style={[
              styles.metricItem,
              filter === 'ACTIVE' && [
                styles.metricItemActive,
                { backgroundColor: isDark ? 'rgba(217, 119, 6, 0.15)' : '#FFFBEB' }
              ]
            ]}
          >
            <Text style={styles.metricEmoji}>⚡</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {t('pending_filter')}:
            </Text>
            <Text
              style={[
                styles.metricValue,
                { color: activeCount > 0 ? '#D97706' : colors.textPrimary }
              ]}
            >
              {activeCount}
            </Text>
          </TouchableOpacity>

          <View style={[styles.metricDivider, { backgroundColor: colors.borderSubtle }]} />

          <TouchableOpacity
            onPress={() => setFilter('COMPLETED')}
            style={[
              styles.metricItem,
              filter === 'COMPLETED' && [
                styles.metricItemActive,
                { backgroundColor: isDark ? 'rgba(5, 150, 105, 0.15)' : '#F0FDF4' }
              ]
            ]}
          >
            <Text style={styles.metricEmoji}>🏆</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {t('completed_filter')}:
            </Text>
            <Text
              style={[
                styles.metricValue,
                { color: completedCount > 0 ? '#059669' : colors.textPrimary }
              ]}
            >
              {completedCount}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <JobCard job={item} onPress={handleJobPress} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListHeaderComponent={
          <View style={styles.listHeaderSection}>
            {/* Status Section Title */}
            <View style={styles.statusSectionHeader}>
              <View style={styles.statusTitleRow}>
                <View style={styles.sectionHeadingGroup}>
                  <Layers size={18} color={colors.primary} />
                  <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
                    {t('jobs_status_filter')}
                  </Text>
                </View>

                <View
                  style={[
                    styles.filterBadge,
                    { backgroundColor: isDark ? colors.surfaceSubtle : '#F1F5F9' }
                  ]}
                >
                  <ListFilter size={12} color={colors.textSecondary} />
                  <Text style={[styles.filterBadgeText, { color: colors.textSecondary }]}>
                    {t('status_cards_count')}
                  </Text>
                </View>
              </View>
              <Text style={[styles.sectionSubHeading, { color: colors.textSecondary }]}>
                {t('tap_card_to_filter')}
              </Text>
            </View>

            {/* Horizontal 3D Status Cards Carousel */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statusCardsScroll}
              decelerationRate="fast"
              snapToInterval={166}
            >
              {statusCardsData.map((item) => (
                <StatusCard3D
                  key={item.id}
                  item={item}
                  count={getCountForCard(item.id)}
                  isSelected={filter === item.id}
                  onPress={() => setFilter(item.id)}
                />
              ))}
            </ScrollView>

            {/* Current Active Filter Banner */}
            <View
              style={[
                styles.activeFilterRow,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.03)'
                    : 'rgba(0, 0, 0, 0.02)',
                  borderColor: colors.borderSubtle
                }
              ]}
            >
              <View style={styles.activeFilterLeft}>
                <View
                  style={[
                    styles.activeDot,
                    {
                      backgroundColor:
                        filter === 'ALL'
                          ? colors.primary
                          : filter === 'ACTIVE'
                          ? '#D97706'
                          : '#059669'
                    }
                  ]}
                />
                <Text style={[styles.activeFilterTitle, { color: colors.textPrimary }]}>
                  {filter === 'ALL'
                    ? t('all_registered_jobs')
                    : filter === 'ACTIVE'
                    ? t('active_jobs_title')
                    : t('completed_jobs_title')}
                </Text>
              </View>

              <View
                style={[
                  styles.countPill,
                  {
                    backgroundColor: colors.primaryLight
                  }
                ]}
              >
                <Text style={[styles.activeFilterCount, { color: colors.primary }]}>
                  {filteredJobs.length} {t('jobs_found')}
                </Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <LoadingState message={t('loading')} />
          ) : (
            <View
              style={[
                styles.emptyCardContainer,
                {
                  backgroundColor: colors.surfaceCard,
                  borderColor: colors.border
                },
                colors.cardShadow
              ]}
            >
              <View
                style={[
                  styles.emptyIconCircle,
                  { backgroundColor: isDark ? colors.surfaceSubtle : '#F1F5F9' }
                ]}
              >
                <FolderOpen size={38} color={colors.textMuted} />
              </View>

              <Text style={[styles.emptyCardTitle, { color: colors.textPrimary }]}>
                {filter === 'ACTIVE'
                  ? t('no_jobs_active')
                  : filter === 'COMPLETED'
                  ? t('no_jobs_completed')
                  : t('no_jobs_all')}
              </Text>

              <Text style={[styles.emptyCardSub, { color: colors.textSecondary }]}>
                {filter === 'ACTIVE'
                  ? t('no_jobs_active_sub')
                  : filter === 'COMPLETED'
                  ? t('no_jobs_completed_sub')
                  : t('no_jobs_all_sub')}
              </Text>

              <TouchableOpacity
                style={[styles.emptyActionBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
                onPress={() => router.push('/job/create')}
              >
                <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.emptyActionBtnText}>{t('post_job')}</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  // Luxury Elevated Header
  headerCard: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    borderBottomWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerLeftCol: {
    flex: 1
  },
  headerBrandBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  headerIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.4
  },
  liveIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  liveIndicatorText: {
    fontSize: 11,
    fontWeight: '800'
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500'
  },
  newJobBtnWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3
  },
  newJobGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  newJobText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  // Header Quick Metrics Bar
  headerMetricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderRadius: 10
  },
  metricItemActive: {
    borderRadius: 10
  },
  metricEmoji: {
    fontSize: 13
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600'
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '900'
  },
  metricDivider: {
    width: 1,
    height: 18
  },
  // FlatList content
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40
  },
  listHeaderSection: {
    paddingTop: 16,
    marginBottom: 8
  },
  statusSectionHeader: {
    marginBottom: 12
  },
  statusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sectionHeadingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  sectionSubHeading: {
    fontSize: 12,
    marginTop: 3,
    fontWeight: '500'
  },
  // Status Cards Scroll
  statusCardsScroll: {
    gap: 12,
    paddingVertical: 8,
    paddingRight: 10
  },
  statusCardContainer: {
    width: 148,
    height: 180,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 12,
    justifyContent: 'space-between'
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 22
  },
  cardTagPill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6
  },
  cardTagText: {
    fontSize: 10,
    fontWeight: '700'
  },
  iconCenterWrapper: {
    alignItems: 'center',
    marginVertical: 4
  },
  emojiBubble: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardEmoji: {
    fontSize: 26
  },
  cardTitles: {
    alignItems: 'center',
    marginVertical: 2
  },
  mainCardTitle: {
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.2
  },
  subCardTitle: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1
  },
  footerLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1
  },
  footerText: {
    fontSize: 10,
    fontWeight: '700'
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10
  },
  countNumber: {
    fontSize: 13,
    fontWeight: '900'
  },
  // Active Filter Row
  activeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1
  },
  activeFilterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5
  },
  activeFilterTitle: {
    fontSize: 13,
    fontWeight: '800'
  },
  countPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8
  },
  activeFilterCount: {
    fontSize: 11,
    fontWeight: '800'
  },
  // Empty State
  emptyCardContainer: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 20
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14
  },
  emptyCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6
  },
  emptyCardSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
    paddingHorizontal: 10
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13
  }
});
