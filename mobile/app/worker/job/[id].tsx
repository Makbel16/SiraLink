import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Phone, CheckCircle, Navigation, MapPin, Check, X } from 'lucide-react-native';
import { api } from '../../../services/api';
import { useTranslation } from '../../../utils/i18n';
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

  const {
    data: job,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['worker-job-detail', id],
    queryFn: () => api.getJobById(id)
  });

  const handleUpdateStatus = async (status: JobStatus) => {
    try {
      await api.updateJobStatus(id, status);
      Alert.alert(
        status === 'IN_PROGRESS'
          ? 'ስራው ተጀምሯል!'
          : status === 'COMPLETED'
          ? 'ስራው ተጠናቋል!'
          : 'ሁኔታው ተቀይሯል'
      );
      queryClient.invalidateQueries({ queryKey: ['worker-job-detail', id] });
    } catch (err: any) {
      Alert.alert('ስህተት', err.message);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error || !job) return <ErrorState message="የስራው ዝርዝር አልተገኘም" onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.categoryText}>{job.category}</Text>
            <Text style={styles.titleText}>{job.title || 'የደንበኛ ጥያቄ'}</Text>
          </View>
          <Badge label={job.status} variant="warning" />
        </View>

        {/* Customer Audio Player */}
        {job.audio_description_url && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>የደንበኛው ድምጽ (Customer Voice)</Text>
            <VoicePlayer audioUrl={job.audio_description_url} title="የደንበኛውን ድምጽ ያዳምጡ" />
          </View>
        )}

        {/* Text Description */}
        {job.text_description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ዝርዝር (Description)</Text>
            <View style={styles.descCard}>
              <Text style={styles.descContent}>{job.text_description}</Text>
            </View>
          </View>
        )}

        {/* Client Contact Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>የደንበኛው አድራሻ (Client Contact)</Text>
          <View style={styles.contactCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.clientName}>{job.client_name || 'ደንበኛ'}</Text>
              <Text style={styles.clientPhone}>{job.client_phone || 'ስልክ ቁጥር'}</Text>
            </View>

            {job.client_phone && (
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => Alert.alert('ደውል', `ደውል ወደ ${job.client_phone}`)}
              >
                <Phone size={18} color="#FFFFFF" />
                <Text style={styles.callText}>ደውል</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Price Info */}
        {job.offered_price_etb && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>የተሰጠው ክፍያ (Payment Offer)</Text>
            <Text style={styles.priceValue}>{job.offered_price_etb} ETB</Text>
          </View>
        )}

        {/* Worker Action Buttons */}
        <View style={styles.actionsContainer}>
          {job.status === 'ASSIGNED' && (
            <Button
              title="ስራውን ጀምር (Start Job)"
              onPress={() => handleUpdateStatus('IN_PROGRESS')}
              size="lg"
              icon={<Check size={20} color="#FFFFFF" />}
            />
          )}

          {job.status === 'IN_PROGRESS' && (
            <Button
              title="ስራውን አጠናቅቄያለሁ (Finish Job)"
              onPress={() => handleUpdateStatus('COMPLETED')}
              size="lg"
              icon={<CheckCircle size={20} color="#FFFFFF" />}
            />
          )}

          {job.status === 'COMPLETED' && (
            <View style={styles.completedNotice}>
              <CheckCircle size={24} color="#15803D" />
              <Text style={styles.completedNoticeText}>ይህ ስራ ተጠናቋል!</Text>
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
