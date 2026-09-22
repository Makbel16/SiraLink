import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Briefcase } from 'lucide-react-native';
import { api } from '../../services/api';
import { useTranslation } from '../../utils/i18n';
import { JobCard } from '../../components/JobCard';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { JobRequest, JobStatus } from '../../types/index';

export default function JobsTabScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const {
    data: jobs = [],
    isLoading,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: () => api.getJobs()
  });

  const filteredJobs = jobs.filter((job) => {
    if (filter === 'ACTIVE') {
      return job.status === 'OPEN' || job.status === 'ASSIGNED' || job.status === 'IN_PROGRESS';
    }
    if (filter === 'COMPLETED') {
      return job.status === 'COMPLETED';
    }
    return true;
  });

  const handleJobPress = (job: JobRequest) => {
    router.push(`/job/${job.id}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('my_jobs')}</Text>
      </View>

      {/* Segmented Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          onPress={() => setFilter('ALL')}
          style={[styles.filterBtn, filter === 'ALL' && styles.filterBtnActive]}
        >
          <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>
            ሁሉም (All)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilter('ACTIVE')}
          style={[styles.filterBtn, filter === 'ACTIVE' && styles.filterBtnActive]}
        >
          <Text style={[styles.filterText, filter === 'ACTIVE' && styles.filterTextActive]}>
            በመሰራት ላይ (Active)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilter('COMPLETED')}
          style={[styles.filterBtn, filter === 'COMPLETED' && styles.filterBtnActive]}
        >
          <Text style={[styles.filterText, filter === 'COMPLETED' && styles.filterTextActive]}>
            የተጠናቀቁ (Done)
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingState message={t('loading')} />
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <JobCard job={item} onPress={handleJobPress} />}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <EmptyState
              icon={<Briefcase size={36} color="#94A3B8" />}
              title="ምንም የተመዘገበ ስራ የለም"
              description="አዲስ ስራ ለመመዝገብ ወደ ዋናው ገጽ በመሄድ ድምጽዎን ይቅረጹ"
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
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A'
  },
  filterBar: {
    flexDirection: 'row',
    padding: 14,
    gap: 8
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  filterBtnActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E'
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B'
  },
  filterTextActive: {
    color: '#FFFFFF'
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30
  }
});
