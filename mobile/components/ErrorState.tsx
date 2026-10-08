import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Button } from './Button';
import { useTranslation } from '../utils/i18n';
import { useTheme } from '../context/ThemeContext';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorState({ message, onRetry, retryText }: ErrorStateProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: colors.dangerLight }]}>
        <AlertCircle size={32} color={colors.danger} />
      </View>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      {onRetry && (
        <Button
          title={retryText || t('retry')}
          onPress={onRetry}
          variant="outline"
          size="sm"
          style={{ marginTop: 8 }}
        />
      )}
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
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center'
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500'
  }
});
