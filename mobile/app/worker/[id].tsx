import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Briefcase, Phone, CheckCircle2 } from 'lucide-react-native';
import { api } from '../../services/api';
import { useTranslation } from '../../utils/i18n';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { VoicePlayer } from '../../components/VoicePlayer';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';

export default function WorkerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

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
  if (error || !worker) return <ErrorState message={t('something_went_wrong')} onRetry={refetch} />;

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Card Header */}
        <View
          style={[
            styles.headerCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border
            },
            colors.cardShadow
          ]}
        >
          <Avatar
            name={worker.full_name}
            imageUrl={worker.avatar_url}
            size={84}
            isVerified={true}
          />
          <Text style={[styles.nameText, { color: colors.textPrimary }]}>{worker.full_name || t('worker')}</Text>
          <Text
            style={[
              styles.skillCategoryBadge,
              {
                backgroundColor: isDark ? 'rgba(20, 184, 166, 0.18)' : '#F0FDFA',
                color: colors.primary
              }
            ]}
          >
            {worker.skill_category}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingBadge}>
              <Star size={16} color="#F59E0B" fill="#F59E0B" />
              <Text style={[styles.ratingText, { color: colors.textPrimary }]}>{Number(worker.rating_avg).toFixed(1)}</Text>
              <Text style={[styles.ratingCount, { color: colors.textSecondary }]}>({worker.rating_count} {t('reviews')})</Text>
            </View>

            <View style={styles.distanceBadge}>
              <MapPin size={15} color={colors.primary} />
              <Text style={[styles.distanceText, { color: colors.primary }]}>{worker.distance_km || 1.2} {t('km')} {t('away')}</Text>
            </View>
          </View>
        </View>

        {/* Worker Voice Introduction if available */}
        {worker.profile_audio_url && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('voice_intro_label')}</Text>
            <VoicePlayer audioUrl={worker.profile_audio_url} title={t('voice_note_title')} />
          </View>
        )}

        {/* Experience and Rate Cards */}
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border
              }
            ]}
          >
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('experience')}</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>{worker.experience_years || 5} {t('years')}</Text>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border
              }
            ]}
          >
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('rate')}</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>{worker.hourly_rate_etb || 400} {t('etb_hourly')}</Text>
          </View>
        </View>

        {/* Skill Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('bio_label')}</Text>
          <View
            style={[
              styles.bioCard,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border
              }
            ]}
          >
            <Text style={[styles.bioText, { color: colors.textPrimary }]}>
              {worker.skill_description || t('tagline')}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <Button
          title={t('request_worker')}
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
