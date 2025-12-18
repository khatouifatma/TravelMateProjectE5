import { useAuth } from '@/contexts/auth-context';
import { API } from '@/services/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const IMAGES_SOURCES = {
  paris: require('@/assets/images/paris.jpeg'),
  tokyo: require('@/assets/images/tokyo.jpeg'),
  bali: require('@/assets/images/bali.jpeg'),
}

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  type: 'visit' | 'food' | 'activity' | 'transport' | 'accommodation';
  tripId: string;
  tripTitle: string;
}

interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  image: string;
  photos: string[];
  activities?: Activity[];
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const firstName = user?.name?.split(' ')[0] || 'Voyageur';

  const loadTrips = async () => {
    try {
      setIsLoading(true);
      const data = await API.getTrips();
      setTrips(data);
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

  const stats = useMemo(() => {
    const totalTrips = trips.length;
    const totalPhotos = trips.reduce((acc, trip) => acc + (trip.photos?.length || 0), 0);
    
    const countries = new Set(
      trips
        .map(t => {
          const parts = t.destination.split(',');
          return parts[parts.length - 1]?.trim();
        })
        .filter(country => country && country.length > 0)
    );
    
    return [
      { label: 'Trips', value: totalTrips, icon: 'airplane-outline' as const },
      { label: 'Photos', value: totalPhotos, icon: 'camera-outline' as const },
      { label: 'Countries', value: countries.size, icon: 'globe-outline' as const },
    ];
  }, [trips]);

  const upcomingTrips = trips
    .filter(trip => {
      if (!trip.endDate) return false;
      const endDate = new Date(trip.endDate);
      return endDate >= new Date();
    })
    .sort((a, b) => {
      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return dateA - dateB;
    })
    .slice(0, 2)
    .map(trip => {
      const today = new Date();
      const startDate = trip.startDate ? new Date(trip.startDate) : new Date();
      const daysLeft = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      const formatDateRange = (start: string, end: string) => {
        if (!start || !end) return 'Date non définie';
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return 'Date invalide';
        }
        
        const startDay = startDate.getDate();
        const endDay = endDate.getDate();
        const month = startDate.toLocaleDateString('en-US', { month: 'short' });
        return `${startDay}-${endDay} ${month}`;
      };

      return {
        id: trip.id,
        title: trip.title,
        date: formatDateRange(trip.startDate, trip.endDate),
        daysLeft: Math.max(0, daysLeft),
        image: trip.image
      };
    });

  const recentActivities = useMemo(() => {
    const allActivities: Activity[] = [];
    
    trips.forEach(trip => {
      if (trip.activities && trip.activities.length > 0) {
        trip.activities.forEach(activity => {
          allActivities.push({
            ...activity,
            tripId: trip.id,
            tripTitle: trip.title
          });
        });
      }
    });

    return allActivities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3); 
  }, [trips]);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'visit': return 'location-outline';
      case 'food': return 'restaurant-outline';
      case 'activity': return 'basketball-outline';
      case 'transport': return 'car-outline';
      case 'accommodation': return 'bed-outline';
      default: return 'calendar-outline';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const activityDate = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - activityDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const handleTripPress = (tripId: string) => {
    router.push({
      pathname: '/modal/tripDetails',
      params: { id: tripId }
    });
  };

  const handleSeeAllTrips = () => {
    router.push('/(tabs)/trips');
  };

  const handleMapPress = () => {
    router.push('/(tabs)/map');
  };

  const handleAddTrip = () => {
    router.push('/modal/add-trip'); 
  };

  const handleAddPhoto = () => {
    console.log('Add photo');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greetingText}>Hello</Text>
              <Text style={styles.firstnameText}>{firstName}!</Text>
            </View>
            <TouchableOpacity style={styles.notificationBtn}>
              <Ionicons name="notifications-outline" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Ionicons name={stat.icon} size={24} color="#ED7868" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Content */}
        <View style={styles.homeContent}>
          {/* Upcoming trips */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Trips</Text>
              <TouchableOpacity onPress={handleSeeAllTrips}>
                <Text style={styles.homeSeeAllBtn}>See All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ED7868" />
          </View>
        ) : upcomingTrips.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="airplane-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyStateText}>No upcoming trips</Text>
            <TouchableOpacity style={styles.addTripButton} onPress={handleAddTrip}>
              <Text style={styles.addTripButtonText}>Add your first trip</Text>
            </TouchableOpacity>
          </View>
        ) : (
          upcomingTrips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={styles.tripCard}
              onPress={() => handleTripPress(trip.id)}
              activeOpacity={0.7}
            >
              <Image
                source={
                  trip.image.startsWith('http') 
                    ? { uri: trip.image }
                    : IMAGES_SOURCES[trip.image as keyof typeof IMAGES_SOURCES] || IMAGES_SOURCES.paris
                }
                style={styles.tripImage}
              />
              <View style={styles.tripInfo}>
                <Text style={styles.tripTitle}>{trip.title}</Text>
                <View style={styles.tripDate}>
                  <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                  <Text style={styles.tripDateText}>{trip.date}</Text>
                </View>
                <View style={styles.tripBadge}>
                  <Text style={styles.tripBadgeText}>
                    {trip.daysLeft === 0 ? 'Aujourd\'hui' : `Dans ${trip.daysLeft} jours`}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" style={styles.tripChevron} />
            </TouchableOpacity>
          ))
        )}

        <View style={styles.mapBannerContainer}>
          <TouchableOpacity 
            style={styles.mapBanner}
            onPress={handleMapPress}
            activeOpacity={0.9}
          >
            <View style={styles.mapBannerSolid}>
              <View style={styles.mapBannerContent}>
                <View style={styles.mapBannerIcon}>
                  <Ionicons name="map-outline" size={32} color="white" />
                </View>
                <View style={styles.mapBannerTextContainer}>
                  <Text style={styles.mapBannerTitle}>Explore Travel Map</Text>
                  <Text style={styles.mapBannerSubtitle}>
                    See all your trips on an interactive map 
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="white" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={{ ...styles.sectionTitle, paddingHorizontal: 12 }}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity onPress={handleAddTrip}>
              <View style={[styles.quickActionCard, { backgroundColor: '#ED7868' }]}>
                <Ionicons name="add-circle-outline" size={24} color="#fff" />
                <Text style={styles.quickActionLabel}>New Trip</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleAddPhoto}>
              <View style={[styles.quickActionCard, { backgroundColor: '#a5bb80' }]}>
                <Ionicons name="camera-outline" size={24} color="#fff" />
                <Text style={styles.quickActionLabel}>Add Photo</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleMapPress}>
              <View style={[styles.quickActionCard, { backgroundColor: '#6b7280' }]}>
                <Ionicons name="map-outline" size={24} color="#fff" />
                <Text style={styles.quickActionLabel}>Map View</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}

        <View style={styles.section}>
          <View style={{ paddingHorizontal: 12 }}>
            <Text style={{ ...styles.sectionTitle, paddingHorizontal: 12 }}>Recent Activity</Text>

            {recentActivities.length === 0 ? (
              <View style={styles.emptyActivityState}>
                <Ionicons name="calendar-outline" size={32} color="#d1d5db" />
                <Text style={styles.emptyActivityText}>No activities yet</Text>
                <Text style={styles.emptyActivitySubtext}>
                  Add activities to your trips to see them here
                </Text>
              </View>
            ) : (
              recentActivities.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={styles.activityCard}
                  onPress={() => handleTripPress(activity.tripId)}
                >
                  <Text style={styles.activityIcon}>
                    <Ionicons name={getActivityIcon(activity.type)} size={24} color="#6b7280" />
                  </Text>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityText}>
                      {activity.title}
                      <Text style={styles.activityTripName}> • {activity.tripTitle}</Text>
                    </Text>
                    <Text style={styles.activityTime}>{getTimeAgo(activity.date)}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: '#a5bb80',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  greetingText: {
    color: '#6b7280',
    fontSize: 24,
  },
  firstnameText: {
    color: '#111827',
    fontSize: 28,
    fontWeight: 'bold'
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fef8f7',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f5d5cf',
  },
  statValue: {
    color: '#111827',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 12,
  },
  homeContent: {
    padding: 24,
    paddingBottom: 0,
    marginBottom: 0,
  },
  section: {
    marginBottom: 24,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  homeSeeAllBtn: {
    color: '#ED7868',
    fontSize: 14,
    fontWeight: 'bold'
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 20,
  },
  addTripButton: {
    backgroundColor: '#ED7868',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addTripButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tripImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  tripInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  tripDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  tripDateText: {
    color: '#6b7280',
    fontSize: 14,
  },
  tripBadge: {
    backgroundColor: '#e8f5e0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  tripBadgeText: {
    color: '#a5bb80',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tripChevron: {
    marginLeft: 8,
  },
  mapBannerContainer: {
    paddingHorizontal: 12,
    marginBottom: 16,
    marginTop: 4,
  },
  mapBanner: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  mapBannerSolid: {
    backgroundColor: '#a5bb80',
    padding: 20,
  },
  mapBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  mapBannerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  mapBannerTextContainer: {
    flex: 1,
  },
  mapBannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  mapBannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
  },
  quickActionCard: {
    width: 110,
    height: 110,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 8,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginTop: 8,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  activityTripName: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '400',
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyActivityState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyActivityText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    fontWeight: '600',
  },
  emptyActivitySubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
});