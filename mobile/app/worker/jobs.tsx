import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Play, MapPin, Phone } from 'lucide-react-native';
import { api } from '../../services/api';
import { useTranslation } from '../../utils/i18n';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/Button';
import { VoicePlayer } from '../../components/VoicePlayer';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { JobRequest, JobStatus } from '../../types/index';

export default function WorkerJobsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const {
    data: jobs = [],
    isLoading,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['worker-jobs'],
    queryFn: () => api.getJobs()
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

  const handleUpdateStatus = async (jobId: string, status: JobStatus) => {
    try {
      await api.updateJobStatus(jobId, status);
      Alert.alert(
        status === 'IN_PROGRESS'
          ? t('job_started_success')
          : status === 'COMPLETED'
          ? t('job_completed_worker_success')
          : t('status_changed')
      );
      queryClient.invalidateQueries({ queryKey: ['worker-jobs'] });
    } catch (err: any) {
      Alert.alert(t('error'), err.message);
    }
  };

  const renderJobItem = ({ item }: { item: JobRequest }) => {
    return (
      <View
        style={[
          styles.jobCard,
          {
            backgroundColor: colors.surfaceCard,
            borderColor: colors.border
          },
          colors.cardShadow
        ]}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.categoryText, { color: colors.primary }]}>{item.category}</Text>
            <Text style={[styles.titleText, { color: colors.textPrimary }]}>{item.title || t('job_request_default')}</Text>
          </View>
          <Badge
            label={getStatusLabel(item.status)}
            variant={
              item.status === 'COMPLETED'
                ? 'success'
                : item.status === 'IN_PROGRESS'
                ? 'warning'
                : 'info'
            }
          />
        </View>

        {/* Customer Audio Description */}
        {item.audio_description_url && (
          <View style={{ marginVertical: 10 }}>
            <VoicePlayer audioUrl={item.audio_description_url} title={t('customer_voice')} />
          </View>
        )}

        {item.text_description && (
          <Text style={[styles.descText, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.text_description}
          </Text>
        )}

        <View style={[styles.clientRow, { borderTopColor: colors.borderSubtle }]}>
          <Text style={[styles.clientName, { color: colors.textPrimary }]}>{item.client_name || t('client')}</Text>
          {item.offered_price_etb && (
            <Text style={[styles.priceText, { color: colors.primary }]}>{item.offered_price_etb} {t('etb')}</Text>
          )}
        </View>

        {/* Action Buttons depending on Job Lifecycle Status */}
        <View style={styles.actionRow}>
          {item.status === 'ASSIGNED' && (
            <>
              <Button
                title={t('accept')}
                onPress={() => handleUpdateStatus(item.id, 'IN_PROGRESS')}
                size="sm"
                style={{ flex: 1 }}
                icon={<Check size={16} color="#FFFFFF" />}
              />
              <Button
                title={t('reject')}
                onPress={() => handleUpdateStatus(item.id, 'CANCELLED')}
                variant="outline"
                size="sm"
                style={{ flex: 1 }}
                icon={<X size={16} color={colors.primary} />}
              />
            </>
          )}

          {item.status === 'IN_PROGRESS' && (
            <Button
              title={t('complete')}
              onPress={() => handleUpdateStatus(item.id, 'COMPLETED')}
              size="sm"
              style={{ flex: 1 }}
              icon={<Check size={16} color="#FFFFFF" />}
            />
          )}

          {item.status === 'COMPLETED' && (
            <Text style={[styles.completedLabel, { color: colors.success }]}>{t('job_completed_done')} ✓</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surfaceCard, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('incoming_requests')}</Text>
      </View>

      {isLoading ? (
        <LoadingState message={t('loading_jobs')} />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          renderItem={renderJobItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <EmptyState
              title={t('no_registered_jobs')}
              description={t('incoming_jobs_empty_desc')}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A'
  },
  listContent: {
    padding: 16,
    gap: 14
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E'
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2
  },
  descText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 10
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    marginBottom: 14
  },
  clientName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155'
  },
  priceText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F766E'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center'
  },
  completedLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803D',
    textAlign: 'center',
    width: '100%'
  }
});
