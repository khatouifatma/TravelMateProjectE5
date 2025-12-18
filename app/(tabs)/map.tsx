import { API } from '@/services/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IMAGES_SOURCES } from '.';

const { width } = Dimensions.get('window');

interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  image: string;
  photos: string[];
  location?: {
    lat: number;
    lng: number;
  };
}

interface TripLocation extends Trip {
  latitude: number;
  longitude: number;
  status: 'upcoming' | 'past';
}

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [trips, setTrips] = useState<TripLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTrips = async () => {
    try {
      setIsLoading(true);
      const data = await API.getTrips();
      
      const tripsWithLocation: TripLocation[] = data
        .filter((trip: Trip) => trip.location && trip.location.lat !== 0 && trip.location.lng !== 0)
        .map((trip: Trip) => {
          const endDate = trip.endDate ? new Date(trip.endDate) : new Date();
          const status = endDate >= new Date() ? 'upcoming' : 'past';
          
          return {
            ...trip,
            latitude: trip.location!.lat,
            longitude: trip.location!.lng,
            status
          };
        });
      
      console.log('📍 Trips with location:', tripsWithLocation.length);
      setTrips(tripsWithLocation);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [])
  );

  const filteredTrips = trips.filter(trip => {
    if (selectedFilter === 'all') return true;
    return trip.status === selectedFilter;
  });

  const zoomToAllMarkers = () => {
    if (filteredTrips.length === 0) return;

    const coordinates = filteredTrips.map(trip => ({
      latitude: trip.latitude,
      longitude: trip.longitude,
    }));

    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 150, right: 50, bottom: 150, left: 50 },
      animated: true,
    });
  };

  const handleMarkerPress = (trip: TripLocation) => {
    if (selectedTripId === trip.id) {
      router.push({
        pathname: '/modal/tripDetails',
        params: { id: trip.id }
      });
    } else {
      setSelectedTripId(trip.id);
      mapRef.current?.animateToRegion({
        latitude: trip.latitude,
        longitude: trip.longitude,
        latitudeDelta: 8,
        longitudeDelta: 8,
      }, 500);
    }
  };

  useEffect(() => {
    if (filteredTrips.length > 0) {
      setTimeout(() => zoomToAllMarkers(), 500);
      setSelectedTripId(null);
    }
  }, [selectedFilter]);

  const CustomMarker = ({ trip }: { trip: TripLocation }) => {
    const isSelected = selectedTripId === trip.id;
    const markerSize = isSelected ? 90 : 70;
    const borderColor = trip.status === 'upcoming' ? '#ED7868' : '#6b7280';

    return (
      <View style={styles.markerContainer}>
        <View
          style={[
            styles.circularImageContainer,
            {
              width: markerSize,
              height: markerSize,
              borderColor: borderColor,
              borderWidth: isSelected ? 5 : 4,
            },
          ]}
        >
          <Image
            source={
              trip.image.startsWith('http') 
                ? { uri: trip.image }
                : IMAGES_SOURCES[trip.image as keyof typeof IMAGES_SOURCES] || IMAGES_SOURCES.paris
            }
            style={styles.circularImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          >
            <Text style={styles.markerTitle} numberOfLines={1}>
              {trip.destination.split(',')[0]}
            </Text>
          </LinearGradient>

          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: trip.status === 'upcoming' ? '#ED7868' : '#6b7280' },
            ]}
          >
            <Text style={styles.statusEmoji}>
              {trip.status === 'upcoming' ? '📅' : '✅'}
            </Text>
          </View>
        </View>

        <View style={[styles.pinPointer, { borderTopColor: borderColor }]} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Travel Map</Text>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomToAllMarkers}>
          <Ionicons name="locate" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
            All ({trips.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'upcoming' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('upcoming')}
        >
          <Text style={[styles.filterText, selectedFilter === 'upcoming' && styles.filterTextActive]}>
            Upcoming ({trips.filter(t => t.status === 'upcoming').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'past' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('past')}
        >
          <Text style={[styles.filterText, selectedFilter === 'past' && styles.filterTextActive]}>
            Past ({trips.filter(t => t.status === 'past').length})
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ED7868" />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      ) : filteredTrips.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="map-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyStateText}>No trips with location</Text>
          <Text style={styles.emptyStateSubtext}>
            Add trips with location data to see them on the map
          </Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: filteredTrips[0]?.latitude || 48.8566,
            longitude: filteredTrips[0]?.longitude || 2.3522,
            latitudeDelta: 50,
            longitudeDelta: 50,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {filteredTrips.map((trip) => (
            <Marker
              key={trip.id}
              coordinate={{
                latitude: trip.latitude,
                longitude: trip.longitude,
              }}
              onPress={() => handleMarkerPress(trip)}
              anchor={{ x: 0.5, y: 1 }}
            >
              <CustomMarker trip={trip} />
            </Marker>
          ))}
        </MapView>
      )}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ED7868' }]} />
          <Text style={styles.legendText}>Upcoming</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#6b7280' }]} />
          <Text style={styles.legendText}>Past</Text>
        </View>
      </View>

      {selectedTripId && (
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            Tap again on the image to see details
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#a5bb80',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
  },
  zoomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#a5bb80',
    gap: 8,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterButtonActive: {
    backgroundColor: 'white',
  },
  filterText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#ED7868',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  map: {
    width: width,
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  circularImageContainer: {
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  circularImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 4,
  },
  markerTitle: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  statusEmoji: {
    fontSize: 12,
  },
  pinPointer: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  legend: {
    position: 'absolute',
    top: 200,
    right: 20,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  selectionInfo: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(237, 120, 104, 0.95)',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  selectionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});