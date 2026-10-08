import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Phone, CheckCircle, Navigation, MapPin, Check, X } from 'lucide-react-native';
import { api } from '../../../services/api';
import { useTranslation } from '../../../utils/i18n';
import { useTheme } from '../../../context/ThemeContext';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import { VoicePlayer } from '../../../components/VoicePlayer';
import { LoadingState } from '../../../components/LoadingState';
import { ErrorState } from '../../../components/ErrorState';
import { JobStatus } from '../../../types/index';

export default function WorkerJobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const {
    data: job,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['worker-job-detail', id],
    queryFn: () => api.getJobById(id)
  });

  const getStatusLabel = (status: JobStatus) => {
    switch (status) {
      case 'OPEN': return t('status_open');
      case 'ASSIGNED': return t('status_assigned');
      case 'IN_PROGRESS': return t('status_in_progress');
      case 'COMPLETED': return t('status_completed');
      case 'CANCELLED': return t('status_cancelled');
      default: return status;
    }
  };

  const handleUpdateStatus = async (status: JobStatus) => {
    try {
      await api.updateJobStatus(id, status);
      Alert.alert(
        status === 'IN_PROGRESS'
          ? t('job_started_success')
          : status === 'COMPLETED'
          ? t('job_completed_worker_success')
          : t('status_changed')
      );
      queryClient.invalidateQueries({ queryKey: ['worker-job-detail', id] });
    } catch (err: any) {
      Alert.alert(t('error'), err.message);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error || !job) return <ErrorState message={t('job_details_err')} onRetry={refetch} />;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border
            },
            colors.cardShadow
          ]}
        >
          <View>
            <Text style={[styles.categoryText, { color: colors.primary }]}>{job.category}</Text>
            <Text style={[styles.titleText, { color: colors.textPrimary }]}>{job.title || t('job_request_default')}</Text>
          </View>
          <Badge
            label={getStatusLabel(job.status)}
            variant={
              job.status === 'COMPLETED'
                ? 'success'
                : job.status === 'IN_PROGRESS'
                ? 'warning'
                : 'info'
            }
          />
        </View>

        {/* Customer Audio Player */}
        {job.audio_description_url && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('customer_voice')}</Text>
            <VoicePlayer audioUrl={job.audio_description_url} title={t('listen_customer_voice')} />
          </View>
        )}

        {/* Text Description */}
        {job.text_description && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('description_label')}</Text>
            <View
              style={[
                styles.descCard,
                {
                  backgroundColor: colors.surfaceCard,
                  borderColor: colors.border
                }
              ]}
            >
              <Text style={[styles.descContent, { color: colors.textPrimary }]}>{job.text_description}</Text>
            </View>
          </View>
        )}

        {/* Client Contact Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('customer_contact')}</Text>
          <View
            style={[
              styles.contactCard,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border
              }
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.clientName, { color: colors.textPrimary }]}>{job.client_name || t('client')}</Text>
              <Text style={[styles.clientPhone, { color: colors.textSecondary }]}>{job.client_phone || t('phone_number_label')}</Text>
            </View>

            {job.client_phone && (
              <TouchableOpacity
                style={[styles.callBtn, { backgroundColor: colors.primary }]}
                onPress={() => Alert.alert(t('call'), `${t('call')} ${job.client_phone}`)}
              >
                <Phone size={18} color="#FFFFFF" />
                <Text style={styles.callText}>{t('call')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Price Info */}
        {job.offered_price_etb && (
          <View
            style={[
              styles.priceRow,
              {
                backgroundColor: isDark ? '#142834' : '#F0FDFA',
                borderColor: isDark ? 'rgba(20, 184, 166, 0.3)' : '#CCFBF1'
              }
            ]}
          >
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>{t('offered_price')}</Text>
            <Text style={[styles.priceValue, { color: colors.primary }]}>{job.offered_price_etb} {t('etb')}</Text>
          </View>
        )}

        {/* Worker Action Buttons */}
        <View style={styles.actionsContainer}>
          {job.status === 'ASSIGNED' && (
            <Button
              title={t('start_job')}
              onPress={() => handleUpdateStatus('IN_PROGRESS')}
              size="lg"
              icon={<Check size={20} color="#FFFFFF" />}
            />
          )}

          {job.status === 'IN_PROGRESS' && (
            <Button
              title={t('complete')}
              onPress={() => handleUpdateStatus('COMPLETED')}
              size="lg"
              icon={<CheckCircle size={20} color="#FFFFFF" />}
            />
          )}

          {job.status === 'COMPLETED' && (
            <View style={styles.completedNotice}>
              <CheckCircle size={24} color="#15803D" />
              <Text style={styles.completedNoticeText}>{t('job_completed_done')}!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  container: {
    padding: 20,
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F766E'
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2
  },
  section: {
    marginBottom: 18
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8
  },
  descCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  descContent: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A'
  },
  clientPhone: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F766E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12
  },
  callText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDFA',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: 20
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F766E'
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F766E'
  },
  actionsContainer: {
    marginTop: 10
  },
  completedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    padding: 16,
    borderRadius: 16
  },
  completedNoticeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803D'
  }
});
