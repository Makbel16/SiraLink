import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Star, MapPin, ShieldCheck, Zap, ArrowRight } from 'lucide-react-native';
import { NearbyWorker } from '../types/index';
import { Avatar } from './Avatar';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../utils/i18n';

interface FeaturedWorkerCardProps {
  worker: NearbyWorker;
  onRequest: (worker: NearbyWorker) => void;
  onPressDetails: (worker: NearbyWorker) => void;
}

export function FeaturedWorkerCard({
  worker,
  onRequest,
  onPressDetails
}: FeaturedWorkerCardProps) {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const categoryLabel = worker.skill_category
    ? t(`cat_${worker.skill_category.toLowerCase()}`, worker.skill_category)
    : t('worker');

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPressDetails(worker)}
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceCard,
          borderColor: colors.border
        },
        colors.cardShadow
      ]}
    >
      {/* Top Row: Avatar + Status + Rating */}
      <View style={styles.topRow}>
        <View style={styles.avatarWrap}>
          <Avatar
            name={worker.full_name}
            imageUrl={worker.avatar_url}
            size={52}
            isVerified={true}
          />
          <View
            style={[
              styles.onlineBadge,
              {
                backgroundColor: worker.is_available ? colors.success : colors.textMuted,
                borderColor: colors.surfaceCard
              }
            ]}
          />
        </View>

        <View style={styles.topRightInfo}>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.verifiedTag,
                {
                  backgroundColor: colors.primaryLight
                }
              ]}
            >
              <ShieldCheck size={12} color={colors.primary} />
              <Text style={[styles.verifiedTagText, { color: colors.primary }]}>
                {t('verified')}
              </Text>
            </View>

            <View style={[styles.ratingPill, { backgroundColor: isDark ? colors.surfaceSubtle : '#FEF3C7' }]}>
              <Star size={12} color="#F59E0B" fill="#F59E0B" />
              <Text style={[styles.ratingText, { color: isDark ? colors.textPrimary : '#92400E' }]}>
                {Number(worker.rating_avg).toFixed(1)}
              </Text>
            </View>
          </View>

          <Text
            style={[styles.workerName, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {worker.full_name || t('worker')}
          </Text>
          <Text
            style={[styles.categorySubtitle, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {categoryLabel}
          </Text>
        </View>
      </View>

      {/* Middle Distance & Rate Row */}
      <View style={[styles.middleRow, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.distanceBox}>
          <MapPin size={13} color={colors.textSecondary} />
          <Text style={[styles.distanceText, { color: colors.textSecondary }]}>
            {worker.distance_km || 1.2} {t('km')} {t('away')}
          </Text>
        </View>

        <View style={styles.rateBox}>
          <Text style={[styles.rateValue, { color: colors.primary }]}>
            {worker.hourly_rate_etb || 450} {t('etb')}
          </Text>
          <Text style={[styles.rateUnit, { color: colors.textMuted }]}>/{t('per_hour')}</Text>
        </View>
      </View>

      {/* Quick Action Button */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          { backgroundColor: colors.primary }
        ]}
        activeOpacity={0.8}
        onPress={() => onRequest(worker)}
      >
        <Zap size={14} color="#FFFFFF" />
        <Text style={styles.actionButtonText}>{t('request_now')}</Text>
        <ArrowRight size={13} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// Backward-compatible alias
export const FeaturedWorkerCard3D = FeaturedWorkerCard;

const styles = StyleSheet.create({
  container: {
    width: 260,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start'
  },
  avatarWrap: {
    position: 'relative'
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2
  },
  topRightInfo: {
    flex: 1
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: '700'
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700'
  },
  workerName: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2
  },
  categorySubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1
  },
  distanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '600'
  },
  rateBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2
  },
  rateValue: {
    fontSize: 14,
    fontWeight: '800'
  },
  rateUnit: {
    fontSize: 10,
    fontWeight: '500'
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  }
});
