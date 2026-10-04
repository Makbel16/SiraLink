import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, MapPin, ShieldCheck, Zap, ArrowRight, Check } from 'lucide-react-native';
import { NearbyWorker } from '../types/index';
import { Avatar } from './Avatar';
import { useTheme } from '../context/ThemeContext';

interface FeaturedWorkerCard3DProps {
  worker: NearbyWorker;
  onRequest: (worker: NearbyWorker) => void;
  onPressDetails: (worker: NearbyWorker) => void;
}

export function FeaturedWorkerCard3D({
  worker,
  onRequest,
  onPressDetails
}: FeaturedWorkerCard3DProps) {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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

  const gradientColors: [string, string] = isDark
    ? ['#162036', '#0F172A']
    : ['#FFFFFF', '#F0FDFA'];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPressDetails(worker)}
        style={[
          styles.container,
          {
            borderColor: isDark
              ? 'rgba(20, 184, 166, 0.3)'
              : 'rgba(13, 148, 136, 0.2)'
          },
          colors.cardShadow
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Top Row: Avatar + Status + Rating */}
          <View style={styles.topRow}>
            <View style={styles.avatarWrap}>
              <Avatar
                name={worker.full_name}
                imageUrl={worker.avatar_url}
                size={52}
                isVerified={true}
              />
              <View
                style={[
                  styles.onlineBadge,
                  { backgroundColor: worker.is_available ? colors.success : colors.textMuted }
                ]}
              />
            </View>

            <View style={styles.topRightInfo}>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.verifiedTag,
                    {
                      backgroundColor: isDark
                        ? 'rgba(20, 184, 166, 0.2)'
                        : 'rgba(13, 148, 136, 0.12)'
                    }
                  ]}
                >
                  <ShieldCheck size={12} color={colors.primary} />
                  <Text style={[styles.verifiedTagText, { color: colors.primary }]}>
                    የታመነ
                  </Text>
                </View>

                <View style={styles.ratingPill}>
                  <Star size={12} color="#F59E0B" fill="#F59E0B" />
                  <Text style={[styles.ratingText, { color: colors.textPrimary }]}>
                    {Number(worker.rating_avg).toFixed(1)}
                  </Text>
                </View>
              </View>

              <Text
                style={[styles.workerName, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {worker.full_name}
              </Text>
              <Text
                style={[styles.categorySubtitle, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {worker.skill_category}
              </Text>
            </View>
          </View>

          {/* Middle Distance Row */}
          <View style={styles.middleRow}>
            <View style={styles.distanceBox}>
              <MapPin size={12} color={colors.textSecondary} />
              <Text style={[styles.distanceText, { color: colors.textSecondary }]}>
                {worker.distance_km} km ርቀት
              </Text>
            </View>

            <View style={styles.rateBox}>
              <Text style={[styles.rateValue, { color: colors.primary }]}>
                {worker.hourly_rate_etb || 450} ETB
              </Text>
              <Text style={[styles.rateUnit, { color: colors.textMuted }]}>/ሰዓት</Text>
            </View>
          </View>

          {/* Quick Action Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.primary }
            ]}
            activeOpacity={0.8}
            onPress={() => onRequest(worker)}
          >
            <Zap size={14} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>አሁን ጥሩ (Request)</Text>
            <ArrowRight size={13} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 250,
    height: 185,
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden'
  },
  gradient: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between'
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  avatarWrap: {
    position: 'relative'
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  topRightInfo: {
    flex: 1,
    gap: 2
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: '800'
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800'
  },
  workerName: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2
  },
  categorySubtitle: {
    fontSize: 12,
    fontWeight: '600'
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  distanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600'
  },
  rateBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2
  },
  rateValue: {
    fontSize: 15,
    fontWeight: '900'
  },
  rateUnit: {
    fontSize: 11
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 14,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  }
});
