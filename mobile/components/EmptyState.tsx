import { View, Text, StyleSheet } from 'react-native';
import { PackageOpen } from 'lucide-react-native';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        {icon || <PackageOpen size={36} color="#94A3B8" />}
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center'
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center'
  }
});
