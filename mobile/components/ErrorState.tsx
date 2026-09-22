import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Button } from './Button.js';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorState({ message, onRetry, retryText = 'እንደገና ሞክር' }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <AlertCircle size={32} color="#DC2626" />
      </View>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button
          title={retryText}
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
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  message: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '500'
  }
});
