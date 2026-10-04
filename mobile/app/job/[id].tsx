import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Phone, Star, CheckCircle, Clock, MapPin, AlertTriangle, Sparkles, Send } from 'lucide-react-native';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../utils/i18n';
import { useTheme } from '../../context/ThemeContext';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { VoicePlayer } from '../../components/VoicePlayer';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { JobStatus } from '../../types/index';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Status Header Card */}
        <View
          style={[
            styles.statusHeaderCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border
            },
            colors.cardShadow
          ]}
        >
          <View style={styles.headerInfoRow}>
            <View
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isDark ? 'rgba(20, 184, 166, 0.18)' : '#CCFBF1'
                }
              ]}
            >
              <Text style={[styles.jobCategoryText, { color: colors.primary }]}>{job.category}</Text>
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

          <Text style={[styles.jobTitleText, { color: colors.textPrimary }]}>
            {job.title || 'የስራ ጥያቄ'}
          </Text>
        </View>

        {/* Visual Lifecycle Stepper Card */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border
            },
            colors.cardShadow
          ]}
        >
          <Text style={[styles.sectionCardTitle, { color: colors.textSecondary }]}>
            የስራው ሂደት (Status Lifecycle)
          </Text>
          <View style={styles.timelineRow}>
            {statuses.map((s, idx) => {
              const isPastOrCurrent = currentStep >= idx;
              const isCurrent = job.status === s;
              return (
                <View key={s} style={styles.stepWrapper}>
                  <View
                    style={[
                      styles.stepCircle,
                      {
                        backgroundColor: isPastOrCurrent
                          ? colors.primary
                          : isDark
                          ? colors.surfaceSubtle
                          : '#E2E8F0',
                        borderColor: isCurrent ? colors.accent : 'transparent'
                      }
                    ]}
                  >
                    {isPastOrCurrent ? (
                      <CheckCircle size={14} color="#FFFFFF" />
                    ) : (
                      <Clock size={14} color={colors.textMuted} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      {
                        color: isPastOrCurrent ? colors.textPrimary : colors.textMuted,
                        fontWeight: isCurrent ? '800' : '600'
                      }
                    ]}
                  >
                    {s}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Audio Recording Player if recorded */}
        {job.audio_description_url && (
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border
              },
              colors.cardShadow
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <Sparkles size={16} color={colors.accent} />
              <Text style={[styles.sectionCardTitle, { color: colors.textPrimary }]}>
                የተቀረጸው የድምጽ መግለጫ (Voice Request)
              </Text>
            </View>
            <VoicePlayer audioUrl={job.audio_description_url} title="የደንበኛው ድምጽ" />
          </View>
        )}

        {/* Text Description Card */}
        {job.text_description && (
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border
              },
              colors.cardShadow
            ]}
          >
            <Text style={[styles.sectionCardTitle, { color: colors.textPrimary }]}>
              የስራ ዝርዝር (Description)
            </Text>
            <View
              style={[
                styles.descriptionBox,
                {
                  backgroundColor: isDark ? colors.surfaceSubtle : '#F8FAFC',
                  borderColor: colors.borderSubtle
                }
              ]}
            >
              <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                {job.text_description}
              </Text>
            </View>
          </View>
        )}

        {/* Counterparty Info Card */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border
            },
            colors.cardShadow
          ]}
        >
          <Text style={[styles.sectionCardTitle, { color: colors.textPrimary }]}>
            {isClient ? 'የተመደበው ባለሙያ (Assigned Worker)' : 'የስራው ባለቤት (Client)'}
          </Text>

          <View style={styles.personCardRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.personName, { color: colors.textPrimary }]}>
                {isClient ? job.worker_name || 'በመፈለግ ላይ...' : job.client_name || 'ደንበኛ'}
              </Text>
              <Text style={[styles.personPhone, { color: colors.textSecondary }]}>
                {isClient ? job.worker_phone || 'ስልክ ይገለጻል' : job.client_phone || ''}
              </Text>
            </View>

            {(job.worker_phone || job.client_phone) && (
              <TouchableOpacity
                style={[styles.callBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
                onPress={() =>
                  Alert.alert('ደውል', `ደውል ወደ ${isClient ? job.worker_phone : job.client_phone}`)
                }
              >
                <Phone size={16} color="#FFFFFF" />
                <Text style={styles.callText}>ደውል</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Budget Details Banner */}
        {job.offered_price_etb && (
          <View
            style={[
              styles.priceBanner,
              {
                backgroundColor: isDark ? '#142834' : '#F0FDFA',
                borderColor: isDark ? 'rgba(20, 184, 166, 0.3)' : '#CCFBF1'
              }
            ]}
          >
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              የተስማሙበት ዋጋ (Offered Price)
            </Text>
            <Text style={[styles.priceValue, { color: colors.primary }]}>
              {job.offered_price_etb} ETB
            </Text>
          </View>
        )}

        {/* Complete Job Action Button */}
        {isClient && job.status === 'IN_PROGRESS' && (
          <Button
            title="ስራው መጠናቀቁን አረጋግጥ (Mark Completed)"
            onPress={handleCompleteJob}
            variant="primary"
            size="lg"
            style={{ marginTop: 18 }}
          />
        )}

        {/* Rating Submission Section if job is COMPLETED */}
        {isClient && job.status === 'COMPLETED' && (
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border
              },
              colors.cardShadow
            ]}
          >
            <Text style={[styles.sectionCardTitle, { color: colors.textPrimary }]}>
              ባለሙያውን ይገምግሙ (Rate Worker)
            </Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Star
                    size={34}
                    color={star <= rating ? '#F59E0B' : colors.textMuted}
                    fill={star <= rating ? '#F59E0B' : 'none'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[
                styles.reviewInput,
                {
                  backgroundColor: isDark ? colors.surfaceSubtle : '#F8FAFC',
                  borderColor: colors.border,
                  color: colors.textPrimary
                }
              ]}
              placeholder="ስለ ስራው ጥራት እና ፍጥነት አስተያየት ይጻፉ..."
              placeholderTextColor={colors.textMuted}
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
    flex: 1
  },
  container: {
    padding: 18,
    paddingBottom: 40
  },
  statusHeaderCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    marginBottom: 14
  },
  headerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  jobCategoryText: {
    fontSize: 12,
    fontWeight: '800'
  },
  jobTitleText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3
  },
  sectionCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1
  },
  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2
  },
  stepLabel: {
    fontSize: 10,
    marginTop: 6
  },
  descriptionBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20
  },
  personCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  personName: {
    fontSize: 16,
    fontWeight: '800'
  },
  personPhone: {
    fontSize: 13,
    marginTop: 2
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12
  },
  callText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13
  },
  priceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: '700'
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '900'
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 12
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 14
  }
});
