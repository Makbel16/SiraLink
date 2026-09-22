import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Globe, Briefcase, Settings as SettingsIcon, LogOut, ChevronRight, Phone, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext.js';
import { useTranslation } from '../../utils/i18n.js';
import { Avatar } from '../../components/Avatar.js';

export default function ProfileTabScreen() {
  const router = useRouter();
  const { user, logout, setRoleMode } = useAuth();
  const { t, language } = useTranslation();

  const handleLogout = () => {
    Alert.alert('ውጣ (Log Out)', 'እርግጠኛ ነዎት ከስራLink መውጣት ይፈልጋሉ?', [
      { text: 'ይቅር (Cancel)', style: 'cancel' },
      {
        text: 'ውጣ (Logout)',
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

  const getLangName = (code: string) => {
    if (code === 'am') return 'አማርኛ';
    if (code === 'om') return 'Afaan Oromoo';
    return 'English';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Avatar
            name={user?.full_name}
            imageUrl={user?.avatar_url}
            size={72}
            isVerified={user?.is_verified}
          />

          <View style={styles.profileDetails}>
            <Text style={styles.nameText}>{user?.full_name || 'የስራLink ተጠቃሚ'}</Text>
            <View style={styles.phoneRow}>
              <Phone size={14} color="#64748B" />
              <Text style={styles.phoneText}>{user?.phone_number || '+251 9...'}</Text>
            </View>

            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {user?.role === 'WORKER' ? t('worker') : t('client')}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Menu */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={handleSwitchToWorker}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#F0FDFA' }]}>
              <Briefcase size={20} color="#0F766E" />
            </View>
            <View style={styles.menuTextContent}>
              <Text style={styles.menuItemTitle}>{t('worker_mode')}</Text>
              <Text style={styles.menuItemSub}>ወደ ባለሙያ ገጽ ይቀይሩ ወይም ስራ ይቀበሉ</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/language')}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Globe size={20} color="#D97706" />
            </View>
            <View style={styles.menuTextContent}>
              <Text style={styles.menuItemTitle}>{t('select_language')}</Text>
              <Text style={styles.menuItemSub}>{getLangName(language)}</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/settings')}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#E0F2FE' }]}>
              <SettingsIcon size={20} color="#0284C7" />
            </View>
            <View style={styles.menuTextContent}>
              <Text style={styles.menuItemTitle}>{t('settings')}</Text>
              <Text style={styles.menuItemSub}>የመተግበሪያ እና የግንኙነት ሁኔታ</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8} onPress={handleLogout}>
          <LogOut size={18} color="#DC2626" />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>

        {/* Version info */}
        <Text style={styles.versionText}>SiraLink v1.0.0 — Addis Ababa, Ethiopia</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  scrollContent: {
    padding: 20
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  profileDetails: {
    flex: 1,
    gap: 4
  },
  nameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A'
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  phoneText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600'
  },
  roleBadge: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E'
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC'
  },
  menuIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuTextContent: {
    flex: 1
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2
  },
  menuItemSub: {
    fontSize: 12,
    color: '#64748B'
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 24
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626'
  },
  versionText: {
    marginTop: 24,
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center'
  }
});
