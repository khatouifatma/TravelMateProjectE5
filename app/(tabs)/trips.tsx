import { useFavorites } from '@/contexts/favoris-context';
import { API } from '@/services/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IMAGES_SOURCES } from '.';

interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  image: string;
  photos: string[];
  description?: string;
}

export default function TabTwoScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc'>('date-desc');
  const [isSortModalVisible, setSortModalVisible] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  const { favorites, toggleFavorite } = useFavorites();

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

  const tabs = ['All', 'Upcoming', 'Past', 'Favorites'];

  const canModifyTrip = (trip: Trip) => {
    const endDate = new Date(trip.endDate);
    const now = new Date();
    return endDate >= now;
  };

  const handleDeleteTrip = (trip: Trip) => {
    setActiveMenuId(null);
    Alert.alert(
      'Supprimer le voyage',
      `Êtes-vous sûr de vouloir supprimer "${trip.title}" ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await API.deleteTrip(trip.id);
              Alert.alert('Succès', 'Voyage supprimé avec succès');
              loadTrips();
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible de supprimer le voyage');
            }
          }
        }
      ]
    );
  };

  const handleEditTrip = (trip: Trip) => {
    setActiveMenuId(null);
    if (!canModifyTrip(trip)) {
      Alert.alert(
        'Modification impossible',
        'Ce voyage est terminé et ne peut plus être modifié',
        [{ text: 'OK' }]
      );
      return;
    }
    
    router.push({
      pathname: '/modal/editTrip',
      params: { id: trip.id }
    });
  };

  const filteredTrips = useMemo(() => {
    const now = new Date();
    const filtered = trips.filter(trip => {
      let tabMatch = false;
      
      const endDate = trip.endDate ? new Date(trip.endDate) : null;
      
      switch (selectedTab) {
        case 'Upcoming':
          tabMatch = endDate ? endDate >= now : false;
          break;
        case 'Past':
          tabMatch = endDate ? endDate < now : false;
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

      if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        return trip.destination.toLowerCase().includes(lowerCaseQuery) ||
               trip.title.toLowerCase().includes(lowerCaseQuery);
      }

      return true;
    });

    return filtered.sort((a, b) => {
      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
      if (sortOrder === 'date-asc') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

  }, [selectedTab, searchQuery, favorites, sortOrder, trips]);

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

        {/* Loading State */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ED7868" />
            <Text style={styles.loadingText}>Loading trips...</Text>
          </View>
        ) : (
          /* Trips List */
          <View style={styles.tripsList}>
            {filteredTrips.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons 
                  name={selectedTab === 'Favorites' ? "heart-outline" : "airplane-outline"} 
                  size={64} 
                  color="#d1d5db" 
                />
                <Text style={styles.emptyStateText}>
                  {selectedTab === 'Favorites' ? 'No favorite trips' : 'No trips found'}
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  {selectedTab === 'Favorites' 
                    ? 'Mark your favorite trips by pressing the heart icon'
                    : 'Start adding your travel adventures!'}
                </Text>
              </View>
            ) : (
              filteredTrips.map((trip) => (
                <View key={trip.id} style={styles.tripCard}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      if (activeMenuId === trip.id) {
                        setActiveMenuId(null);
                      } else {
                        router.push({
                          pathname: '/modal/tripDetails',
                          params: { id: trip.id }
                        });
                      }
                    }}>
                    {/* Image */}
                    <View style={styles.tripImageContainer}> 
                      <Image 
                        source={
                          trip.image.startsWith('http') 
                            ? { uri: trip.image }
                            : IMAGES_SOURCES[trip.image as keyof typeof IMAGES_SOURCES] || IMAGES_SOURCES.paris
                        }
                        style={styles.tripImage}
                        resizeMode="cover"
                      />
                      <View style={styles.tripImageOverlay} /> 
                      
                      <View style={styles.topButtonsContainer}>
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
                            color={favorites.has(trip.id) ? "#ED7868" : "white"} 
                          />
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.menuButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === trip.id ? null : trip.id);
                          }}
                        >
                          <Ionicons 
                            name="ellipsis-vertical" 
                            size={24} 
                            color="white" 
                          />
                        </TouchableOpacity>
                      </View>

                      {activeMenuId === trip.id && (
                        <View style={styles.dropdownMenu}>
                          <TouchableOpacity 
                            style={[
                              styles.dropdownItem,
                              !canModifyTrip(trip) && styles.dropdownItemDisabled
                            ]}
                            onPress={() => handleEditTrip(trip)}
                            disabled={!canModifyTrip(trip)}
                          >
                            <Ionicons 
                              name="create-outline" 
                              size={20} 
                              color={canModifyTrip(trip) ? "#3b82f6" : "#9ca3af"} 
                            />
                            <Text style={[
                              styles.dropdownItemText,
                              !canModifyTrip(trip) && styles.dropdownItemTextDisabled
                            ]}>
                              Modifier
                            </Text>
                          </TouchableOpacity>

                          <View style={styles.dropdownDivider} />

                          <TouchableOpacity 
                            style={styles.dropdownItem}
                            onPress={() => handleDeleteTrip(trip)}
                          >
                            <Ionicons 
                              name="trash-outline" 
                              size={20} 
                              color="#ef4444" 
                            />
                            <Text style={[styles.dropdownItemText, styles.dropdownItemTextDanger]}>
                              Supprimer
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}

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
                          {trip.startDate && trip.endDate ? (
                            <>
                              {new Date(trip.startDate).toLocaleDateString('en-US', {day: 'numeric', month: 'short'})} -
                              {' '}
                              {new Date(trip.endDate).toLocaleDateString('en-US', {day: 'numeric', month: 'short'})}
                            </>
                          ) : (
                            'Date non définie'
                          )}
                        </Text>
                      </View>
                      <View style={styles.tripPhotos}>
                        <View style={styles.photoCircle}/>
                        <View style={[styles.photoCircle, styles.photoCircle2]}/>
                        <View style={[styles.photoCircle, styles.photoCircle3]}>
                          <Text style={styles.tripPhotoCount}>{trip.photos?.length || 0}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
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
                  color="#ED7868" 
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
                  color="#ED7868" 
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
    backgroundColor : '#f9fafb',
  },
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
    backgroundColor : '#ED7868',
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
    backgroundColor : '#ED7868',
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
  },
  tripImageOverlay : {
    position : 'absolute',
    top : 0,
    left : 0,
    right : 0,
    bottom : 0,
    backgroundColor : 'rgba(0,0,0,0.3)',
  },
  topButtonsContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    right: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 160,
    zIndex: 20,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  dropdownItemDisabled: {
    opacity: 0.5,
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  dropdownItemTextDisabled: {
    color: '#9ca3af',
  },
  dropdownItemTextDanger: {
    color: '#ef4444',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 12,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
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