import { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Briefcase, UserCheck, ArrowRight, DollarSign, Bell, MapPin, User, ChevronRight } from 'lucide-react-native';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../utils/i18n';
import { Button } from '../../components/Button';
import { JobCard } from '../../components/JobCard';
import { LoadingState } from '../../components/LoadingState';

export default function WorkerDashboardScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, workerProfile, setRoleMode } = useAuth();
  const { t } = useTranslation();

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Availability Toggle Banner */}
        <View style={[styles.availabilityCard, isAvailable ? styles.cardOnline : styles.cardOffline]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.availabilityTitle}>
              {isAvailable ? 'አሁን ክፍት ነዎት (Available)' : 'ስራ ላይ ነዎት (Unavailable)'}
            </Text>
            <Text style={styles.availabilitySub}>
              {isAvailable ? 'ደንበኞች በአቅራቢያዎ ስራ ሲጠይቁ ማሳወቂያ ይደርስዎታል' : 'ስራ መቀበል ሲፈልጉ ያብሩት'}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={toggleAvailability}
            trackColor={{ false: '#CBD5E1', true: '#22C55E' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Dashboard Stat Counters */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{incomingRequests.length}</Text>
            <Text style={styles.statLabel}>አዳዲስ ጥሪዎች (New)</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{activeJobs.length}</Text>
            <Text style={styles.statLabel}>በመሰራት ላይ (Active)</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {workerJobs.filter((j) => j.status === 'COMPLETED').length}
            </Text>
            <Text style={styles.statLabel}>የተጠናቀቁ (Done)</Text>
          </View>
        </View>

        {/* Incoming Job Alerts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>አዳዲስ የስራ ጥሪዎች (Incoming Requests)</Text>
          <TouchableOpacity onPress={() => router.push('/worker/jobs')}>
            <Text style={styles.seeAllText}>ሁሉንም ({incomingRequests.length})</Text>
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
          <View style={styles.emptyRequestsBox}>
            <Text style={styles.emptyRequestsText}>በአሁኑ ጊዜ አዲስ የስራ ጥሪ የለም</Text>
          </View>
        )}

        {/* Quick Worker Navigation Cards */}
        <View style={styles.actionMenu}>
          <TouchableOpacity
            style={styles.actionItem}
            activeOpacity={0.7}
            onPress={() => router.push('/worker/profile')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#F0FDFA' }]}>
              <Briefcase size={20} color="#0F766E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>የሙያ እና ተመን ማስተካከያ (Edit Profile)</Text>
              <Text style={styles.actionSub}>የስራ ዘርፍ፣ የሰዓት ዋጋ እና የድምጽ መግለጫ</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            activeOpacity={0.7}
            onPress={() => {
              setRoleMode('CLIENT');
              router.replace('/(tabs)');
            }}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#FEF3C7' }]}>
              <User size={20} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>ወደ ደንበኛ ገጽ ተመለስ (Client Mode)</Text>
              <Text style={styles.actionSub}>ባለሙያ መጥራት ሲፈልጉ ወደ ደንበኛ ሁነታ ይቀይሩ</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
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
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20
  },
  cardOnline: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0'
  },
  cardOffline: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1'
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4
  },
  availabilitySub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F766E'
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center'
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A'
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F766E'
  },
  emptyRequestsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 20
  },
  emptyRequestsText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600'
  },
  actionMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginTop: 10
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC'
  },
  actionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A'
  },
  actionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  }
});
