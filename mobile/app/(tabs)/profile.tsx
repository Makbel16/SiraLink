import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  Animated,
  Platform,
  Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Globe,
  Briefcase,
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
  Phone,
  ShieldCheck,
  Moon,
  Sun,
  Star,
  Sparkles,
  CircleHelp,
  Bell,
  Check,
  Copy,
  Zap,
  Award
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../utils/i18n';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../../components/Avatar';

export default function ProfileTabScreen() {
  const router = useRouter();
  const { user, logout, setRoleMode } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const { theme, isDark, toggleTheme, colors } = useTheme();

  const [copiedPhone, setCopiedPhone] = useState(false);

  // Entrance Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  // Toggle Switch Animation
  const switchTranslate = useRef(new Animated.Value(isDark ? 28 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  useEffect(() => {
    Animated.spring(switchTranslate, {
      toValue: isDark ? 28 : 0,
      tension: 65,
      friction: 7,
      useNativeDriver: true
    }).start();
  }, [isDark]);

  const handleToggleTheme = () => {
    toggleTheme();
  };

  const handleCopyPhone = () => {
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleLogout = () => {
    Alert.alert(t('logout'), t('logout_confirm_msg'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        }
      }
    ]);
  };

  const handleSwitchToWorker = () => {
    setRoleMode('WORKER');
    router.push('/worker');
  };

  const handleHelpSupport = () => {
    Alert.alert(
      t('help_and_support'),
      t('help_support_msg'),
      [
        { text: t('close'), style: 'cancel' },
        { text: t('call'), onPress: () => {} }
      ]
    );
  };

  const getLangName = (code: string) => {
    if (code === 'am') return 'አማርኛ';
    if (code === 'om') return 'Afaan Oromoo';
    return 'English';
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          {/* Header Title Bar */}
          <View style={styles.topBar}>
            <View>
              <Text style={[styles.topTitle, { color: colors.textPrimary }]}>
                {t('profile')}
              </Text>
              <Text style={[styles.topSubtitle, { color: colors.textSecondary }]}>
                {t('account_settings_sub')}
              </Text>
            </View>

            {/* Quick Status Pill */}
            <View
              style={[
                styles.trustBadge,
                {
                  backgroundColor: isDark ? 'rgba(20, 184, 166, 0.15)' : '#F0FDFA',
                  borderColor: isDark ? 'rgba(20, 184, 166, 0.3)' : '#CCFBF1'
                }
              ]}
            >
              <ShieldCheck size={14} color={colors.primary} />
              <Text style={[styles.trustBadgeText, { color: colors.primary }]}>
                {user?.is_verified ? t('verified_member') : t('member')}
              </Text>
            </View>
          </View>

          {/* Hero Profile Card */}
          <View
            style={[
              styles.profileHeroCard,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border
              },
              colors.cardShadow
            ]}
          >
            {/* Glowing Accent Ring Background Effect */}
            <View
              style={[
                styles.heroGlow,
                {
                  backgroundColor: isDark ? colors.primaryGlow : 'rgba(13, 148, 136, 0.05)'
                }
              ]}
            />

            <View style={styles.heroMainRow}>
              <View style={styles.avatarWrapper}>
                <Avatar
                  name={user?.full_name}
                  imageUrl={user?.avatar_url}
                  size={76}
                  isVerified={user?.is_verified}
                />
                <View
                  style={[
                    styles.onlineDot,
                    {
                      borderColor: colors.surfaceCard,
                      backgroundColor: colors.success
                    }
                  ]}
                />
              </View>

              <View style={styles.heroDetails}>
                <View style={styles.nameRow}>
                  <Text style={[styles.userNameText, { color: colors.textPrimary }]} numberOfLines={1}>
                    {user?.full_name || t('member')}
                  </Text>
                  <Sparkles size={16} color={colors.accent} />
                </View>

                {/* Phone Pill */}
                <TouchableOpacity
                  style={[
                    styles.phonePill,
                    {
                      backgroundColor: isDark ? colors.surfaceSubtle : '#F8FAFC',
                      borderColor: colors.borderSubtle
                    }
                  ]}
                  activeOpacity={0.7}
                  onPress={handleCopyPhone}
                >
                  <Phone size={13} color={colors.textSecondary} />
                  <Text style={[styles.phonePillText, { color: colors.textSecondary }]}>
                    {user?.phone_number || '+251 9...'}
                  </Text>
                  {copiedPhone ? (
                    <Check size={12} color={colors.primary} />
                  ) : (
                    <Copy size={12} color={colors.textMuted} />
                  )}
                </TouchableOpacity>

                {/* Role Pill */}
                <View style={styles.roleContainer}>
                  <View
                    style={[
                      styles.roleBadge,
                      {
                        backgroundColor:
                          user?.role === 'WORKER'
                            ? isDark
                              ? 'rgba(245, 158, 11, 0.18)'
                              : '#FEF3C7'
                            : isDark
                            ? 'rgba(20, 184, 166, 0.18)'
                            : '#CCFBF1'
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleBadgeText,
                        {
                          color: user?.role === 'WORKER' ? colors.accent : colors.primary
                        }
                      ]}
                    >
                      {user?.role === 'WORKER' ? `⚡ ${t('worker')}` : `👤 ${t('client')}`}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Stats Bar */}
            <View
              style={[
                styles.statsRow,
                {
                  backgroundColor: isDark ? 'rgba(11, 15, 25, 0.65)' : '#F8FAFC',
                  borderColor: colors.borderSubtle
                }
              ]}
            >
              <View style={styles.statItem}>
                <View style={styles.statIconRow}>
                  <Briefcase size={14} color={colors.primary} />
                  <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                    {user?.role === 'WORKER' ? '34' : '8'}
                  </Text>
                </View>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {user?.role === 'WORKER' ? t('completed_jobs_stat') : t('requested_jobs_stat')}
                </Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

              <View style={styles.statItem}>
                <View style={styles.statIconRow}>
                  <Star size={14} color="#F59E0B" fill="#F59E0B" />
                  <Text style={[styles.statValue, { color: colors.textPrimary }]}>4.9</Text>
                </View>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {t('overall_rating')}
                </Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

              <View style={styles.statItem}>
                <View style={styles.statIconRow}>
                  <Award size={14} color={colors.primary} />
                  <Text style={[styles.statValue, { color: colors.textPrimary }]}>100%</Text>
                </View>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {t('job_satisfaction')}
                </Text>
              </View>
            </View>
          </View>

          {/* Section: Night Mode Hero Feature Card */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {t('appearance')}
            </Text>

            <TouchableOpacity
              style={[
                styles.nightModeCard,
                {
                  backgroundColor: colors.surfaceCard,
                  borderColor: isDark ? colors.primary : colors.border
                },
                colors.cardShadow
              ]}
              activeOpacity={0.85}
              onPress={handleToggleTheme}
            >
              <View style={styles.nightModeLeft}>
                <View
                  style={[
                    styles.nightModeIconCircle,
                    {
                      backgroundColor: isDark
                        ? 'rgba(245, 158, 11, 0.15)'
                        : 'rgba(13, 148, 136, 0.12)'
                    }
                  ]}
                >
                  {isDark ? (
                    <Moon size={22} color={colors.accent} fill={colors.accent} />
                  ) : (
                    <Sun size={22} color={colors.primary} />
                  )}
                </View>
                <View style={styles.nightModeTextWrapper}>
                  <View style={styles.nightModeTitleRow}>
                    <Text style={[styles.nightModeTitle, { color: colors.textPrimary }]}>
                      {isDark ? t('night_mode') : t('day_mode')}
                    </Text>
                    {isDark && (
                      <View style={styles.activePill}>
                        <Text style={styles.activePillText}>{t('on')}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.nightModeSubtitle, { color: colors.textSecondary }]}>
                    {isDark
                      ? t('night_mode_desc_on')
                      : t('night_mode_desc_off')}
                  </Text>
                </View>
              </View>

              {/* Custom Animated Toggle Switch Button */}
              <View
                style={[
                  styles.toggleTrack,
                  {
                    backgroundColor: isDark ? colors.primary : '#E2E8F0',
                    borderColor: isDark ? colors.primaryLight : '#CBD5E1'
                  }
                ]}
              >
                <Animated.View
                  style={[
                    styles.toggleThumb,
                    {
                      backgroundColor: '#FFFFFF',
                      transform: [{ translateX: switchTranslate }]
                    }
                  ]}
                >
                  {isDark ? (
                    <Moon size={12} color="#0F172A" fill="#0F172A" />
                  ) : (
                    <Sun size={12} color="#F59E0B" />
                  )}
                </Animated.View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Section: Worker Mode Switcher Banner */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {t('services_and_work')}
            </Text>

            <TouchableOpacity
              style={[
                styles.workerBannerCard,
                {
                  backgroundColor: isDark ? '#142834' : '#F0FDFA',
                  borderColor: isDark ? 'rgba(20, 184, 166, 0.3)' : '#CCFBF1'
                }
              ]}
              activeOpacity={0.85}
              onPress={handleSwitchToWorker}
            >
              <View
                style={[
                  styles.workerIconBubble,
                  { backgroundColor: isDark ? colors.primaryLight : '#0D9488' }
                ]}
              >
                <Briefcase size={22} color="#FFFFFF" />
              </View>

              <View style={styles.workerTextContent}>
                <View style={styles.workerBadgeRow}>
                  <Text style={[styles.workerBannerTitle, { color: colors.textPrimary }]}>
                    {t('worker_mode')}
                  </Text>
                  <View style={styles.earningBadge}>
                    <Zap size={11} color="#FFFFFF" />
                    <Text style={styles.earningBadgeText}>{t('earn_income')}</Text>
                  </View>
                </View>
                <Text style={[styles.workerBannerSub, { color: colors.textSecondary }]}>
                  {t('worker_banner_sub')}
                </Text>
              </View>

              <View
                style={[
                  styles.chevronCircle,
                  { backgroundColor: isDark ? colors.surfaceSubtle : '#FFFFFF' }
                ]}
              >
                <ChevronRight size={18} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Section: Preferences & Language Card */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {t('preferences')}
            </Text>

            <View
              style={[
                styles.menuCardGroup,
                {
                  backgroundColor: colors.surfaceCard,
                  borderColor: colors.border
                },
                colors.cardShadow
              ]}
            >
              {/* Language Selection Row */}
              <TouchableOpacity
                style={[styles.menuRowItem, { borderBottomColor: colors.borderSubtle }]}
                activeOpacity={0.7}
                onPress={() => router.push('/language')}
              >
                <View
                  style={[
                    styles.menuRowIcon,
                    {
                      backgroundColor: isDark
                        ? 'rgba(245, 158, 11, 0.15)'
                        : '#FEF3C7'
                    }
                  ]}
                >
                  <Globe size={18} color="#D97706" />
                </View>

                <View style={styles.menuRowText}>
                  <Text style={[styles.menuRowTitle, { color: colors.textPrimary }]}>
                    {t('select_language')}
                  </Text>
                  <Text style={[styles.menuRowSubtitle, { color: colors.textSecondary }]}>
                    {getLangName(language)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.langActiveChip,
                    {
                      backgroundColor: isDark ? colors.surfaceSubtle : '#F1F5F9',
                      borderColor: colors.border
                    }
                  ]}
                >
                  <Text style={[styles.langActiveText, { color: colors.primary }]}>
                    {getLangName(language)}
                  </Text>
                  <ChevronRight size={14} color={colors.textMuted} />
                </View>
              </TouchableOpacity>

              {/* Notification & Sounds Row */}
              <TouchableOpacity
                style={[styles.menuRowItem, { borderBottomColor: colors.borderSubtle }]}
                activeOpacity={0.7}
                onPress={() => router.push('/settings')}
              >
                <View
                  style={[
                    styles.menuRowIcon,
                    {
                      backgroundColor: isDark
                        ? 'rgba(14, 165, 233, 0.15)'
                        : '#E0F2FE'
                    }
                  ]}
                >
                  <Bell size={18} color="#0284C7" />
                </View>

                <View style={styles.menuRowText}>
                  <Text style={[styles.menuRowTitle, { color: colors.textPrimary }]}>
                    {t('notifications_title')}
                  </Text>
                  <Text style={[styles.menuRowSubtitle, { color: colors.textSecondary }]}>
                    {t('notifications_sub')}
                  </Text>
                </View>

                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>

              {/* Help & Support Center */}
              <TouchableOpacity
                style={styles.menuRowItem}
                activeOpacity={0.7}
                onPress={handleHelpSupport}
              >
                <View
                  style={[
                    styles.menuRowIcon,
                    {
                      backgroundColor: isDark
                        ? 'rgba(168, 85, 247, 0.15)'
                        : '#F3E8FF'
                    }
                  ]}
                >
                  <CircleHelp size={18} color="#9333EA" />
                </View>

                <View style={styles.menuRowText}>
                  <Text style={[styles.menuRowTitle, { color: colors.textPrimary }]}>
                    {t('help_and_support')}
                  </Text>
                  <Text style={[styles.menuRowSubtitle, { color: colors.textSecondary }]}>
                    {t('help_and_support_sub')}
                  </Text>
                </View>

                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Section: Logout Action Button */}
          <TouchableOpacity
            style={[
              styles.logoutButton,
              {
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEE2E2',
                borderColor: isDark ? 'rgba(239, 68, 68, 0.25)' : '#FECACA'
              }
            ]}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <LogOut size={19} color={colors.danger} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>
              {t('logout')}
            </Text>
          </TouchableOpacity>

          {/* Elegant Footer Details */}
          <View style={styles.footerContainer}>
            <Text style={[styles.brandFooterText, { color: colors.textMuted }]}>
              {t('app_name')} • {t('addis_ababa')}
            </Text>
            <Text style={[styles.versionFooterText, { color: colors.textMuted }]}>
              {t('version')} 1.0.0 • {t('tagline')}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 40
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18
  },
  topTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  topSubtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500'
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1
  },
  trustBadgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  profileHeroCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden'
  },
  heroGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 70
  },
  heroMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  avatarWrapper: {
    position: 'relative'
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2
  },
  heroDetails: {
    flex: 1,
    gap: 6
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  userNameText: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.2
  },
  phonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-start'
  },
  phonePillText: {
    fontSize: 13,
    fontWeight: '600'
  },
  roleContainer: {
    flexDirection: 'row',
    marginTop: 2
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '800'
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1
  },
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800'
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2
  },
  statDivider: {
    width: 1,
    height: 24
  },
  sectionContainer: {
    marginTop: 22
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingLeft: 4
  },
  nightModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1
  },
  nightModeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1
  },
  nightModeIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center'
  },
  nightModeTextWrapper: {
    flex: 1
  },
  nightModeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  nightModeTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  activePill: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  activePillText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '800'
  },
  nightModeSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500'
  },
  toggleTrack: {
    width: 58,
    height: 32,
    borderRadius: 16,
    padding: 3,
    borderWidth: 1,
    justifyContent: 'center'
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3
  },
  workerBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14
  },
  workerIconBubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center'
  },
  workerTextContent: {
    flex: 1
  },
  workerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  workerBannerTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  earningBadge: {
    backgroundColor: '#0D9488',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6
  },
  earningBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  workerBannerSub: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500'
  },
  chevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuCardGroup: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden'
  },
  menuRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
    borderBottomWidth: 1
  },
  menuRowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuRowText: {
    flex: 1
  },
  menuRowTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  menuRowSubtitle: {
    fontSize: 12,
    marginTop: 2
  },
  langActiveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1
  },
  langActiveText: {
    fontSize: 12,
    fontWeight: '700'
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 26,
    borderWidth: 1
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '800'
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 26,
    gap: 4
  },
  brandFooterText: {
    fontSize: 12,
    fontWeight: '600'
  },
  versionFooterText: {
    fontSize: 11,
    fontWeight: '500'
  }
});
