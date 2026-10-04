import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MapPin, Navigation, List, Map as MapIcon, User, Star } from 'lucide-react-native';
import { NearbyWorker } from '../types/index';
import { useTranslation } from '../utils/i18n';
import { useTheme } from '../context/ThemeContext';
import { WorkerCard } from './WorkerCard';

interface MapViewProps {
  userLocation: { latitude: number; longitude: number; district?: string };
  workers: NearbyWorker[];
  onSelectWorker: (worker: NearbyWorker) => void;
  onRequestWorker: (worker: NearbyWorker) => void;
}

export function MapView({
  userLocation,
  workers,
  onSelectWorker,
  onRequestWorker
}: MapViewProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedWorker, setSelectedWorker] = useState<NearbyWorker | null>(null);

  // Approximate Addis Ababa boundary box for spatial visual representation
  const centerLat = userLocation.latitude;
  const centerLng = userLocation.longitude;

  return (
    <View style={styles.container}>
      {/* Toggle View Header */}
      <View
        style={[
          styles.toggleBar,
          {
            backgroundColor: colors.surfaceCard,
            borderBottomColor: colors.border
          }
        ]}
      >
        <View style={styles.locationTag}>
          <MapPin size={15} color={colors.primary} />
          <Text style={[styles.locationText, { color: colors.textPrimary }]} numberOfLines={1}>
            {userLocation.district || t('addis_ababa')}
          </Text>
        </View>

        <View
          style={[
            styles.segmentedToggle,
            { backgroundColor: isDark ? colors.surfaceSubtle : '#F1F5F9' }
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setViewMode('map')}
            style={[
              styles.segmentBtn,
              viewMode === 'map' && [
                styles.segmentBtnActive,
                { backgroundColor: colors.surface, shadowColor: colors.textPrimary }
              ]
            ]}
          >
            <MapIcon size={14} color={viewMode === 'map' ? colors.primary : colors.textMuted} />
            <Text
              style={[
                styles.segmentText,
                { color: viewMode === 'map' ? colors.primary : colors.textMuted }
              ]}
            >
              ካርታ (Map)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setViewMode('list')}
            style={[
              styles.segmentBtn,
              viewMode === 'list' && [
                styles.segmentBtnActive,
                { backgroundColor: colors.surface, shadowColor: colors.textPrimary }
              ]
            ]}
          >
            <List size={14} color={viewMode === 'list' ? colors.primary : colors.textMuted} />
            <Text
              style={[
                styles.segmentText,
                { color: viewMode === 'list' ? colors.primary : colors.textMuted }
              ]}
            >
              ዝርዝር ({workers.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map View Canvas */}
      {viewMode === 'map' ? (
        <View
          style={[
            styles.mapCanvas,
            {
              backgroundColor: isDark ? '#080D1A' : '#E6F4F1'
            }
          ]}
        >
          {/* Visual Grid Lines */}
          <View
            style={[
              styles.gridLineHorizontal,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,118,110,0.1)' }
            ]}
          />
          <View
            style={[
              styles.gridLineVertical,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,118,110,0.1)' }
            ]}
          />

          {/* User Location Radar Center */}
          <View style={styles.userRadar}>
            <View
              style={[
                styles.radarPulse,
                {
                  borderColor: isDark ? colors.primary : 'rgba(15,118,110,0.25)',
                  backgroundColor: isDark ? 'rgba(20,184,166,0.12)' : 'rgba(15,118,110,0.08)'
                }
              ]}
            />
            <View
              style={[
                styles.userPin,
                { backgroundColor: colors.primary }
              ]}
            >
              <Navigation size={17} color="#FFFFFF" />
            </View>
            <Text style={[styles.userPinLabel, { color: colors.textSecondary }]}>እርስዎ (You)</Text>
          </View>

          {/* Spatial Worker Markers Placed Relatively */}
          {workers.slice(0, 10).map((w, index) => {
            const dLat = (w.latitude - centerLat) * 3500;
            const dLng = (w.longitude - centerLng) * 3500;
            const clampX = Math.max(-120, Math.min(120, dLng));
            const clampY = Math.max(-100, Math.min(100, -dLat));

            const isSelected = selectedWorker?.id === w.id;

            return (
              <TouchableOpacity
                key={w.id || index}
                activeOpacity={0.8}
                onPress={() => setSelectedWorker(w)}
                style={[
                  styles.workerMarker,
                  {
                    transform: [{ translateX: clampX }, { translateY: clampY }]
                  },
                  isSelected && styles.workerMarkerSelected
                ]}
              >
                <View
                  style={[
                    styles.markerIconCircle,
                    {
                      backgroundColor: isDark ? colors.surfaceCard : '#FFFFFF',
                      borderColor: isSelected ? colors.accent : colors.primary
                    },
                    isSelected && styles.markerIconSelected
                  ]}
                >
                  <Text style={styles.markerCategoryEmoji}>
                    {w.skill_category === 'PLUMBING'
                      ? '🔧'
                      : w.skill_category === 'ELECTRICAL'
                      ? '⚡'
                      : w.skill_category === 'CARPENTRY'
                      ? '🪚'
                      : w.skill_category === 'PAINTING'
                      ? '🎨'
                      : w.skill_category === 'CLEANING'
                      ? '🧹'
                      : w.skill_category === 'MECHANIC'
                      ? '🚗'
                      : '🛠️'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.markerBadge,
                    {
                      backgroundColor: isDark ? colors.surfaceSubtle : '#0F172A'
                    }
                  ]}
                >
                  <Text style={styles.markerBadgeText}>{w.distance_km}km</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Selected Worker Floating Quick Card */}
          {selectedWorker && (
            <View style={styles.quickCardWrapper}>
              <WorkerCard
                worker={selectedWorker}
                onRequest={onRequestWorker}
                onPressDetails={onSelectWorker}
              />
            </View>
          )}
        </View>
      ) : (
        /* List Fallback View */
        <ScrollView
          contentContainerStyle={[
            styles.listContainer,
            { backgroundColor: colors.background }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {workers.map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              onRequest={onRequestWorker}
              onPressDetails={onSelectWorker}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  toggleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1
  },
  locationText: {
    fontSize: 14,
    fontWeight: '700'
  },
  segmentedToggle: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  segmentBtnActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700'
  },
  mapCanvas: {
    height: 380,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  gridLineHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1
  },
  gridLineVertical: {
    position: 'absolute',
    height: '100%',
    width: 1
  },
  userRadar: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  radarPulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5
  },
  userPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4
  },
  userPinLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4
  },
  workerMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  workerMarkerSelected: {
    zIndex: 10,
    transform: [{ scale: 1.15 }]
  },
  markerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3
  },
  markerIconSelected: {
    borderWidth: 2.5
  },
  markerCategoryEmoji: {
    fontSize: 16
  },
  markerBadge: {
    marginTop: 2,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6
  },
  markerBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  quickCardWrapper: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    zIndex: 20
  },
  listContainer: {
    padding: 16
  }
});
