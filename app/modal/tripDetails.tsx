import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'photos' | 'activities' | 'notes'>('photos');
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [activityLocation, setActivityLocation] = useState('');
  const [activityDate, setActivityDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activityType, setActivityType] = useState<Activity['type']>('visit');

  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedNoteContent, setEditedNoteContent] = useState('');

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

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleAddActivity = () => {
    if (!activityTitle) {
      Alert.alert('Erreur', 'Veuillez entrer un titre');
      return;
    }

    if (trip) {
      const activityDateOnly = new Date(activityDate.toDateString());
      const tripStartDate = new Date(new Date(trip.startDate).toDateString());
      const tripEndDate = new Date(new Date(trip.endDate).toDateString());

      if (activityDateOnly < tripStartDate) {
        Alert.alert('Date invalide', 'La date de l\'activité ne peut pas être avant le début du voyage');
        return;
      }

      if (activityDateOnly > tripEndDate) {
        Alert.alert('Date invalide', 'La date de l\'activité ne peut pas être après la fin du voyage');
        return;
      }
    }

    const newActivity: Activity = {
      id: Date.now().toString(),
      title: activityTitle,
      description: activityDescription,
      date: activityDate.toISOString().split('T')[0],
      location: activityLocation,
      type: activityType,
    };

    setTrip((prev) => ({
      ...prev!,
      activities: [...(prev?.activities || []), newActivity].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    }));

    resetActivityForm();
    setShowAddActivity(false);
  };

  const handleUpdateActivity = () => {
    if (!editingActivity) return;
    
    if (!activityTitle) {
      Alert.alert('Erreur', 'Veuillez entrer un titre');
      return;
    }

    if (trip) {
      const activityDateOnly = new Date(activityDate.toDateString());
      const tripStartDate = new Date(new Date(trip.startDate).toDateString());
      const tripEndDate = new Date(new Date(trip.endDate).toDateString());

      if (activityDateOnly < tripStartDate) {
        Alert.alert('Date invalide', 'La date de l\'activité ne peut pas être avant le début du voyage');
        return;
      }

      if (activityDateOnly > tripEndDate) {
        Alert.alert('Date invalide', 'La date de l\'activité ne peut pas être après la fin du voyage');
        return;
      }
    }

    setTrip((prev) => ({
      ...prev!,
      activities: prev!.activities!.map((a) =>
        a.id === editingActivity.id
          ? {
              ...a,
              title: activityTitle,
              description: activityDescription,
              location: activityLocation,
              date: activityDate.toISOString().split('T')[0],
              type: activityType,
            }
          : a
      ).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    }));

    resetActivityForm();
    setEditingActivity(null);
    setShowAddActivity(false);
  };

  const handleDeleteActivity = (activityId: string) => {
    Alert.alert(
      'Supprimer',
      'Êtes-vous sûr de vouloir supprimer cette activité ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setTrip((prev) => ({
              ...prev!,
              activities: prev!.activities!.filter((a) => a.id !== activityId),
            }));
          },
        },
      ]
    );
  };

  const resetActivityForm = () => {
    setActivityTitle('');
    setActivityDescription('');
    setActivityLocation('');
    setActivityDate(trip ? new Date(trip.startDate) : new Date());
    setActivityType('visit');
  };

  const openEditActivity = (activity: Activity) => {
    setActivityTitle(activity.title);
    setActivityDescription(activity.description);
    setActivityLocation(activity.location || '');
    const activityDateObj = new Date(activity.date + 'T12:00:00');
    setActivityDate(activityDateObj);
    setActivityType(activity.type);
    setEditingActivity(activity);
    setShowAddActivity(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || activityDate;
    
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setActivityDate(selectedDate);
      }
    } else {
      if (selectedDate) {
        setActivityDate(selectedDate);
      }
    }
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

  const handleAddNote = () => {
    if (!newNoteContent.trim()) {
      Alert.alert('Erreur', 'Veuillez écrire quelque chose dans votre note.');
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      content: newNoteContent,
      date: new Date().toISOString(),
    };

    setTrip((prev) => ({
      ...prev!,
      notes: [newNote, ...(prev?.notes || [])],
    }));

    setNewNoteContent('');
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert(
      'Delete this note',
      'Are you sure you want to delete this note ?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setTrip((prev) => ({
              ...prev!,
              notes: prev!.notes!.filter((n) => n.id !== noteId),
            }));
          },
        },
      ]
    );
  };

  const openEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setEditedNoteContent(note.content);
  };

  const handleUpdateNote = () => {
    if (!editingNoteId) return;

    setTrip((prev) => ({
      ...prev!,
      notes: prev!.notes!.map((n) =>
        n.id === editingNoteId ? { ...n, content: editedNoteContent } : n
      ),
    }));

    setEditingNoteId(null);
    setEditedNoteContent('');
  };

  const cancelEditNote = () => {
    setEditingNoteId(null);
    setEditedNoteContent('');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
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
              style={styles.favoriteButtonHeader}
              onPress={toggleFavorite}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? "#ec4899" : "white"} 
              />
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
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  if (trip) {
                    setActivityDate(new Date(trip.startDate + 'T12:00:00'));
                  }
                  setShowAddActivity(true);
                }}
              >
                <LinearGradient
                  colors={['#a855f7', '#ec4899']}
                  style={styles.addButtonGradient}
                >
                  <Ionicons name="add" size={20} color="white" />
                  <Text style={styles.addButtonText}>Ajouter une activité</Text>
                </LinearGradient>
              </TouchableOpacity>

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
                    <View style={styles.activityActions}>
                      <TouchableOpacity onPress={() => openEditActivity(activity)}>
                        <Ionicons name="create-outline" size={20} color="#6b7280" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteActivity(activity.id)}>
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {selectedTab === 'notes' && (
            <View style={styles.section}>
              <View style={styles.addNoteContainer}>
                <TextInput
                  style={styles.noteInput}
                  placeholder="write your note here..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  value={newNoteContent}
                  onChangeText={setNewNoteContent}
                />
                <TouchableOpacity style={styles.addNoteButton} onPress={handleAddNote}>
                  <LinearGradient
                    colors={['#a855f7', '#ec4899']}
                    style={styles.addButtonGradient}
                  >
                    <Ionicons name="add" size={20} color="white" />
                    <Text style={styles.addButtonText}>Add a note</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {trip.notes?.map((note) => (
                <View key={note.id} style={styles.noteCard}>
                  {editingNoteId === note.id ? (
                    <>
                      <TextInput
                        style={styles.noteEditTextInput}
                        value={editedNoteContent}
                        onChangeText={setEditedNoteContent}
                        multiline
                        autoFocus
                      />
                      <View style={styles.noteEditActions}>
                        <TouchableOpacity onPress={cancelEditNote} style={styles.noteEditButton}>
                          <Ionicons name="close-circle-outline" size={24} color="#6b7280" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleUpdateNote} style={styles.noteEditButton}>
                          <Ionicons name="checkmark-circle-outline" size={24} color="#22c55e" />
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.noteHeader}>
                        <Text style={styles.noteDate}>
                          {new Date(note.date).toLocaleDateString('en-EN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                        <View style={styles.noteActions}>
                          <TouchableOpacity onPress={() => openEditNote(note)}>
                            <Ionicons name="create-outline" size={20} color="#6b7280" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteNote(note.id)}>
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={styles.noteContent}>{note.content}</Text>
                    </>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showAddActivity}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingActivity ? 'Modifier' : 'Nouvelle'} Activité
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddActivity(false);
                  setEditingActivity(null);
                  resetActivityForm();
                }}
              >
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Titre *</Text>
              <TextInput
                style={styles.input}
                value={activityTitle}
                onChangeText={setActivityTitle}
                placeholder="Ex: Visite de la Tour Eiffel"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.label}>Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                {(['visit', 'food', 'activity', 'transport', 'accommodation'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeButton, activityType === type && styles.typeButtonActive]}
                    onPress={() => setActivityType(type)}
                  >
                    <Ionicons
                      name={getActivityIcon(type)}
                      size={20}
                      color={activityType === type ? 'white' : '#6b7280'}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Lieu</Text>
              <TextInput
                style={styles.input}
                value={activityLocation}
                onChangeText={setActivityLocation}
                placeholder="Ex: Champ de Mars"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => {
                  if (Platform.OS === 'android') {
                    setShowDatePicker(true);
                  } else {
                    setShowDatePicker(!showDatePicker);
                  }
                }}
              >
                <Ionicons name="calendar-outline" size={20} color="#a855f7" />
                <Text style={styles.datePickerText}>{formatDate(activityDate)}</Text>
                <Ionicons name="chevron-down" size={20} color="#6b7280" />
              </TouchableOpacity>

              {showDatePicker && Platform.OS === 'android' && (
                <DateTimePicker
                  value={activityDate}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}

              {showDatePicker && Platform.OS === 'ios' && (
                <>
                  <DateTimePicker
                    value={activityDate}
                    mode="date"
                    display="spinner"
                    onChange={onDateChange}
                  />
                  <TouchableOpacity
                    style={styles.datePickerDoneButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.datePickerDoneText}>Confirmer</Text>
                  </TouchableOpacity>
                </>
              )}

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={activityDescription}
                onChangeText={setActivityDescription}
                placeholder="Décrivez l'activité..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={editingActivity ? handleUpdateActivity : handleAddActivity}
              >
                <LinearGradient
                  colors={['#a855f7', '#ec4899']}
                  style={styles.submitButtonGradient}
                >
                  <Text style={styles.submitButtonText}>
                    {editingActivity ? 'Modifier' : 'Ajouter'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  favoriteButtonHeader: {
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
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  activityActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  addNoteContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  noteInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  addNoteButton: {
    borderRadius: 12,
    overflow: 'hidden',
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
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 16,
  },
  noteEditTextInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  noteEditActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 8,
  },
  noteEditButton: {
    padding: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  typeButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  typeButtonActive: {
    backgroundColor: '#a855f7',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  datePickerDoneButton: {
    backgroundColor: '#a855f7',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  datePickerDoneText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 24,
    marginBottom: 20,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});