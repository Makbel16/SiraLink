import { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationCoords {
  latitude: number;
  longitude: number;
  district?: string;
}

interface LocationContextType {
  currentLocation: LocationCoords;
  permissionStatus: Location.PermissionStatus | null;
  loading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
}

// Default fallback: Center of Addis Ababa (Kazanchis/Bole)
const DEFAULT_COORDS: LocationCoords = {
  latitude: 9.0125,
  longitude: 38.7692,
  district: 'Addis Ababa'
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<LocationCoords>(DEFAULT_COORDS);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      if (status === Location.PermissionStatus.GRANTED) {
        await refreshLocation();
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Permission request failed');
      return false;
    }
  };

  const refreshLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== Location.PermissionStatus.GRANTED) {
        // Fallback to Addis Ababa default coordinates
        setCurrentLocation(DEFAULT_COORDS);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      let district = 'Addis Ababa';
      try {
        const reverse = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        if (reverse && reverse.length > 0) {
          const loc = reverse[0];
          district = loc?.subregion || loc?.district || loc?.city || 'Addis Ababa';
        }
      } catch {
        // Ignore reverse geocode failures
      }

      setCurrentLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        district
      });
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve current location');
      setCurrentLocation(DEFAULT_COORDS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        permissionStatus,
        loading,
        error,
        requestPermission,
        refreshLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
