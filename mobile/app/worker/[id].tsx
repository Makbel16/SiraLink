import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Briefcase, Phone, CheckCircle2 } from 'lucide-react-native';
import { api } from '../../services/api';
import { useTranslation } from '../../utils/i18n';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { VoicePlayer } from '../../components/VoicePlayer';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';

export default function WorkerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  const {
    data: worker,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['worker-profile', id],
    queryFn: () => api.getWorker(id)
  });

  if (isLoading) return <LoadingState />;
  if (error || !worker) return <ErrorState message="የባለሙያው መረጃ አልተገኘም" onRetry={refetch} />;

  const handleRequest = () => {
    router.push({
      pathname: '/job/create',
      params: {
        workerId: worker.user_id,
        category: worker.skill_category
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Card Header */}
        <View style={styles.headerCard}>
          <Avatar
            name={worker.full_name}
            imageUrl={worker.avatar_url}
            size={84}
            isVerified={true}
          />
          <Text style={styles.nameText}>{worker.full_name || t('worker')}</Text>
          <Text style={styles.skillCategoryBadge}>{worker.skill_category}</Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingBadge}>
              <Star size={16} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>{Number(worker.rating_avg).toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({worker.rating_count} ግምገማዎች)</Text>
            </View>

            <View style={styles.distanceBadge}>
              <MapPin size={15} color="#0F766E" />
              <Text style={styles.distanceText}>{worker.distance_km || 1.2} km ርቀት</Text>
            </View>
          </View>
        </View>

        {/* Worker Voice Introduction if available */}
        {worker.profile_audio_url && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>የባለሙያው ድምጽ (Voice Introduction)</Text>
            <VoicePlayer audioUrl={worker.profile_audio_url} title="ስለ ራሴ እና ስራዬ" />
          </View>
        )}

        {/* Experience and Rate Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>የስራ ልምድ (Experience)</Text>
            <Text style={styles.statValue}>{worker.experience_years || 5} ዓመታት</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>ተመን (Hourly Rate)</Text>
            <Text style={styles.statValue}>{worker.hourly_rate_etb || 400} ETB</Text>
          </View>
        </View>

        {/* Skill Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ስለ ባለሙያው (Bio)</Text>
          <View style={styles.bioCard}>
            <Text style={styles.bioText}>
              {worker.skill_description ||
                'በዘርፉ የካበተ የስራ ልምድ ያለው፣ ጥራት ያለው ስራ በታማኝነት እና በፍጥነት የሚያቀርብ ባለሙያ።'}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <Button
          title="ይህን ባለሙያ ጥራ (Request Worker)"
          onPress={handleRequest}
          size="lg"
          style={{ marginTop: 20 }}
        />
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
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20
  },
  nameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12
  },
  skillCategoryBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F766E',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 14
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A'
  },
  ratingCount: {
    fontSize: 13,
    color: '#64748B'
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  distanceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F766E'
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F766E'
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8
  },
  bioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  bioText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22
  }
});
