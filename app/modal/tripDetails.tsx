import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IMAGES_SOURCES } from '../(tabs)';

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  type: 'visit' | 'food' | 'activity' | 'transport' | 'accommodation';
}

interface Note {
  id: string;
  content: string;
  date: string;
}

interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
  image: string;
  photos: string[];
  activities?: Activity[];
  notes?: Note[];
}

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [selectedTab, setSelectedTab] = useState<'photos' | 'activities' | 'notes'>('photos');

  useEffect(() => {
    loadTripDetails();
  }, [id]);

  const loadTripDetails = async () => {
    const mockTrips: Record<string, Trip> = {
      '1': {
        id: '1',
        title: 'Trip to Bali',
        destination: 'Bali, Indonesia',
        startDate: '2024-08-10',
        endDate: '2024-08-20',
        description: 'Exploring the beautiful temples and beaches of Bali!',
        image: 'bali',
        photos: ['bali', 'bali', 'bali'],
        activities: [
          {
            id: '1',
            title: 'Visit Tanah Lot Temple',
            description: 'Beautiful temple by the sea',
            date: '2024-08-11',
            location: 'Tanah Lot',
            type: 'visit',
          },
          {
            id: '2',
            title: 'Surfing at Kuta Beach',
            description: 'Great waves for beginners',
            date: '2024-08-12',
            location: 'Kuta Beach',
            type: 'activity',
          },
        ],
        notes: [
          {
            id: '1',
            content: 'The temples are breathtaking! Don\'t forget sunscreen.',
            date: '2024-08-11',
          },
        ],
      },
      '2': {
        id: '2',
        title: 'Trip to Tokyo',
        destination: 'Tokyo, Japan',
        startDate: '2024-09-15',
        endDate: '2024-09-25',
        description: 'Discovering the vibrant culture of Tokyo!',
        image: 'tokyo',
        photos: ['tokyo', 'tokyo', 'tokyo', 'tokyo', 'tokyo'],
        activities: [
          {
            id: '1',
            title: 'Visit Senso-ji Temple',
            description: 'Ancient Buddhist temple',
            date: '2024-09-16',
            location: 'Asakusa',
            type: 'visit',
          },
          {
            id: '2',
            title: 'Ramen tasting',
            description: 'Best ramen in Shibuya',
            date: '2024-09-17',
            location: 'Shibuya',
            type: 'food',
          },
          {
            id: '3',
            title: 'Tokyo Skytree',
            description: 'Amazing city views',
            date: '2024-09-18',
            location: 'Sumida',
            type: 'visit',
          },
        ],
        notes: [
          {
            id: '1',
            content: 'Tokyo is incredible! So clean and organized.',
            date: '2024-09-15',
          },
          {
            id: '2',
            content: 'The food is absolutely amazing. Already planning to come back!',
            date: '2024-09-17',
          },
        ],
      },
      '3': {
        id: '3',
        title: 'Trip to Paris',
        destination: 'Paris, France',
        startDate: '2024-12-20',
        endDate: '2024-12-30',
        description: 'Amazing trip to the city of lights!',
        image: 'paris',
        photos: ['paris', 'paris', 'paris', 'paris', 'paris', 'paris', 'paris', 'paris'],
        activities: [
          {
            id: '1',
            title: 'Visit Eiffel Tower',
            description: 'Iconic landmark visit',
            date: '2024-12-21',
            location: 'Champ de Mars',
            type: 'visit',
          },
          {
            id: '2',
            title: 'Louvre Museum',
            description: 'See the Mona Lisa',
            date: '2024-12-22',
            location: 'Louvre',
            type: 'visit',
          },
          {
            id: '3',
            title: 'Dinner at Le Jules Verne',
            description: 'Fine dining experience',
            date: '2024-12-23',
            location: 'Eiffel Tower',
            type: 'food',
          },
        ],
        notes: [
          {
            id: '1',
            content: 'First day was amazing! Weather perfect.',
            date: '2024-12-20',
          },
          {
            id: '2',
            content: 'The Eiffel Tower at night is magical ✨',
            date: '2024-12-21',
          },
        ],
      },
    };
    
    const selectedTrip = mockTrips[id as string] || mockTrips['3'];
    setTrip(selectedTrip);
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'visit': return 'location';
      case 'food': return 'restaurant';
      case 'activity': return 'basketball';
      case 'transport': return 'car';
      case 'accommodation': return 'bed';
    }
  };

  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={IMAGES_SOURCES[trip.image as keyof typeof IMAGES_SOURCES]}
            style={styles.headerImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageGradient}
          />
          
          <SafeAreaView edges={['top']} style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          </SafeAreaView>

          <View style={styles.imageContent}>
            <Text style={styles.tripTitle}>{trip.title}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.locationText}>{trip.destination}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.infoCard}>
            <View style={styles.dateInfo}>
              <Ionicons name="calendar-outline" size={20} color="#6b7280" />
              <Text style={styles.dateText}>
                {new Date(trip.startDate).toLocaleDateString('fr-FR')} -{' '}
                {new Date(trip.endDate).toLocaleDateString('fr-FR')}
              </Text>
            </View>
            <Text style={styles.description}>{trip.description}</Text>
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'photos' && styles.tabActive]}
              onPress={() => setSelectedTab('photos')}
            >
              <Text style={[styles.tabText, selectedTab === 'photos' && styles.tabTextActive]}>
                Photos ({trip.photos?.length || 0})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'activities' && styles.tabActive]}
              onPress={() => setSelectedTab('activities')}
            >
              <Text style={[styles.tabText, selectedTab === 'activities' && styles.tabTextActive]}>
                Activités ({trip.activities?.length || 0})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'notes' && styles.tabActive]}
              onPress={() => setSelectedTab('notes')}
            >
              <Text style={[styles.tabText, selectedTab === 'notes' && styles.tabTextActive]}>
                Notes ({trip.notes?.length || 0})
              </Text>
            </TouchableOpacity>
          </View>

          {selectedTab === 'photos' && (
            <View style={styles.photosGrid}>
              {trip.photos?.map((photo, idx) => (
                <Image
                  key={idx}
                  source={IMAGES_SOURCES[photo as keyof typeof IMAGES_SOURCES]}
                  style={styles.photoItem}
                />
              ))}
            </View>
          )}

          {selectedTab === 'activities' && (
            <View style={styles.section}>
              {trip.activities?.map((activity) => (
                <View key={activity.id} style={styles.activityCard}>
                  <View style={styles.activityHeader}>
                    <View style={styles.activityIconContainer}>
                      <Ionicons
                        name={getActivityIcon(activity.type)}
                        size={24}
                        color="#a855f7"
                      />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      {activity.location && (
                        <View style={styles.activityLocation}>
                          <Ionicons name="location-outline" size={14} color="#6b7280" />
                          <Text style={styles.activityLocationText}>{activity.location}</Text>
                        </View>
                      )}
                      <Text style={styles.activityDescription}>{activity.description}</Text>
                      <Text style={styles.activityDate}>
                        {new Date(activity.date).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {selectedTab === 'notes' && (
            <View style={styles.section}>
              {trip.notes?.map((note) => (
                <View key={note.id} style={styles.noteCard}>
                  <Text style={styles.noteDate}>
                    {new Date(note.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.noteContent}>{note.content}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  imageContainer: {
    position: 'relative',
    height: 350,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  headerButtons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContent: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  tripTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
  },
  content: {
    padding: 24,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dateText: {
    color: '#6b7280',
    fontSize: 14,
  },
  description: {
    color: '#111827',
    fontSize: 16,
    lineHeight: 24,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#a855f7',
  },
  tabText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: 'white',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoItem: {
    width: '31%',
    height: 120,
    borderRadius: 12,
  },
  section: {
    gap: 12,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#faf5ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  activityLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  activityLocationText: {
    color: '#6b7280',
    fontSize: 12,
  },
  activityDescription: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 8,
  },
  activityDate: {
    color: '#9ca3af',
    fontSize: 12,
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteDate: {
    color: '#a855f7',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  noteContent: {
    color: '#111827',
    fontSize: 14,
    lineHeight: 20,
  },
});