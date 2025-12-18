import { API } from '@/services/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
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

interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
  image: string;
  photos: string[];
}

export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [originalTrip, setOriginalTrip] = useState<Trip | null>(null);
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    loadTrip();
  }, [id]);

  const loadTrip = async () => {
    try {
      setIsLoading(true);
      const tripData = await API.getTripById(id);

      if (!tripData) {
        Alert.alert('Erreur', 'Voyage introuvable');
        router.back();
        return;
      }

      const tripEndDate = new Date(tripData.endDate);
      const now = new Date();
      
      if (tripEndDate < now) {
        Alert.alert(
          'Modification impossible',
          'Ce voyage est terminé et ne peut plus être modifié',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
        return;
      }

      setOriginalTrip(tripData);
      setTitle(tripData.title);
      setDestination(tripData.destination);
      setStartDate(new Date(tripData.startDate));
      setEndDate(new Date(tripData.endDate));
      setDescription(tripData.description || '');
      setImage(tripData.image);
    } catch (error) {
      console.error('Error loading trip:', error);
      Alert.alert('Erreur', 'Impossible de charger le voyage');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Nous avons besoin de votre permission pour accéder à vos photos'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner une image');
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setIsUploadingImage(true);
      const uploadedUrl = await API.uploadImage(uri);
      setImage(uploadedUrl);
      Alert.alert('Succès', 'Image mise à jour');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Erreur', "Impossible d'uploader l'image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return;
    }

    if (!destination.trim()) {
      Alert.alert('Erreur', 'La destination est obligatoire');
      return;
    }

    if (startDate > endDate) {
      Alert.alert('Erreur', 'La date de début doit être avant la date de fin');
      return;
    }

    const now = new Date();
    if (endDate < now) {
      Alert.alert('Erreur', 'La date de fin ne peut pas être dans le passé');
      return;
    }

    try {
      setIsSaving(true);

      const updatedTrip = {
        title: title.trim(),
        destination: destination.trim(),
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        description: description.trim(),
        image: image,
      };

      await API.updateTrip(id, updatedTrip);

      Alert.alert('Succès', 'Voyage modifié avec succès', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Error updating trip:', error);
      
      if (error.message.includes('past trip')) {
        Alert.alert(
          'Modification impossible',
          'Ce voyage est terminé et ne peut plus être modifié'
        );
      } else {
        Alert.alert('Erreur', error.message || 'Impossible de modifier le voyage');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = () => {
    if (!originalTrip) return false;
    return (
      title !== originalTrip.title ||
      destination !== originalTrip.destination ||
      startDate.toISOString().split('T')[0] !== originalTrip.startDate ||
      endDate.toISOString().split('T')[0] !== originalTrip.endDate ||
      description !== (originalTrip.description || '') ||
      image !== originalTrip.image
    );
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setStartDate(selectedDate);
      }
    } else {
      if (selectedDate) {
        setStartDate(selectedDate);
      }
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setEndDate(selectedDate);
      }
    } else {
      if (selectedDate) {
        setEndDate(selectedDate);
      }
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ED7868" />
          <Text style={styles.loadingText}>Chargement du voyage...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>


      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            <Image
              source={
                image.startsWith('http')
                  ? { uri: image }
                  : IMAGES_SOURCES[image as keyof typeof IMAGES_SOURCES] || IMAGES_SOURCES.paris
              }
              style={styles.tripImage}
            />
            {isUploadingImage && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color="white" />
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={pickImage}
            disabled={isUploadingImage}
          >
            <Ionicons name="camera" size={20} color="#ED7868" />
            <Text style={styles.changeImageText}>
              {isUploadingImage ? 'Upload en cours...' : "Changer l'image"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titre du voyage *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="text-outline" size={20} color="#6b7280" />
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Ex: Vacances à Paris"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Destination *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color="#6b7280" />
              <TextInput
                style={styles.input}
                value={destination}
                onChangeText={setDestination}
                placeholder="Ex: Paris, France"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateGroup}>
              <Text style={styles.label}>Date de début *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  if (Platform.OS === 'android') {
                    setShowStartDatePicker(true);
                  } else {
                    setShowStartDatePicker(!showStartDatePicker);
                  }
                }}
              >
                <Ionicons name="calendar-outline" size={20} color="#ED7868" />
                <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
              </TouchableOpacity>

              {showStartDatePicker && Platform.OS === 'android' && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={onStartDateChange}
                  minimumDate={new Date()}
                />
              )}

              {showStartDatePicker && Platform.OS === 'ios' && (
                <>
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="spinner"
                    onChange={onStartDateChange}
                    minimumDate={new Date()}
                  />
                  <TouchableOpacity
                    style={styles.datePickerDoneButton}
                    onPress={() => setShowStartDatePicker(false)}
                  >
                    <Text style={styles.datePickerDoneText}>Confirmer</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <View style={styles.dateGroup}>
              <Text style={styles.label}>Date de fin *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  if (Platform.OS === 'android') {
                    setShowEndDatePicker(true);
                  } else {
                    setShowEndDatePicker(!showEndDatePicker);
                  }
                }}
              >
                <Ionicons name="calendar-outline" size={20} color="#ED7868" />
                <Text style={styles.dateButtonText}>{formatDate(endDate)}</Text>
              </TouchableOpacity>

              {showEndDatePicker && Platform.OS === 'android' && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  onChange={onEndDateChange}
                  minimumDate={startDate}
                />
              )}

              {showEndDatePicker && Platform.OS === 'ios' && (
                <>
                  <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="spinner"
                    onChange={onEndDateChange}
                    minimumDate={startDate}
                  />
                  <TouchableOpacity
                    style={styles.datePickerDoneButton}
                    onPress={() => setShowEndDatePicker(false)}
                  >
                    <Text style={styles.datePickerDoneText}>Confirmer</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <Ionicons name="document-text-outline" size={20} color="#6b7280" style={styles.textAreaIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Décrivez votre voyage..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#3b82f6" />
            <Text style={styles.infoText}>
              Les voyages passés ne peuvent pas être modifiés
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (!hasChanges() || isSaving) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!hasChanges() || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={24} color="white" />
              <Text style={styles.saveButtonText}>
                {hasChanges() ? 'Enregistrer les modifications' : 'Aucune modification'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
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
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    width: '90%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tripImage: {
    width: '100%',
    height: '100%',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fef5f3',
    borderWidth: 1,
    borderColor: '#ED7868',
  },
  changeImageText: {
    color: '#ED7868',
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    paddingHorizontal: 24,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textAreaIcon: {
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateGroup: {
    flex: 1,
    gap: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  datePickerDoneButton: {
    backgroundColor: '#ED7868',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  datePickerDoneText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ED7868',
    marginHorizontal: 24,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#ED7868',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 12,
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
});