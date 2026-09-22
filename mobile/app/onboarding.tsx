import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Mic, MapPin, ShieldCheck } from 'lucide-react-native';
import { Button } from '../components/Button.js';
import { useTranslation } from '../utils/i18n.js';

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.heroSection}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoGlyph}>ስራ</Text>
        </View>
        <Text style={styles.headline}>ስራLink</Text>
        <Text style={styles.subheadline}>{t('tagline')}</Text>
      </View>

      {/* Feature Highlights */}
      <View style={styles.featuresList}>
        <View style={styles.featureItem}>
          <View style={[styles.iconBox, { backgroundColor: '#F0FDFA' }]}>
            <Mic size={24} color="#0F766E" />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>{t('record_voice')}</Text>
            <Text style={styles.featureDesc}>
              በአማርኛ፣ በአፋን ኦሮሞ ወይም በእንግሊዝኛ የሚፈልጉትን ስራ በድምጽዎ ይናገሩ
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
            <MapPin size={24} color="#D97706" />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>{t('nearby_workers')}</Text>
            <Text style={styles.featureDesc}>
              በአቅራቢያዎ ያሉ ቧንቧ፣ ኤሌክትሪክና ሌሎች ባለሙያዎችን በካርታ በቀላሉ ያግኙ
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
            <ShieldCheck size={24} color="#0284C7" />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>ግልጽ ዋጋና አስተማማኝ አገልግሎት</Text>
            <Text style={styles.featureDesc}>
              የተረጋገጡ ባለሙያዎች፣ በብር የተተመነ ዋጋና የተጠቃሚዎች ግምገማ
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={t('login')}
          onPress={() => router.push('/login')}
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    justifyContent: 'space-between'
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 40
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  logoGlyph: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  headline: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0F172A'
  },
  subheadline: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20
  },
  featuresList: {
    gap: 20
  },
  featureItem: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center'
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  featureText: {
    flex: 1
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3
  },
  featureDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18
  },
  footer: {
    marginBottom: 16
  }
});
