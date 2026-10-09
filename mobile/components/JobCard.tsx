import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, User, Wrench, ChevronRight, DollarSign } from 'lucide-react-native';
import { JobRequest, JobStatus } from '../types/index';
import { Badge } from './Badge';
import { useTranslation } from '../utils/i18n';
import { useTheme } from '../context/ThemeContext';

interface JobCardProps {
  job: JobRequest;
  onPress: (job: JobRequest) => void;
  isWorkerPerspective?: boolean;
}

export function JobCard({ job, onPress, isWorkerPerspective = false }: JobCardProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'OPEN':
        return <Badge label={t('status_open')} variant="info" />;
      case 'ASSIGNED':
        return <Badge label={t('status_assigned')} variant="warning" />;
      case 'IN_PROGRESS':
        return <Badge label={t('status_in_progress')} variant="warning" />;
      case 'COMPLETED':
        return <Badge label={t('status_completed')} variant="success" />;
      case 'CANCELLED':
        return <Badge label={t('status_cancelled')} variant="danger" />;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const counterpartyName = isWorkerPerspective
    ? job.client_name || t('client')
    : job.worker_name || t('status_open');

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(job)}
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
        <View
          style={[
            styles.categoryPill,
            {
              backgroundColor: isDark ? colors.surfaceSubtle : '#EFF6FF',
              borderColor: isDark ? colors.border : '#DBEAFE'
            }
          ]}
        >
          <Wrench size={13} color={colors.primary} />
          <Text style={[styles.categoryText, { color: colors.primary }]}>{job.category}</Text>
        </View>
        {getStatusBadge(job.status)}
      </View>

      <Text style={[styles.titleText, { color: colors.textPrimary }]} numberOfLines={1}>
        {job.title || `${job.category} Service`}
      </Text>

      {job.text_description ? (
        <Text style={[styles.descriptionText, { color: colors.textSecondary }]} numberOfLines={2}>
          {job.text_description}
        </Text>
      ) : null}

      <View style={[styles.footerRow, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.counterpartyBox}>
          <User size={14} color={colors.textSecondary} />
          <Text style={[styles.counterpartyText, { color: colors.textSecondary }]} numberOfLines={1}>
            {counterpartyName}
          </Text>
        </View>

        <View style={styles.rightFooter}>
          {job.offered_price_etb ? (
            <View
              style={[
                styles.pricePill,
                {
                  backgroundColor: colors.primaryLight
                }
              ]}
            >
              <Text style={[styles.priceText, { color: colors.primary }]}>
                {job.offered_price_etb} {t('etb')}
              </Text>
            </View>
          ) : null}
          <View style={styles.dateBox}>
            <Calendar size={12} color={colors.textMuted} />
            <Text style={[styles.dateText, { color: colors.textMuted }]}>{formatDate(job.created_at)}</Text>
          </View>
          <ChevronRight size={16} color={colors.textMuted} />
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700'
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.2
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1
  },
  counterpartyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1
  },
  counterpartyText: {
    fontSize: 13,
    fontWeight: '600'
  },
  rightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  pricePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  priceText: {
    fontSize: 13,
    fontWeight: '800'
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  dateText: {
    fontSize: 12
  }
});
