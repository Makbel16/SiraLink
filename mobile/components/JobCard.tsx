import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, User, Wrench, ChevronRight } from 'lucide-react-native';
import { JobRequest, JobStatus } from '../types/index.js';
import { Badge } from './Badge.js';
import { useTranslation } from '../utils/i18n.js';

interface JobCardProps {
  job: JobRequest;
  onPress: (job: JobRequest) => void;
  isWorkerPerspective?: boolean;
}

export function JobCard({ job, onPress, isWorkerPerspective = false }: JobCardProps) {
  const { t } = useTranslation();

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
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.categoryPill}>
          <Wrench size={13} color="#0F766E" />
          <Text style={styles.categoryText}>{job.category}</Text>
        </View>
        {getStatusBadge(job.status)}
      </View>

      <Text style={styles.titleText} numberOfLines={1}>
        {job.title || `${job.category} Service`}
      </Text>

      {job.text_description ? (
        <Text style={styles.descriptionText} numberOfLines={2}>
          {job.text_description}
        </Text>
      ) : null}

      <View style={styles.footerRow}>
        <View style={styles.counterpartyBox}>
          <User size={14} color="#64748B" />
          <Text style={styles.counterpartyText} numberOfLines={1}>
            {counterpartyName}
          </Text>
        </View>

        <View style={styles.rightFooter}>
          {job.offered_price_etb ? (
            <Text style={styles.priceText}>{job.offered_price_etb} ETB</Text>
          ) : null}
          <View style={styles.dateBox}>
            <Calendar size={12} color="#94A3B8" />
            <Text style={styles.dateText}>{formatDate(job.created_at)}</Text>
          </View>
          <ChevronRight size={16} color="#94A3B8" />
        </View>
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
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E'
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4
  },
  descriptionText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 10
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC'
  },
  counterpartyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1
  },
  counterpartyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155'
  },
  rightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F766E'
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8'
  }
});
