import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Users, ArrowUpRight } from 'lucide-react-native';
import { JobCategory } from '../types/index';
import { useTheme } from '../context/ThemeContext';

export interface CategoryItemData {
  key?: JobCategory;
  label: string;
  enLabel: string;
  emoji: string;
  workerCount: number;
  startingPrice: string;
  tag?: string;
  gradient: [string, string];
  darkGradient: [string, string];
}

interface CategoryCard3DProps {
  item: CategoryItemData;
  isSelected: boolean;
  onPress: () => void;
}

export function CategoryCard3D({ item, isSelected, onPress }: CategoryCard3DProps) {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      tension: 100,
      friction: 6,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 80,
      friction: 5,
      useNativeDriver: true
    }).start();
  };

  const activeGradient = isDark ? item.darkGradient : item.gradient;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.cardContainer,
          {
            borderColor: isSelected
              ? colors.primary
              : isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.06)'
          },
          isSelected && styles.cardSelectedGlow
        ]}
      >
        <LinearGradient
          colors={activeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientSurface}
        >
          {/* Top Tag or Selection Status */}
          <View style={styles.topRow}>
            {item.tag ? (
              <View
                style={[
                  styles.tagPill,
                  {
                    backgroundColor: isDark
                      ? 'rgba(0, 0, 0, 0.45)'
                      : 'rgba(255, 255, 255, 0.75)'
                  }
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: isDark ? '#FCD34D' : '#D97706' }
                  ]}
                >
                  {item.tag}
                </Text>
              </View>
            ) : (
              <View style={{ flex: 1 }} />
            )}

            {isSelected && (
              <View
                style={[
                  styles.selectedCheck,
                  { backgroundColor: colors.primary }
                ]}
              >
                <Sparkles size={11} color="#FFFFFF" />
              </View>
            )}
          </View>

          {/* 3D Floating Emoji Icon Container */}
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconBubble,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'rgba(255, 255, 255, 0.9)',
                  shadowColor: isDark ? '#000000' : colors.primary
                }
              ]}
            >
              <Text style={styles.emojiText}>{item.emoji}</Text>
            </View>
          </View>

          {/* Titles */}
          <View style={styles.titleSection}>
            <Text
              style={[
                styles.categoryTitle,
                { color: colors.textPrimary }
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
            <Text
              style={[
                styles.categoryEnTitle,
                { color: colors.textSecondary }
              ]}
              numberOfLines={1}
            >
              {item.enLabel}
            </Text>
          </View>

          {/* Bottom Card Footer Details */}
          <View
            style={[
              styles.cardFooter,
              {
                borderTopColor: isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.06)'
              }
            ]}
          >
            <View style={styles.workerCountRow}>
              <Users size={11} color={colors.textSecondary} />
              <Text
                style={[
                  styles.workerCountText,
                  { color: colors.textSecondary }
                ]}
              >
                {item.workerCount}+ ባለሙያ
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text
                style={[
                  styles.priceText,
                  { color: colors.primary }
                ]}
              >
                {item.startingPrice}
              </Text>
              <ArrowUpRight size={11} color={colors.primary} />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 154,
    height: 198,
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5
  },
  cardSelectedGlow: {
    borderWidth: 2,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8
  },
  gradientSurface: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between'
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 22
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800'
  },
  selectedCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 4
  },
  iconBubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4
  },
  emojiText: {
    fontSize: 28
  },
  titleSection: {
    alignItems: 'center',
    marginVertical: 2
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.2
  },
  categoryEnTitle: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 1
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1
  },
  workerCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  workerCountText: {
    fontSize: 10,
    fontWeight: '600'
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  priceText: {
    fontSize: 11,
    fontWeight: '800'
  }
});
