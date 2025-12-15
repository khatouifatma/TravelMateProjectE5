import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IMAGES_SOURCES } from '.';

export default function TabTwoScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc'>('date-desc');
  const [isSortModalVisible, setSortModalVisible] = useState(false);
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

  const filteredTrips = useMemo(() => {
    const now = new Date();
    const filtered = TRIPS_DATA.filter(trip => {
      // Filtre par onglet
      let tabMatch = false;
      switch (selectedTab) {
        case 'Upcoming':
          tabMatch = new Date(trip.endDate) >= now;
          break;
        case 'Past':
          tabMatch = new Date(trip.endDate) < now;
          break;
        case 'Favorites':
          tabMatch = favorites.has(trip.id);
          break;
        case 'All':
        default:
          tabMatch = true;
          break;
      }

      if (!tabMatch) return false;

      // Filtre par recherche
      if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        return trip.destination.toLowerCase().includes(lowerCaseQuery);
      }

      return true;
    });

    // Tri
    return filtered.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      if (sortOrder === 'date-asc') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

  }, [selectedTab, searchQuery, favorites, sortOrder]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.HeaderTitle}>My Trips</Text>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un voyage..."
              value={searchQuery}
              onChangeText={setSearchQuery} />
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={() => setSortModalVisible(true)}>
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

        {/* Modal de tri */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isSortModalVisible}
          onRequestClose={() => setSortModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setSortModalVisible(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Sort by</Text>
              <TouchableOpacity 
                style={styles.modalOption} 
                onPress={() => { setSortOrder('date-desc'); setSortModalVisible(false); }}
              >
                <Ionicons 
                  name={sortOrder === 'date-desc' ? 'radio-button-on' : 'radio-button-off'} 
                  size={20} 
                  color="#a855f7" 
                />
                <Text style={styles.modalOptionText}>Date (most recent)</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalOption} 
                onPress={() => { setSortOrder('date-asc'); setSortModalVisible(false); }}
              >
                <Ionicons 
                  name={sortOrder === 'date-asc' ? 'radio-button-on' : 'radio-button-off'} 
                  size={20} 
                  color="#a855f7" 
                />
                <Text style={styles.modalOptionText}>Date (oldest)</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
});