import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Users, ArrowUpRight } from 'lucide-react-native';
import { JobCategory } from '../types/index';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../utils/i18n';

export interface CategoryItemData {
  key?: JobCategory;
  label: string;
  enLabel: string;
  emoji: string;
  workerCount: number;
  startingPrice: number | string;
  tag?: string;
  tagKey?: string;
  gradient?: [string, string];
  darkGradient?: [string, string];
}

interface CategoryCardProps {
  item: CategoryItemData;
  isSelected: boolean;
  onPress: () => void;
}

export function CategoryCard({ item, isSelected, onPress }: CategoryCardProps) {
  const { colors, isDark } = useTheme();
  const { t, language } = useTranslation();

  // Dynamic localized text
  const displayTitle = item.key
    ? t(`cat_${item.key.toLowerCase()}`, language === 'en' ? item.enLabel : item.label)
    : t('all_services');

  const displayTag = item.tagKey
    ? t(item.tagKey, item.tag)
    : item.tag;

  const displayWorkers = `${item.workerCount}+ ${t('pros_suffix')}`;

  const displayPrice = typeof item.startingPrice === 'number'
    ? `${t('from_price')} ${item.startingPrice} ${t('etb')}`
    : item.startingPrice;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.cardContainer,
        {
          backgroundColor: isSelected
            ? (isDark ? 'rgba(59, 130, 246, 0.16)' : '#EFF6FF')
            : colors.surfaceCard,
          borderColor: isSelected ? colors.primary : colors.border
        },
        colors.cardShadow
      ]}
    >
      {/* Top Tag or Spacer */}
      <View style={styles.topRow}>
        {displayTag ? (
          <View
            style={[
              styles.tagPill,
              {
                backgroundColor: isSelected
                  ? colors.primary
                  : (isDark ? colors.surfaceSubtle : '#F1F5F9')
              }
            ]}
          >
            <Text
              style={[
                styles.tagText,
                { color: isSelected ? '#FFFFFF' : colors.textSecondary }
              ]}
              numberOfLines={1}
            >
              {displayTag}
            </Text>
          </View>
        ) : (
          <View style={{ height: 20 }} />
        )}
      </View>

      {/* Modern Flat Icon Badge */}
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.iconBadge,
            {
              backgroundColor: isSelected
                ? (isDark ? 'rgba(59, 130, 246, 0.25)' : '#DBEAFE')
                : colors.surfaceSubtle
            }
          ]}
        >
          <Text style={styles.emojiText}>{item.emoji}</Text>
        </View>
      </View>

      {/* Category Title */}
      <View style={styles.titleSection}>
        <Text
          style={[
            styles.categoryTitle,
            {
              color: isSelected ? colors.primary : colors.textPrimary
            }
          ]}
          numberOfLines={1}
        >
          {displayTitle}
        </Text>
      </View>

      {/* Footer Info */}
      <View
        style={[
          styles.cardFooter,
          {
            borderTopColor: colors.borderSubtle
          }
        ]}
      >
        <View style={styles.workerCountRow}>
          <Users size={11} color={colors.textSecondary} />
          <Text style={[styles.workerCountText, { color: colors.textSecondary }]}>
            {displayWorkers}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.priceText, { color: colors.primary }]}>
            {displayPrice}
          </Text>
          <ArrowUpRight size={11} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Backward-compatible alias
export const CategoryCard3D = CategoryCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: 150,
    height: 180,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 12,
    justifyContent: 'space-between'
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 22
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700'
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 4
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emojiText: {
    fontSize: 26
  },
  titleSection: {
    alignItems: 'center',
    marginVertical: 2
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.2
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
    gap: 4
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
    fontWeight: '700'
  }
});
