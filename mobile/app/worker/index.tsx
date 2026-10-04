import { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Briefcase, UserCheck, ArrowRight, DollarSign, Bell, MapPin, User, ChevronRight, Zap, CheckCircle2 } from 'lucide-react-native';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../utils/i18n';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/Button';
import { JobCard } from '../../components/JobCard';
import { LoadingState } from '../../components/LoadingState';

export default function WorkerDashboardScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, workerProfile, setRoleMode } = useAuth();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const [isAvailable, setIsAvailable] = useState<boolean>(workerProfile?.is_available ?? true);

  // Fetch jobs assigned to this worker
  const { data: workerJobs = [], isLoading } = useQuery({
    queryKey: ['worker-jobs'],
    queryFn: () => api.getJobs()
  });

  const toggleAvailability = async (value: boolean) => {
    setIsAvailable(value);
    try {
      await api.updateWorkerAvailability(value);
      Alert.alert(
        value ? 'ክፍት ነዎት' : 'ስራ ላይ ነዎት',
        value ? 'አሁን አዳዲስ የስራ ጥሪዎችን ይቀበላሉ' : 'የስራ ጥሪዎች ለጊዜው አይደርስዎትም'
      );
      queryClient.invalidateQueries({ queryKey: ['worker-jobs'] });
    } catch {
      setIsAvailable(!value);
    }
  };

  const incomingRequests = workerJobs.filter((j) => j.status === 'ASSIGNED');
  const activeJobs = workerJobs.filter((j) => j.status === 'IN_PROGRESS');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Availability Toggle Hero Banner */}
        <View
          style={[
            styles.availabilityCard,
            {
              backgroundColor: isAvailable
                ? isDark
                  ? '#0A2518'
                  : '#F0FDF4'
                : isDark
                ? colors.surfaceCard
                : '#F1F5F9',
              borderColor: isAvailable
                ? colors.success
                : colors.border
            },
            colors.cardShadow
          ]}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.onlineBadgeRow}>
              <View
                style={[
                  styles.onlineBadgeDot,
                  { backgroundColor: isAvailable ? colors.success : colors.textMuted }
                ]}
              />
              <Text
                style={[
                  styles.availabilityTitle,
                  { color: isAvailable ? (isDark ? '#4ADE80' : '#15803D') : colors.textPrimary }
                ]}
              >
                {isAvailable ? 'አሁን ክፍት ነዎት (Online)' : 'ስራ ላይ ነዎት (Busy / Offline)'}
              </Text>
            </View>
            <Text style={[styles.availabilitySub, { color: colors.textSecondary }]}>
              {isAvailable
                ? 'ደንበኞች በአቅራቢያዎ ስራ ሲጠይቁ ማሳወቂያ ይደርስዎታል'
                : 'አዳዲስ ስራዎችን መቀበል ሲፈልጉ ያብሩት'}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={toggleAvailability}
            trackColor={{ false: '#475569', true: colors.success }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Dashboard Stat Counters Card */}
        <View
          style={[
            styles.statsCardRow,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border
            },
            colors.cardShadow
          ]}
        >
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.accent }]}>
              {incomingRequests.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>አዳዲስ ጥሪዎች</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: colors.borderSubtle }]} />

          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {activeJobs.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>በመሰራት ላይ</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: colors.borderSubtle }]} />

          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {workerJobs.filter((j) => j.status === 'COMPLETED').length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>የተጠናቀቁ</Text>
          </View>
        </View>

        {/* Incoming Job Alerts */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            አዳዲስ የስራ ጥሪዎች (Incoming Requests)
          </Text>
          <TouchableOpacity onPress={() => router.push('/worker/jobs')}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>
              ሁሉንም ({incomingRequests.length})
            </Text>
          </TouchableOpacity>
        </View>

        {incomingRequests.length > 0 ? (
          incomingRequests.slice(0, 2).map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isWorkerPerspective={true}
              onPress={() => router.push(`/worker/job/${job.id}`)}
            />
          ))
        ) : (
          <View
            style={[
              styles.emptyRequestsBox,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border
              }
            ]}
          >
            <CheckCircle2 size={24} color={colors.primary} />
            <Text style={[styles.emptyRequestsText, { color: colors.textSecondary }]}>
              በአሁኑ ጊዜ አዲስ የስራ ጥሪ የለም። መተግበሪያውን ክፍት ያድርጉት።
            </Text>
          </View>
        )}

        {/* Quick Worker Navigation Cards */}
        <View
          style={[
            styles.actionMenu,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border
            },
            colors.cardShadow
          ]}
        >
          <TouchableOpacity
            style={[styles.actionItem, { borderBottomColor: colors.borderSubtle }]}
            activeOpacity={0.7}
            onPress={() => router.push('/worker/profile')}
          >
            <View
              style={[
                styles.actionIconBox,
                { backgroundColor: isDark ? 'rgba(20, 184, 166, 0.15)' : '#F0FDFA' }
              ]}
            >
              <Briefcase size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>
                የሙያ እና ተመን ማስተካከያ (Edit Profile)
              </Text>
              <Text style={[styles.actionSub, { color: colors.textSecondary }]}>
                የስራ ዘርፍ፣ የሰዓት ዋጋ እና የድምጽ መግለጫ
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            activeOpacity={0.7}
            onPress={() => {
              setRoleMode('CLIENT');
              router.replace('/(tabs)');
            }}
          >
            <View
              style={[
                styles.actionIconBox,
                { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7' }
              ]}
            >
              <User size={20} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>
                ወደ ደንበኛ ገጽ ተመለስ (Client Mode)
              </Text>
              <Text style={[styles.actionSub, { color: colors.textSecondary }]}>
                ባለሙያ መጥራት ሲፈልጉ ወደ ደንበኛ ሁነታ ይቀይሩ
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
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
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 22,
    borderWidth: 1.5,
    marginBottom: 18
  },
  onlineBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 4
  },
  onlineBadgeDot: {
    width: 9,
    height: 9,
    borderRadius: 5
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  availabilitySub: {
    fontSize: 12,
    lineHeight: 16
  },
  statsCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 22
  },
  statBox: {
    flex: 1,
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900'
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4
  },
  statDivider: {
    width: 1,
    height: 32
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800'
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700'
  },
  emptyRequestsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20
  },
  emptyRequestsText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18
  },
  actionMenu: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 6
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
    borderBottomWidth: 1
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 3
  },
  actionSub: {
    fontSize: 12
  }
});
