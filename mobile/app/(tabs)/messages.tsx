import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  Sparkles,
  CheckCheck,
  Inbox,
  Filter,
  ShieldAlert
} from 'lucide-react-native';
import { useTranslation } from '../../utils/i18n';
import { useTheme } from '../../context/ThemeContext';
import { EmptyState } from '../../components/EmptyState';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'alert' | 'info';
  unread: boolean;
  category?: string;
}

export default function MessagesTabScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'updates'>('all');

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: t('worker_assigned_notif_title'),
      message: t('worker_assigned_notif_msg'),
      time: `10 ${t('time_minutes_ago')}`,
      type: 'success',
      unread: true,
      category: 'match'
    },
    {
      id: '2',
      title: t('job_sent_notif_title'),
      message: t('job_sent_notif_msg'),
      time: `2 ${t('time_hours_ago')}`,
      type: 'info',
      unread: true,
      category: 'order'
    },
    {
      id: '3',
      title: t('job_completed_notif_title'),
      message: t('job_completed_notif_msg'),
      time: t('time_yesterday'),
      type: 'alert',
      unread: false,
      category: 'system'
    }
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'unread') return item.unread;
    if (activeFilter === 'updates') return item.type === 'alert' || item.type === 'info';
    return true;
  });

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
        return colors.primaryLight;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Header Bar */}
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: colors.surfaceCard,
            borderBottomColor: colors.border
          }
        ]}
      >
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              {t('messages')}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {t('notifications_subtitle')}
            </Text>
          </View>

          {unreadCount > 0 ? (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={markAllRead}
              style={[
                styles.markAllBtn,
                { backgroundColor: colors.primaryLight }
              ]}
            >
              <CheckCheck size={14} color={colors.primary} />
              <Text style={[styles.markAllBtnText, { color: colors.primary }]}>
                {t('mark_all_read')}
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={[
                styles.allCaughtUpPill,
                { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.12)' : '#D1FAE5' }
              ]}
            >
              <Sparkles size={12} color={colors.success} />
              <Text style={[styles.allCaughtUpText, { color: colors.success }]}>
                {notifications.length} {t('notifications_all')}
              </Text>
            </View>
          )}
        </View>

        {/* Filter Segmented Buttons */}
        <View style={styles.filterRow}>
          {[
            { key: 'all' as const, label: t('notifications_all'), count: notifications.length },
            { key: 'unread' as const, label: t('notifications_unread'), count: unreadCount },
            { key: 'updates' as const, label: t('notifications_updates'), count: notifications.filter(n => n.type !== 'success').length }
          ].map((tab) => {
            const isSelected = activeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(tab.key)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : isDark
                      ? colors.surfaceSubtle
                      : '#F1F5F9',
                    borderColor: isSelected ? colors.primary : colors.border
                  }
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: isSelected ? '800' : '600'
                    }
                  ]}
                >
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View
                    style={[
                      styles.filterCountBadge,
                      {
                        backgroundColor: isSelected
                          ? 'rgba(255, 255, 255, 0.25)'
                          : isDark
                          ? 'rgba(255, 255, 255, 0.1)'
                          : '#E2E8F0'
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterCountText,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary }
                      ]}
                    >
                      {tab.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Notifications Card List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => toggleRead(item.id)}
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
            {/* Left Type-Colored Icon Circle */}
            <View style={[styles.iconCircle, { backgroundColor: getIconBg(item.type) }]}>
              {getIcon(item.type)}
            </View>

            {/* Notification Text Body */}
            <View style={styles.cardContent}>
              <View style={styles.cardTopRow}>
                <Text style={[styles.titleText, { color: colors.textPrimary }]} numberOfLines={1}>
                  {item.title}
                </Text>
                {item.unread && (
                  <View style={[styles.unreadDotBadge, { backgroundColor: colors.primary }]} />
                )}
              </View>

              <Text style={[styles.messageText, { color: colors.textSecondary }]}>
                {item.message}
              </Text>

              <View style={[styles.footerRow, { borderTopColor: colors.borderSubtle }]}>
                <View style={styles.timeRow}>
                  <Clock size={11} color={colors.textMuted} />
                  <Text style={[styles.timeText, { color: colors.textMuted }]}>
                    {item.time}
                  </Text>
                </View>

                <View style={styles.actionArrow}>
                  <Text style={[styles.actionLabel, { color: colors.primary }]}>
                    {t('view_job')}
                  </Text>
                  <ChevronRight size={13} color={colors.primary} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<Inbox size={38} color={colors.textMuted} />}
            title={t('no_new_messages')}
            description={t('no_new_messages_desc')}
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
  headerCard: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500'
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12
  },
  markAllBtnText: {
    fontSize: 11,
    fontWeight: '800'
  },
  allCaughtUpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12
  },
  allCaughtUpText: {
    fontSize: 11,
    fontWeight: '800'
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1
  },
  filterPillText: {
    fontSize: 12
  },
  filterCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8
  },
  filterCountText: {
    fontSize: 10,
    fontWeight: '800'
  },
  listContent: {
    padding: 16,
    gap: 12
  },
  notificationCard: {
    flexDirection: 'row',
    borderRadius: 22,
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
  cardContent: {
    flex: 1
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  titleText: {
    fontSize: 15,
    fontWeight: '800',
    flex: 1
  },
  unreadDotBadge: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    marginLeft: 6
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600'
  },
  actionArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '800'
  }
});
