import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { Bell, CheckCircle2, AlertCircle, Clock, ChevronRight, Sparkles } from 'lucide-react-native';
import { useTranslation } from '../../utils/i18n';
import { useTheme } from '../../context/ThemeContext';
import { EmptyState } from '../../components/EmptyState';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'alert' | 'info';
  unread?: boolean;
}

export default function MessagesTabScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const notifications: NotificationItem[] = [
    {
      id: '1',
      title: 'ባለሙያ ተመድቧል (Worker Assigned)',
      message: 'ቻላ ዲባባ (የኤሌክትሪክ ባለሙያ) ጥሪዎን ተቀብሏል። በቅርቡ ይደውልልዎታል!',
      time: '10 ደቂቃ በፊት',
      type: 'success',
      unread: true
    },
    {
      id: '2',
      title: 'የስራ መጠይቅ ተልኳል (Request Sent)',
      message: 'የቧንቧ ጥገና የስራ ጥያቄዎ በአቅራቢያዎ ላሉ ባለሙያዎች ተልኳል',
      time: '2 ሰዓት በፊት',
      type: 'info',
      unread: true
    },
    {
      id: '3',
      title: 'ስራው ተጠናቋል (Job Completed)',
      message: 'የቀለም ቅብ ስራዎ መጠናቀቁ ተገልጿል። እባክዎ አገልግሎቱን ይገምግሙ!',
      time: 'ትላንት',
      type: 'alert',
      unread: false
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={20} color={colors.success} />;
      case 'alert':
        return <AlertCircle size={20} color={colors.accent} />;
      default:
        return <Bell size={20} color={colors.primary} />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'success':
        return isDark ? 'rgba(52, 211, 153, 0.15)' : '#D1FAE5';
      case 'alert':
        return isDark ? 'rgba(251, 191, 36, 0.15)' : '#FEF3C7';
      default:
        return isDark ? 'rgba(20, 184, 166, 0.15)' : '#F0FDFA';
    }
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
            {t('messages')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            የስራ ማሳወቂያዎች እና መልዕክቶች
          </Text>
        </View>

        <View
          style={[
            styles.unreadPill,
            { backgroundColor: isDark ? 'rgba(20, 184, 166, 0.18)' : '#CCFBF1' }
          ]}
        >
          <Sparkles size={12} color={colors.primary} />
          <Text style={[styles.unreadPillText, { color: colors.primary }]}>2 አዲስ</Text>
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.notificationCard,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: item.unread
                  ? isDark
                    ? colors.primary
                    : colors.primary
                  : colors.border
              },
              colors.cardShadow
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: getIconBg(item.type) }]}>
              {getIcon(item.type)}
            </View>

            <View style={styles.content}>
              <View style={styles.topRow}>
                <Text style={[styles.titleText, { color: colors.textPrimary }]}>
                  {item.title}
                </Text>
                {item.unread && (
                  <View style={[styles.dotUnread, { backgroundColor: colors.primary }]} />
                )}
              </View>

              <Text style={[styles.messageText, { color: colors.textSecondary }]}>
                {item.message}
              </Text>

              <View style={styles.footerRow}>
                <View style={styles.timeRow}>
                  <Clock size={11} color={colors.textMuted} />
                  <Text style={[styles.timeText, { color: colors.textMuted }]}>
                    {item.time}
                  </Text>
                </View>
                <ChevronRight size={14} color={colors.textMuted} />
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<Bell size={38} color={colors.textMuted} />}
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
  unreadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12
  },
  unreadPillText: {
    fontSize: 11,
    fontWeight: '800'
  },
  listContent: {
    padding: 16,
    gap: 12
  },
  notificationCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 14
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    marginBottom: 6
  },
  titleText: {
    fontSize: 15,
    fontWeight: '800',
    flex: 1
  },
  dotUnread: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600'
  }
});
