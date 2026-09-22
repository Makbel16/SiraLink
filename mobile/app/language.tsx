import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useTranslation } from '../utils/i18n';
import { Button } from '../components/Button';
import { SupportedLanguage } from '../types/index';

export default function LanguageScreen() {
  const router = useRouter();
  const { language, setLanguage, t } = useTranslation();

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('select_language')}</Text>
        <Text style={styles.subtitle}>Choose your preferred language for SiraLink</Text>
      </View>

      <View style={styles.optionsList}>
        {languages.map((lang) => {
          const isSelected = language === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              activeOpacity={0.85}
              onPress={() => handleSelect(lang.code)}
              style={[styles.langCard, isSelected && styles.langCardSelected]}
            >
              <View>
                <Text style={[styles.langLabel, isSelected && styles.langLabelSelected]}>
                  {lang.label}
                </Text>
                <Text style={styles.langSub}>{lang.sub}</Text>
              </View>

              {isSelected && (
                <View style={styles.checkCircle}>
                  <Check size={18} color="#FFFFFF" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button
          title={language === 'am' ? 'ቀጥል' : language === 'om' ? 'Itti Fufi' : 'Continue'}
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
