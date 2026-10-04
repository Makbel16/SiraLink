import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, Clock, CheckCircle2, ListFilter, PlusCircle } from 'lucide-react-native';
import { api } from '../../services/api';
import { useTranslation } from '../../utils/i18n';
import { useTheme } from '../../context/ThemeContext';
import { JobCard } from '../../components/JobCard';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { JobRequest } from '../../types/index';

export default function JobsTabScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
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

  const activeCount = jobs.filter(
    (j) => j.status === 'OPEN' || j.status === 'ASSIGNED' || j.status === 'IN_PROGRESS'
  ).length;

  const completedCount = jobs.filter((j) => j.status === 'COMPLETED').length;

  const handleJobPress = (job: JobRequest) => {
    router.push(`/job/${job.id}`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header Bar */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surfaceCard,
            borderBottomColor: colors.border
          }
        ]}
      >
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {t('my_jobs')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            የተጠየቁ እና የተጠናቀቁ ስራዎች ታሪክ
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.newJobButton,
            { backgroundColor: isDark ? 'rgba(20, 184, 166, 0.18)' : '#CCFBF1' }
          ]}
          activeOpacity={0.8}
          onPress={() => router.push('/job/create')}
        >
          <PlusCircle size={16} color={colors.primary} />
          <Text style={[styles.newJobText, { color: colors.primary }]}>አዲስ ስራ</Text>
        </TouchableOpacity>
      </View>

      {/* Segmented Filter Bar */}
      <View style={styles.filterSection}>
        <View
          style={[
            styles.filterBar,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border
            },
            colors.cardShadow
          ]}
        >
          <TouchableOpacity
            onPress={() => setFilter('ALL')}
            style={[
              styles.filterBtn,
              filter === 'ALL' && [
                styles.filterBtnActive,
                { backgroundColor: colors.primary }
              ]
            ]}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: filter === 'ALL' ? '#FFFFFF' : colors.textSecondary,
                  fontWeight: filter === 'ALL' ? '800' : '600'
                }
              ]}
            >
              ሁሉም ({jobs.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter('ACTIVE')}
            style={[
              styles.filterBtn,
              filter === 'ACTIVE' && [
                styles.filterBtnActive,
                { backgroundColor: colors.primary }
              ]
            ]}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: filter === 'ACTIVE' ? '#FFFFFF' : colors.textSecondary,
                  fontWeight: filter === 'ACTIVE' ? '800' : '600'
                }
              ]}
            >
              በመሰራት ላይ ({activeCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter('COMPLETED')}
            style={[
              styles.filterBtn,
              filter === 'COMPLETED' && [
                styles.filterBtnActive,
                { backgroundColor: colors.primary }
              ]
            ]}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: filter === 'COMPLETED' ? '#FFFFFF' : colors.textSecondary,
                  fontWeight: filter === 'COMPLETED' ? '800' : '600'
                }
              ]}
            >
              የተጠናቀቁ ({completedCount})
            </Text>
          </TouchableOpacity>
        </View>
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
              icon={<Briefcase size={38} color={colors.textMuted} />}
              title="ምንም የተመዘገበ ስራ የለም"
              description="አዲስ ስራ ለመመዝገብ ወደ ዋናው ገጽ በመሄድ ድምጽዎን ይቅረጹ ወይም 'አዲስ ስራ' የሚለውን ይጫኑ"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500'
  },
  newJobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12
  },
  newJobText: {
    fontSize: 13,
    fontWeight: '800'
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10
  },
  filterBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12
  },
  filterBtnActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2
  },
  filterText: {
    fontSize: 12
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 34
  }
});
