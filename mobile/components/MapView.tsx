import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MapPin, Navigation, List, Map as MapIcon, User, Star } from 'lucide-react-native';
import { NearbyWorker } from '../types/index.js';
import { useTranslation } from '../utils/i18n.js';
import { WorkerCard } from './WorkerCard.js';

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
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedWorker, setSelectedWorker] = useState<NearbyWorker | null>(null);

  // Approximate Addis Ababa boundary box for spatial visual representation
  const centerLat = userLocation.latitude;
  const centerLng = userLocation.longitude;

  return (
    <View style={styles.container}>
      {/* Toggle View Header */}
      <View style={styles.toggleBar}>
        <View style={styles.locationTag}>
          <MapPin size={15} color="#0F766E" />
          <Text style={styles.locationText} numberOfLines={1}>
            {userLocation.district || t('addis_ababa')}
          </Text>
        </View>

        <View style={styles.segmentedToggle}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setViewMode('map')}
            style={[styles.segmentBtn, viewMode === 'map' && styles.segmentBtnActive]}
          >
            <MapIcon size={15} color={viewMode === 'map' ? '#0F766E' : '#64748B'} />
            <Text style={[styles.segmentText, viewMode === 'map' && styles.segmentTextActive]}>
              Map
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setViewMode('list')}
            style={[styles.segmentBtn, viewMode === 'list' && styles.segmentBtnActive]}
          >
            <List size={15} color={viewMode === 'list' ? '#0F766E' : '#64748B'} />
            <Text style={[styles.segmentText, viewMode === 'list' && styles.segmentTextActive]}>
              List ({workers.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map View Canvas */}
      {viewMode === 'map' ? (
        <View style={styles.mapCanvas}>
          {/* Visual Grid Lines */}
          <View style={styles.gridLineHorizontal} />
          <View style={styles.gridLineVertical} />

          {/* User Location Radar Center */}
          <View style={styles.userRadar}>
            <View style={styles.radarPulse} />
            <View style={styles.userPin}>
              <Navigation size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.userPinLabel}>እርስዎ (You)</Text>
          </View>

          {/* Spatial Worker Markers Placed Relatively */}
          {workers.slice(0, 10).map((w, index) => {
            // Project lat/lng offsets onto canvas area (-110px to +110px)
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
                <View style={[styles.markerIconCircle, isSelected && styles.markerIconSelected]}>
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
                <View style={styles.markerBadge}>
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
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1
  },
  locationText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A'
  },
  segmentedToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
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
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  },
  segmentTextActive: {
    color: '#0F766E',
    fontWeight: '700'
  },
  mapCanvas: {
    height: 380,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  gridLineHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(15, 118, 110, 0.12)'
  },
  gridLineVertical: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(15, 118, 110, 0.12)'
  },
  userRadar: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  },
  radarPulse: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(15, 118, 110, 0.15)'
  },
  userPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4
  },
  userPinLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  workerMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5
  },
  workerMarkerSelected: {
    zIndex: 20,
    transform: [{ scale: 1.15 }]
  },
  markerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0F766E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  markerIconSelected: {
    borderColor: '#D97706',
    borderWidth: 3
  },
  markerCategoryEmoji: {
    fontSize: 16
  },
  markerBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    marginTop: -4
  },
  markerBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  },
  quickCardWrapper: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    zIndex: 30
  },
  listContainer: {
    padding: 16
  }
});
