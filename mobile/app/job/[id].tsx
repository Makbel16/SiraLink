import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Phone, Star, CheckCircle, Clock, MapPin, AlertTriangle } from 'lucide-react-native';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useTranslation } from '../../utils/i18n.js';
import { Badge } from '../../components/Badge.js';
import { Button } from '../../components/Button.js';
import { VoicePlayer } from '../../components/VoicePlayer.js';
import { LoadingState } from '../../components/LoadingState.js';
import { ErrorState } from '../../components/ErrorState.js';
import { JobStatus } from '../../types/index.js';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submittingRating, setSubmittingRating] = useState<boolean>(false);

  const {
    data: job,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['job-detail', id],
    queryFn: () => api.getJobById(id)
  });

  const handleCompleteJob = async () => {
    try {
      await api.completeJob(id);
      Alert.alert('ስራው ተጠናቋል!', 'ስራው መጠናቀቁ ተረጋግጧል። እባክዎ ባለሙያውን ይገምግሙ!');
      queryClient.invalidateQueries({ queryKey: ['job-detail', id] });
    } catch (err: any) {
      Alert.alert('ስህተት', err.message);
    }
  };

  const handleSubmitRating = async () => {
    setSubmittingRating(true);
    try {
      await api.submitRating(id, rating, comment.trim() || undefined);
      Alert.alert('አመሰግናለሁ!', 'ግምገማዎ በተሳካ ሁኔታ ገብቷል!');
      queryClient.invalidateQueries({ queryKey: ['job-detail', id] });
    } catch (err: any) {
      Alert.alert('ስህተት', err.message);
    } finally {
      setSubmittingRating(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error || !job) return <ErrorState message="የስራው ዝርዝር አልተገኘም" onRetry={refetch} />;

  const isClient = user?.id === job.client_id;
  const isWorker = user?.id === job.worker_id;

  const statuses: JobStatus[] = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];
  const currentStep = statuses.indexOf(job.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Status Header Badge */}
        <View style={styles.statusHeader}>
          <View>
            <Text style={styles.jobCategoryText}>{job.category}</Text>
            <Text style={styles.jobTitleText}>{job.title || 'የስራ ጥያቄ'}</Text>
          </View>
          <Badge
            label={job.status}
            variant={
              job.status === 'COMPLETED'
                ? 'success'
                : job.status === 'CANCELLED'
                ? 'danger'
                : 'warning'
            }
          />
        </View>

        {/* Visual Lifecycle Stepper */}
        <View style={styles.timelineContainer}>
          <View style={styles.timelineRow}>
            {statuses.map((s, idx) => {
              const isPastOrCurrent = currentStep >= idx;
              return (
                <View key={s} style={styles.stepWrapper}>
                  <View
                    style={[
                      styles.stepCircle,
                      isPastOrCurrent && styles.stepCircleActive,
                      job.status === s && styles.stepCircleCurrent
                    ]}
                  >
                    {isPastOrCurrent ? (
                      <CheckCircle size={14} color="#FFFFFF" />
                    ) : (
                      <Clock size={14} color="#94A3B8" />
                    )}
                  </View>
                  <Text style={[styles.stepLabel, isPastOrCurrent && styles.stepLabelActive]}>
                    {s}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Audio Recording Player if recorded */}
        {job.audio_description_url && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>የደንበኛው የድምጽ መግለጫ (Voice Request)</Text>
            <VoicePlayer audioUrl={job.audio_description_url} title="የድምጽ ቅጂውን ያዳምጡ" />
          </View>
        )}

        {/* Text Description */}
        {job.text_description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>የስራ ዝርዝር (Description)</Text>
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>{job.text_description}</Text>
            </View>
          </View>
        )}

        {/* Counterparty info (Worker / Client) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isClient ? 'የተመደበው ባለሙያ (Assigned Worker)' : 'የስራው ባለቤት (Client)'}
          </Text>
          <View style={styles.personCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.personName}>
                {isClient ? job.worker_name || 'በመፈለግ ላይ...' : job.client_name || 'ደንበኛ'}
              </Text>
              <Text style={styles.personPhone}>
                {isClient ? job.worker_phone || 'ስልክ ይገለጻል' : job.client_phone || ''}
              </Text>
            </View>

            {(job.worker_phone || job.client_phone) && (
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => Alert.alert('ደውል', `ደውል ወደ ${isClient ? job.worker_phone : job.client_phone}`)}
              >
                <Phone size={18} color="#FFFFFF" />
                <Text style={styles.callText}>ደውል</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Budget details */}
        {job.offered_price_etb && (
          <View style={styles.priceBanner}>
            <Text style={styles.priceLabel}>የተስማሙበት ዋጋ (Offered Price)</Text>
            <Text style={styles.priceValue}>{job.offered_price_etb} ETB</Text>
          </View>
        )}

        {/* Complete Job Action Button */}
        {isClient && job.status === 'IN_PROGRESS' && (
          <Button
            title="ስራው መጠናቀቁን አረጋግጥ (Mark Completed)"
            onPress={handleCompleteJob}
            variant="primary"
            size="lg"
            style={{ marginTop: 20 }}
          />
        )}

        {/* Rating Submission Section if job is COMPLETED */}
        {isClient && job.status === 'COMPLETED' && (
          <View style={styles.ratingSection}>
            <Text style={styles.ratingSectionTitle}>ባለሙያውን ይገምግሙ (Rate Worker)</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Star
                    size={36}
                    color={star <= rating ? '#F59E0B' : '#CBD5E1'}
                    fill={star <= rating ? '#F59E0B' : 'none'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder="ስለ ስራው ጥራት እና ፍጥነት አስተያየት ይጻፉ..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={comment}
              onChangeText={setComment}
            />

            <Button
              title="ግምገማ አስገባ (Submit Review)"
              onPress={handleSubmitRating}
              loading={submittingRating}
              size="md"
            />
          </View>
        )}
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
  statusHeader: {
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
  jobCategoryText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F766E'
  },
  jobTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2
  },
  timelineContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  stepWrapper: {
    alignItems: 'center',
    gap: 6
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepCircleActive: {
    backgroundColor: '#0F766E'
  },
  stepCircleCurrent: {
    backgroundColor: '#D97706',
    borderWidth: 2,
    borderColor: '#FEF3C7'
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8'
  },
  stepLabelActive: {
    color: '#0F172A'
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
  descriptionBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  descriptionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12
  },
  personName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A'
  },
  personPhone: {
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
  priceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDFA',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: 18
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
  ratingSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 20,
    gap: 14
  },
  ratingSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center'
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10
  },
  reviewInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
    height: 80,
    textAlignVertical: 'top'
  }
});
