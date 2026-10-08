import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTranslation } from '../utils/i18n';
import { useTheme } from '../context/ThemeContext';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        {message || t('loading')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },
  text: {
    fontSize: 15,
    fontWeight: '500'
  }
});
