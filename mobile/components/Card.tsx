import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'flat';
}

export function Card({ children, style, variant = 'elevated' }: CardProps) {
  const { colors, isDark } = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case 'outlined':
        return [styles.outlined, { borderColor: colors.border, backgroundColor: colors.surfaceCard }];
      case 'flat':
        return [styles.flat, { backgroundColor: isDark ? colors.surfaceSubtle : '#F8FAFC' }];
      default:
        return [styles.elevated, { backgroundColor: colors.surfaceCard }, colors.cardShadow];
    }
  };

  return <View style={[styles.card, getVariantStyle(), style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16
  },
  elevated: {},
  outlined: {
    borderWidth: 1
  },
  flat: {}
});
