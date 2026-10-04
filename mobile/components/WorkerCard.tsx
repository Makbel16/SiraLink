import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Star, MapPin, Wrench, Zap, Hammer, Paintbrush, Sparkles, Car, Construction, Truck, Flower2, CircleDot } from 'lucide-react-native';
import { NearbyWorker, JobCategory } from '../types/index';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import { useTranslation } from '../utils/i18n';
import { useTheme } from '../context/ThemeContext';

interface WorkerCardProps {
  worker: NearbyWorker;
  onRequest: (worker: NearbyWorker) => void;
  onPressDetails?: (worker: NearbyWorker) => void;
}

export function WorkerCard({ worker, onRequest, onPressDetails }: WorkerCardProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const getCategoryIcon = (cat: JobCategory) => {
    switch (cat) {
      case 'PLUMBING':
        return <Wrench size={14} color={colors.primary} />;
      case 'ELECTRICAL':
        return <Zap size={14} color={colors.accent} />;
      case 'CARPENTRY':
        return <Hammer size={14} color="#92400E" />;
      case 'PAINTING':
        return <Paintbrush size={14} color="#7C3AED" />;
      case 'CLEANING':
        return <Sparkles size={14} color="#2563EB" />;
      case 'MECHANIC':
        return <Car size={14} color="#DC2626" />;
      case 'CONSTRUCTION':
        return <Construction size={14} color="#EA580C" />;
      case 'MOVING':
        return <Truck size={14} color="#0891B2" />;
      case 'GARDENING':
        return <Flower2 size={14} color="#16A34A" />;
      default:
        return <CircleDot size={14} color={colors.textSecondary} />;
    }
  };

  const getCategoryLabel = (cat: JobCategory): string => {
    const key = `cat_${cat.toLowerCase()}`;
    return t(key, cat);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPressDetails && onPressDetails(worker)}
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceCard,
          borderColor: colors.border
        },
        colors.cardShadow
      ]}
    >
      <View style={styles.topRow}>
        <Avatar
          name={worker.full_name}
          imageUrl={worker.avatar_url}
          size={54}
          isVerified={true}
        />

        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.nameText, { color: colors.textPrimary }]} numberOfLines={1}>
              {worker.full_name || t('worker')}
            </Text>
            <View style={styles.availabilityRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: worker.is_available ? colors.success : colors.textMuted }
                ]}
              />
              <Text style={[styles.availabilityText, { color: worker.is_available ? colors.success : colors.textMuted }]}>
                {worker.is_available ? t('available') : t('unavailable')}
              </Text>
            </View>
          </View>

          <View style={styles.skillRow}>
            <View
              style={[
                styles.categoryBadge,
                {
                  backgroundColor: isDark ? colors.surfaceSubtle : '#F8FAFC',
                  borderColor: colors.border
                }
              ]}
            >
              {getCategoryIcon(worker.skill_category)}
              <Text style={[styles.categoryText, { color: colors.textPrimary }]}>
                {getCategoryLabel(worker.skill_category)}
              </Text>
            </View>

            <View style={styles.distanceBadge}>
              <MapPin size={13} color={colors.textSecondary} />
              <Text style={[styles.distanceText, { color: colors.textSecondary }]}>
                {worker.distance_km} {t('km')}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {worker.skill_description ? (
        <Text style={[styles.descriptionText, { color: colors.textSecondary }]} numberOfLines={2}>
          {worker.skill_description}
        </Text>
      ) : null}

      <View style={[styles.footerRow, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.ratingBox}>
          <Star size={15} color="#F59E0B" fill="#F59E0B" />
          <Text style={[styles.ratingNumber, { color: colors.textPrimary }]}>
            {Number(worker.rating_avg).toFixed(1)}
          </Text>
          <Text style={[styles.ratingCount, { color: colors.textMuted }]}>({worker.rating_count})</Text>
        </View>

        <View style={styles.rateBox}>
          <Text style={[styles.rateAmount, { color: colors.primary }]}>
            {worker.hourly_rate_etb || 400} ETB
          </Text>
          <Text style={[styles.rateUnit, { color: colors.textSecondary }]}>/{t('rate').toLowerCase()}</Text>
        </View>

        <Button
          title={t('request_worker')}
          onPress={() => onRequest(worker)}
          size="sm"
          style={styles.requestBtn}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1
  },
  topRow: {
    flexDirection: 'row',
    gap: 12
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  nameText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    flex: 1
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '700'
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700'
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600'
  },
  descriptionText: {
    fontSize: 13,
    marginTop: 10,
    lineHeight: 18
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  ratingNumber: {
    fontSize: 14,
    fontWeight: '800'
  },
  ratingCount: {
    fontSize: 12
  },
  rateBox: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  rateAmount: {
    fontSize: 15,
    fontWeight: '800'
  },
  rateUnit: {
    fontSize: 11
  },
  requestBtn: {
    paddingHorizontal: 14,
    minHeight: 38
  }
});
