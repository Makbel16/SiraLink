import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { Bell, CheckCircle2, AlertCircle, Clock } from 'lucide-react-native';
import { useTranslation } from '../../utils/i18n.js';
import { EmptyState } from '../../components/EmptyState.js';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'alert' | 'info';
}

export default function MessagesTabScreen() {
  const { t } = useTranslation();

  const notifications: NotificationItem[] = [
    {
      id: '1',
      title: 'ባለሙያ ተመድቧል (Worker Assigned)',
      message: 'ቻላ ዲባባ (የኤሌክትሪክ ባለሙያ) ጥሪዎን ተቀብሏል። በቅርቡ ይደውልልዎታል!',
      time: '10 ደቂቃ በፊት',
      type: 'success'
    },
    {
      id: '2',
      title: 'የስራ መጠይቅ ተልኳል (Request Sent)',
      message: 'የቧንቧ ጥገና የስራ ጥያቄዎ በአቅራቢያዎ ላሉ ባለሙያዎች ተልኳል',
      time: '2 ሰዓት በፊት',
      type: 'info'
    },
    {
      id: '3',
      title: 'ስራው ተጠናቋል (Job Completed)',
      message: 'የቀለም ቅብ ስራዎ መጠናቀቁ ተገልጿል። እባክዎ አገልግሎቱን ይገምግሙ!',
      time: 'ትላንት',
      type: 'alert'
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={20} color="#15803D" />;
      case 'alert':
        return <AlertCircle size={20} color="#D97706" />;
      default:
        return <Bell size={20} color="#0F766E" />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('messages')}</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.8} style={styles.notificationCard}>
            <View style={styles.iconCircle}>{getIcon(item.type)}</View>
            <View style={styles.content}>
              <View style={styles.topRow}>
                <Text style={styles.titleText}>{item.title}</Text>
                <View style={styles.timeRow}>
                  <Clock size={11} color="#94A3B8" />
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
              </View>
              <Text style={styles.messageText}>{item.message}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyEmpty={
          <EmptyState
            icon={<Bell size={36} color="#94A3B8" />}
            title="ምንም አዲስ መልዕክት የለም"
            description="የስራ ማሳወቂያዎች ሲኖሩዎት እዚህ ያገኟቸዋል"
          />
        }
      />
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
  listContent: {
    padding: 16,
    gap: 12
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    flex: 1
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  timeText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600'
  },
  messageText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18
  }
});
