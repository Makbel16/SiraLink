import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useTranslation } from '../utils/i18n';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/Button';
import { SupportedLanguage } from '../types/index';

export default function LanguageScreen() {
  const router = useRouter();
  const { language, setLanguage, t } = useTranslation();
  const { colors, isDark } = useTheme();

  const languages: { code: SupportedLanguage; label: string; sub: string }[] = [
    { code: 'am', label: 'አማርኛ', sub: 'Amharic' },
    { code: 'om', label: 'Afaan Oromoo', sub: 'Oromo' },
    { code: 'en', label: 'English', sub: 'English' }
  ];

  const handleSelect = async (code: SupportedLanguage) => {
    await setLanguage(code);
  };

  const handleContinue = () => {
    router.push('/onboarding');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('select_language')}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('choose_language_sub')}</Text>
      </View>

      <View style={styles.optionsList}>
        {languages.map((lang) => {
          const isSelected = language === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              activeOpacity={0.85}
              onPress={() => handleSelect(lang.code)}
              style={[
                styles.langCard,
                {
                  backgroundColor: isSelected ? (isDark ? 'rgba(20, 184, 166, 0.15)' : '#F0FDFA') : colors.surfaceCard,
                  borderColor: isSelected ? colors.primary : colors.border
                }
              ]}
            >
              <View>
                <Text
                  style={[
                    styles.langLabel,
                    { color: isSelected ? colors.primary : colors.textPrimary }
                  ]}
                >
                  {lang.label}
                </Text>
                <Text style={[styles.langSub, { color: colors.textSecondary }]}>{lang.sub}</Text>
              </View>

              {isSelected && (
                <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                  <Check size={18} color="#FFFFFF" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button
          title={t('continue')}
          onPress={handleContinue}
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 24,
    justifyContent: 'space-between'
  },
  header: {
    marginTop: 20
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B'
  },
  optionsList: {
    gap: 14
  },
  langCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  langCardSelected: {
    borderColor: '#0F766E',
    backgroundColor: '#F0FDFA'
  },
  langLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A'
  },
  langLabelSelected: {
    color: '#0F766E'
  },
  langSub: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center'
  },
  footer: {
    marginBottom: 16
  }
});
