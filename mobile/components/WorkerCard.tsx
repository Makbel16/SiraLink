import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Star, MapPin, Wrench, Zap, Hammer, Paintbrush, Sparkles, Car, Construction, Truck, Flower2, CircleDot } from 'lucide-react-native';
import { NearbyWorker, JobCategory } from '../types/index';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import { useTranslation } from '../utils/i18n';

interface WorkerCardProps {
  worker: NearbyWorker;
  onRequest: (worker: NearbyWorker) => void;
  onPressDetails?: (worker: NearbyWorker) => void;
}

export function WorkerCard({ worker, onRequest, onPressDetails }: WorkerCardProps) {
  const { t } = useTranslation();

  const getCategoryIcon = (cat: JobCategory) => {
    switch (cat) {
      case 'PLUMBING':
        return <Wrench size={14} color="#0F766E" />;
      case 'ELECTRICAL':
        return <Zap size={14} color="#D97706" />;
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
        return <CircleDot size={14} color="#64748B" />;
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
      style={styles.card}
    >
      <View style={styles.topRow}>
        <Avatar
          name={worker.full_name}
          imageUrl={worker.avatar_url}
          size={52}
          isVerified={true}
        />

        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText} numberOfLines={1}>
              {worker.full_name || t('worker')}
            </Text>
            <View style={styles.availabilityRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: worker.is_available ? '#22C55E' : '#94A3B8' }
                ]}
              />
              <Text style={styles.availabilityText}>
                {worker.is_available ? t('available') : t('unavailable')}
              </Text>
            </View>
          </View>

          <View style={styles.skillRow}>
            <View style={styles.categoryBadge}>
              {getCategoryIcon(worker.skill_category)}
              <Text style={styles.categoryText}>{getCategoryLabel(worker.skill_category)}</Text>
            </View>

            <View style={styles.distanceBadge}>
              <MapPin size={13} color="#64748B" />
              <Text style={styles.distanceText}>
                {worker.distance_km} {t('km')}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {worker.skill_description ? (
        <Text style={styles.descriptionText} numberOfLines={2}>
          {worker.skill_description}
        </Text>
      ) : null}

      <View style={styles.footerRow}>
        <View style={styles.ratingBox}>
          <Star size={16} color="#F59E0B" fill="#F59E0B" />
          <Text style={styles.ratingNumber}>
            {Number(worker.rating_avg).toFixed(1)}
          </Text>
          <Text style={styles.ratingCount}>({worker.rating_count})</Text>
        </View>

        <View style={styles.rateBox}>
          <Text style={styles.rateAmount}>
            {worker.hourly_rate_etb || 400} ETB
          </Text>
          <Text style={styles.rateUnit}>/{t('rate').toLowerCase()}</Text>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9'
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
    fontWeight: '700',
    color: '#0F172A',
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
    fontWeight: '600',
    color: '#64748B'
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
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155'
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  },
  descriptionText: {
    fontSize: 13,
    color: '#475569',
    marginTop: 10,
    lineHeight: 18
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  ratingNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A'
  },
  ratingCount: {
    fontSize: 12,
    color: '#94A3B8'
  },
  rateBox: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  rateAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F766E'
  },
  rateUnit: {
    fontSize: 11,
    color: '#64748B'
  },
  requestBtn: {
    paddingHorizontal: 14,
    minHeight: 38
  }
});
