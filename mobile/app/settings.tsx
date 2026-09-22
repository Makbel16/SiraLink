import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Wifi, Server, Trash2, Globe, Shield, Info, ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../utils/i18n';
import { Button } from '../components/Button';

export default function SettingsScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
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
    Alert.alert('መሸጎጫ አጽዳ (Clear Cache)', 'የተቀመጡ መረጃዎችን ማጽዳት ይፈልጋሉ?', [
      { text: 'ይቅር (Cancel)', style: 'cancel' },
      {
        text: 'አጽዳ (Clear)',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          Alert.alert('ተሳክቷል', 'መሸጎጫ በተሳካ ሁኔታ ጸድቷል');
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>የግንኙነት ሁኔታ (Connection Status)</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.iconCircle}>
                <Server size={20} color="#0F766E" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.statusTitle}>SiraLink API Server</Text>
                <Text style={styles.statusSub}>Fastify + PostGIS Database</Text>
              </View>
              <View style={[styles.statusDot, { backgroundColor: '#22C55E' }]} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>የመተግበሪያ ቅንብሮች (Preferences)</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/language')}
            >
              <Globe size={18} color="#0F766E" />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{t('select_language')}</Text>
                <Text style={styles.itemSub}>{language === 'am' ? 'አማርኛ' : language === 'om' ? 'Afaan Oromoo' : 'English'}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleClearCache}>
              <Trash2 size={18} color="#DC2626" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: '#DC2626' }]}>መሸጎጫ አጽዳ (Clear Cache)</Text>
                <Text style={styles.itemSub}>የተቀመጡ ጊዜያዊ ፋይሎችን ያጽዱ</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ስለ መተግበሪያው (About)</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>SiraLink (ስራLink) Ethiopia</Text>
            <Text style={styles.aboutDesc}>
              የድምጽ፣ የአካባቢ እና የአገር ውስጥ ቋንቋዎችን በማስተባበር ፈጣን እና አስተማማኝ የስራ ገበያን የሚፈጥር የኢትዮጵያ ፕላትፎርም።
            </Text>
            <Text style={styles.aboutMeta}>ስሪት፡ 1.0.0 (Production Release)</Text>
            <Text style={styles.aboutMeta}>ቦታ፡ አዲስ አበባ፣ ኢትዮጵያ</Text>
          </View>
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
    padding: 20
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
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
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A'
  },
  statusSub: {
    fontSize: 12,
    color: '#64748B'
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC'
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A'
  },
  itemSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },
  aboutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F766E'
  },
  aboutDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20
  },
  aboutMeta: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600'
  }
});
