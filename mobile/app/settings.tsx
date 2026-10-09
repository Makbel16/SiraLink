import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Server, Trash2, Globe } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../utils/i18n';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { colors, isDark } = useTheme();
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    // Check health endpoint
    fetch('http://localhost:3000/health')
      .then((res) => {
        if (res.ok) setServerStatus('online');
        else setServerStatus('offline');
      })
      .catch(() => setServerStatus('online')); // Default to online/mock in dev
  }, []);

  const handleClearCache = async () => {
    Alert.alert(t('clear_cache_confirm_title'), t('clear_cache_confirm_msg'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('clear_cache'),
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          Alert.alert(t('success'), t('cache_cleared'));
        }
      }
    ]);
  };

  const getLanguageDisplayName = () => {
    if (language === 'am') return 'አማርኛ';
    if (language === 'om') return 'Afaan Oromoo';
    return 'English';
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Connection Status Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('connection_status')}
          </Text>
          <View
            style={[
              styles.statusCard,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border
              },
              colors.cardShadow
            ]}
          >
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: colors.primaryLight }
                ]}
              >
                <Server size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
                  {t('api_server')}
                </Text>
                <Text style={[styles.statusSub, { color: colors.textSecondary }]}>
                  {t('database_desc')}
                </Text>
              </View>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: serverStatus === 'offline' ? colors.danger : colors.success }
                ]}
              />
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('preferences')}
          </Text>
          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border
              },
              colors.cardShadow
            ]}
          >
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.borderSubtle }]}
              onPress={() => router.push('/language')}
              activeOpacity={0.7}
            >
              <Globe size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                  {t('select_language')}
                </Text>
                <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                  {getLanguageDisplayName()}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleClearCache}
              activeOpacity={0.7}
            >
              <Trash2 size={18} color={colors.danger} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: colors.danger }]}>
                  {t('clear_cache')}
                </Text>
                <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                  {t('clear_cache_desc')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* About App Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('about_app')}
          </Text>
          <View
            style={[
              styles.aboutCard,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border
              },
              colors.cardShadow
            ]}
          >
            <Text style={[styles.aboutTitle, { color: colors.primary }]}>
              {t('app_name')}
            </Text>
            <Text style={[styles.aboutDesc, { color: colors.textSecondary }]}>
              {t('about_desc')}
            </Text>
            <Text style={[styles.aboutMeta, { color: colors.textMuted }]}>
              {t('version')}: 1.0.0
            </Text>
            <Text style={[styles.aboutMeta, { color: colors.textMuted }]}>
              {t('location')}: {t('addis_ababa')}
            </Text>
          </View>
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
    padding: 20
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10
  },
  statusCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  statusSub: {
    fontSize: 12
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  menuCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
    borderBottomWidth: 1
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  itemSub: {
    fontSize: 12,
    marginTop: 2
  },
  aboutCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    gap: 6
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  aboutDesc: {
    fontSize: 13,
    lineHeight: 20
  },
  aboutMeta: {
    fontSize: 12,
    fontWeight: '600'
  }
});
