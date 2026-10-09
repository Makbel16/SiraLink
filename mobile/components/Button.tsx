import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon
}: ButtonProps) {
  const { colors, isDark } = useTheme();

  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return [
          styles.secondaryContainer,
          { backgroundColor: isDark ? colors.surfaceSubtle : '#F1F5F9' }
        ];
      case 'danger':
        return [
          styles.dangerContainer,
          { backgroundColor: colors.danger }
        ];
      case 'outline':
        return [
          styles.outlineContainer,
          { borderColor: colors.primary }
        ];
      default:
        return [
          styles.primaryContainer,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.primary
          }
        ];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return [
          styles.secondaryText,
          { color: colors.textPrimary }
        ];
      case 'outline':
        return [
          styles.outlineText,
          { color: colors.primary }
        ];
      case 'danger':
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 14, minHeight: 38, borderRadius: 10 };
      case 'lg':
        return { paddingVertical: 16, paddingHorizontal: 28, minHeight: 56, borderRadius: 16 };
      default:
        return { paddingVertical: 13, paddingHorizontal: 20, minHeight: 48, borderRadius: 14 };
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.baseContainer,
        getContainerStyle(),
        getSizeStyle(),
        (disabled || loading) && styles.disabled,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'secondary' ? colors.textPrimary : '#FFFFFF'} />
      ) : (
        <>
          {icon}
          <Text style={[styles.baseText, getTextStyle(), size === 'lg' && styles.lgText, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseContainer: {
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  primaryContainer: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3
  },
  secondaryContainer: {
    backgroundColor: '#F1F5F9'
  },
  dangerContainer: {
    backgroundColor: '#DC2626'
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5
  },
  baseText: {
    fontSize: 15,
    fontWeight: '700'
  },
  primaryText: {
    color: '#FFFFFF'
  },
  secondaryText: {
    color: '#1E293B'
  },
  outlineText: {},
  lgText: {
    fontSize: 17
  },
  disabled: {
    opacity: 0.55
  }
});
