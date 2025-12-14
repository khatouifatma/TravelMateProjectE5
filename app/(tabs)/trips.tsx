import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IMAGES_SOURCES } from '.';

export default function TabTwoScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<string>('All');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const TRIPS_DATA = [
    {
      id: '1',
      title: 'Trip to Bali',
      destination: 'Bali, Indonesia',
      startDate: '2024-08-10',
      endDate: '2024-08-20',
      image: 'bali',
      photosCount: 3
    },
    {
      id: '2',
      title: 'Trip to Tokyo',
      destination: 'Tokyo, Japan',
      startDate: '2024-09-15',
      endDate: '2024-09-25',
      image: 'tokyo',
      photosCount: 5
    }, 
    {
      id: '3',
      title: 'Trip to Paris',
      destination: 'Paris, France',
      startDate: '2024-10-05',
      endDate: '2024-10-15',
      image: 'paris',
      photosCount: 8
    }
  ];

  const tabs = ['All', 'Upcoming', 'Past', 'Favorites'];

  const toggleFavorite = (tripId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(tripId)) {
        newFavorites.delete(tripId);
      } else {
        newFavorites.add(tripId);
      }
      return newFavorites;
    });
  };

  const filteredTrips = TRIPS_DATA.filter(trip => {
    if (selectedTab === 'Favorites') {
      return favorites.has(trip.id);
    }
    // Vous pouvez ajouter d'autres filtres pour 'Upcoming' et 'Past' ici
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.HeaderTitle}>My Trips</Text>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput style={styles.searchInput} placeholder="Search trips" />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabContainer}
          contentContainerStyle={styles.tabsContent}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                selectedTab === tab && styles.tabActive,
              ]}
              onPress={() => setSelectedTab(tab)}>
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.tabTextActive,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trips List */}
        <View style={styles.tripsList}>
          {filteredTrips.length === 0 && selectedTab === 'Favorites' ? (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyStateText}>Aucun voyage favori</Text>
              <Text style={styles.emptyStateSubtext}>
                Marquez vos voyages préférés en appuyant sur l icône cœur
              </Text>
            </View>
          ) : (
            filteredTrips.map((trip) => (
              <TouchableOpacity
                key={trip.id}
                style={styles.tripCard}
                onPress={() => router.push({
                  pathname: '/modal/tripDetails',
                  params: { id: trip.id }
                })}>
                {/* Image */}
                <View style={styles.tripImageContainer}> 
                  <Image 
                    source={IMAGES_SOURCES[trip.image as keyof typeof IMAGES_SOURCES] || trip.image}
                    style={styles.tripImage}
                    resizeMode="cover"
                  />
                  <View style={styles.tripImageOverlay} /> 
                  
                  {/* Favorite Button */}
                  <TouchableOpacity 
                    style={styles.favoriteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleFavorite(trip.id);
                    }}
                  >
                    <Ionicons 
                      name={favorites.has(trip.id) ? "heart" : "heart-outline"} 
                      size={24} 
                      color={favorites.has(trip.id) ? "#ec4899" : "white"} 
                    />
                  </TouchableOpacity>

                  <View style={styles.tripImageContent}>
                    <Text style={styles.tripCardTitle}>{trip.title}</Text>
                    <View style={styles.tripLocation}>
                      <Ionicons name="location-outline" size={16} color="white" />
                      <Text style={styles.tripLocationText}>{trip.destination}</Text>
                    </View>
                  </View>
                </View>

                {/* Trip info */}
                <View style={styles.tripCardInfo}>
                  <View style={styles.tripDate}>
                    <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                    <Text style={styles.tripDateText}>
                      {new Date(trip.startDate).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'})} -
                      {' '}
                      {new Date(trip.endDate).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'})}
                    </Text>
                  </View>
                  <View style={styles.tripPhotos}>
                    <View style={styles.photoCircle}/>
                    <View style={[styles.photoCircle, styles.photoCircle2]}/>
                    <View style={[styles.photoCircle, styles.photoCircle3]}>
                      <Text style={styles.tripPhotoCount}>{trip.photosCount}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
        <View style={{height: 20}}/>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container : {
    flex : 1,
    backgroundColor : '#f9fafb',},
  header : {
    backgroundColor : '#fff',
    paddingHorizontal : 24,
    paddingTop : 16,
    paddingBottom : 16
  },
  HeaderTitle : {
    fontSize : 32,
    fontWeight : 'bold',
    color : '#111827',
    marginBottom : 16
  },
  searchBarContainer : {
    flexDirection : 'row',
    gap : 12,
  },
  searchBar : {
    flex : 1,
    flexDirection : 'row',
    alignItems : 'center',
    backgroundColor : '#f3f4f6',
    paddingHorizontal : 16,
    paddingVertical : 12,
    borderRadius : 16,
    gap : 12,
  },
  searchInput: {
    flex : 1,
    fontSize : 16,
    color : '#111827',
  },
  filterButton : {
    width : 48,
    height : 48,
    backgroundColor : '#a855f7',
    borderRadius : 16,
    justifyContent : 'center',
    alignItems : 'center',
  },
  content : {
    flex : 1,
  },
  tabContainer : {
    paddingHorizontal : 24,
    paddingVertical : 16,
  },
  tabsContent : {
    gap : 8,
  },
  tab : {
    paddingHorizontal : 16,
    paddingVertical : 8,
    borderRadius : 20,
    backgroundColor : 'white',
  },
  tabActive : {
    backgroundColor : '#a855f7',
  },
  tabText : {
    fontSize: 14,
    color : '#6b7280',
    fontWeight : '600',
  },
  tabTextActive : {
    color : 'white',
  },
  tripsList : {
    paddingHorizontal : 24,
    gap : 16,
  },
  tripCard : {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  tripImageContainer : {
    position : 'relative',
    height : 192,
  },
  tripImage : {
    width: '100%',
    height: '100%',
    backgroundColor : '#FF0',
  },
  tripImageOverlay : {
    position : 'absolute',
    top : 0,
    left : 0,
    right : 0,
    bottom : 0,
    backgroundColor : 'rgba(0,0,0,0.3)',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  tripImageContent : {
    position : 'absolute',
    bottom : 16,
    left : 16,
    right : 16,
  },
  tripCardTitle : {
    fontSize : 24,
    fontWeight : 'bold',
    color : 'white',
    marginBottom : 4,
  },
  tripLocation : {
    flexDirection : 'row',
    alignItems : 'center',
    gap : 4,
  },
  tripLocationText : {
    color : 'rgba(255,255,255,0.9)',
    fontSize : 14,
  },
  tripCardInfo : {
    padding : 16,
    flexDirection : 'row',
    justifyContent : 'space-between',
    alignItems : 'center',
  },
  tripDate : {
    flexDirection : 'row',
    alignItems : 'center',
    gap : 8,
  },
  tripDateText : {
    color : '#6b7280',
    fontSize : 14,
  },
  tripPhotos : {
    flexDirection : 'row',
    alignItems : 'center'
  },
  photoCircle : {
    width : 32,
    height : 32,
    borderRadius : 16,
    backgroundColor : '#d1d5db',
    borderWidth : 2,
    borderColor : 'white',
    marginLeft : -8,
  },
  photoCircle2 : {
    backgroundColor : '#d1d5db',
  },
  photoCircle3 : {
    backgroundColor : '#9ca3af',
    alignItems : 'center',
    justifyContent : 'center',
  },
  tripPhotoCount : {
    fontSize : 10,
    color : 'white',
    fontWeight : '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});