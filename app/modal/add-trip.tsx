import { API } from "@/services/api";
import { auth } from "@/services/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    FlatList,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface LocationSuggestion {
  city: string;
  country: string;
  fullName: string;
  lat: number;
  lng: number;
}

export default function AddTripModal() {
    const router = useRouter();
    const [tripTitle, setTripTitle] = useState("");
    const [destination, setDestination] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [description, setDescription] = useState("");
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });

    const commonCities: LocationSuggestion[] = [
      { city: "Paris", country: "France", fullName: "Paris, France", lat: 48.8566, lng: 2.3522 },
      { city: "London", country: "United Kingdom", fullName: "London, United Kingdom", lat: 51.5074, lng: -0.1278 },
      { city: "New York", country: "United States", fullName: "New York, United States", lat: 40.7128, lng: -74.0060 },
      { city: "Tokyo", country: "Japan", fullName: "Tokyo, Japan", lat: 35.6762, lng: 139.6503 },
      { city: "Barcelona", country: "Spain", fullName: "Barcelona, Spain", lat: 41.3874, lng: 2.1686 },
      { city: "Rome", country: "Italy", fullName: "Rome, Italy", lat: 41.9028, lng: 12.4964 },
      { city: "Dubai", country: "United Arab Emirates", fullName: "Dubai, United Arab Emirates", lat: 25.2048, lng: 55.2708 },
      { city: "Sydney", country: "Australia", fullName: "Sydney, Australia", lat: -33.8688, lng: 151.2093 },
      { city: "Bangkok", country: "Thailand", fullName: "Bangkok, Thailand", lat: 13.7563, lng: 100.5018 },
      { city: "Amsterdam", country: "Netherlands", fullName: "Amsterdam, Netherlands", lat: 52.3676, lng: 4.9041 },
      { city: "Berlin", country: "Germany", fullName: "Berlin, Germany", lat: 52.5200, lng: 13.4050 },
      { city: "Madrid", country: "Spain", fullName: "Madrid, Spain", lat: 40.4168, lng: -3.7038 },
      { city: "Lisbon", country: "Portugal", fullName: "Lisbon, Portugal", lat: 38.7223, lng: -9.1393 },
      { city: "Prague", country: "Czech Republic", fullName: "Prague, Czech Republic", lat: 50.0755, lng: 14.4378 },
      { city: "Vienna", country: "Austria", fullName: "Vienna, Austria", lat: 48.2082, lng: 16.3738 },
      { city: "Istanbul", country: "Turkey", fullName: "Istanbul, Turkey", lat: 41.0082, lng: 28.9784 },
      { city: "Singapore", country: "Singapore", fullName: "Singapore, Singapore", lat: 1.3521, lng: 103.8198 },
      { city: "Hong Kong", country: "China", fullName: "Hong Kong, China", lat: 22.3193, lng: 114.1694 },
      { city: "Los Angeles", country: "United States", fullName: "Los Angeles, United States", lat: 34.0522, lng: -118.2437 },
      { city: "Miami", country: "United States", fullName: "Miami, United States", lat: 25.7617, lng: -80.1918 },
      { city: "Bali", country: "Indonesia", fullName: "Bali, Indonesia", lat: -8.3405, lng: 115.0920 },
      { city: "Strasbourg", country: "France", fullName: "Strasbourg, France", lat: 48.5734, lng: 7.7521 },
      { city: "Lyon", country: "France", fullName: "Lyon, France", lat: 45.7640, lng: 4.8357 },
      { city: "Marseille", country: "France", fullName: "Marseille, France", lat: 43.2965, lng: 5.3698 },
      { city: "Nice", country: "France", fullName: "Nice, France", lat: 43.7102, lng: 7.2620 },
    ];

    const searchDestination = (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoadingSuggestions(true);
      const lowerQuery = query.toLowerCase();
      
      const filtered = commonCities.filter(city => 
        city.city.toLowerCase().includes(lowerQuery) || 
        city.country.toLowerCase().includes(lowerQuery) ||
        city.fullName.toLowerCase().includes(lowerQuery)
      ).slice(0, 5);

      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setIsLoadingSuggestions(false);
    };

    const selectDestination = (suggestion: LocationSuggestion) => {
      setDestination(suggestion.fullName);
      setCoordinates({ lat: suggestion.lat, lng: suggestion.lng });
      setShowSuggestions(false);
      console.log('📍 Selected destination:', suggestion.fullName, 'Coordinates:', { lat: suggestion.lat, lng: suggestion.lng });
    };

    const handleDestinationChange = (text: string) => {
      setDestination(text);
      searchDestination(text);
    };

    const openAppSettings = () => {
        Linking.openSettings();
    };

    const showPermissionAlert = (title: string, message: string) => {
        Alert.alert(title, message, [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Ouvrir les paramètres', onPress: openAppSettings },
        ]);
    };

    const showSimulatorAlert = (feature: string) => {
        Alert.alert('Fonctionnalité non disponible', 
            `La fonctionnalité "${feature}" n'est pas disponible sur un simulateur. Veuillez utiliser un appareil réel pour y accéder.`,
            [{ text: 'D\'accord', style: 'cancel' }]
        );
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                showPermissionAlert('Permission Galerie refusée', 'Nous avons besoin de l\'accès à vos photos pour sélectionner des images.');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsMultipleSelection: true,
                quality: 1,
            });

            if (!result.canceled) {
                const selectedUris = result.assets.map(asset => asset.uri);
                setSelectedImages(prevImages => [...prevImages, ...selectedUris]);
            }
        } catch (error) {
            console.error("Error picking image: ", error);
            showSimulatorAlert('Galerie');
        }
    };

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                showPermissionAlert('Permission refusée', 'Nous avons besoin de l\'accès à la caméra pour prendre des photos.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [16, 9],
                quality: 1,
            });

            if (!result.canceled) {
                const photoUri = result.assets[0].uri;
                setSelectedImages(prevImages => [...prevImages, photoUri]);
            }
        } catch (error) {
            console.log("Error taking photo: ", error);
            showSimulatorAlert('Camera');
        }
    };

    const getLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                showPermissionAlert('Permission Localisation refusée', 'Nous avons besoin de l\'accès à votre localisation pour obtenir votre position actuelle.');
                return;
            }
            const location = await Location.getCurrentPositionAsync({});
            
            
            const address = await Location.reverseGeocodeAsync(location.coords);
            
            if (address.length > 0) {
                const addr = address[0];
                const city = addr.city || addr.name || '';
                const country = addr.country || '';
                const formattedAddress = `${city}${city && country ? ', ' : ''}${country}`.trim();
                setDestination(formattedAddress);
                
                setCoordinates({
                    lat: location.coords.latitude,
                    lng: location.coords.longitude
                });
                
   
            }
        } catch (error) {
            showSimulatorAlert('Localisation');
        }
    };
    
    const uploadImages = async (): Promise<{ photos: string[], coverImage: string }> => {
        const uploadedPhotos: string[] = [];
        let coverImage = "";

        if (selectedImages.length > 0) {
            const totalImages = selectedImages.length;

            for (let i = 0; i < selectedImages.length; i++) {
                const imageUri = selectedImages[i];
                const uploadedUrl = await API.uploadImage(imageUri);
                uploadedPhotos.push(uploadedUrl);

                if (i === 0) {
                    coverImage = uploadedUrl;
                }

                const progress = Math.round(((i + 1) / totalImages) * 100);
                setUploadProgress(progress);
            }
        }

        return { photos: uploadedPhotos, coverImage };
    };

    const formatDate = (date: Date | null): string => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const validateForm = (): boolean => {
        if (!tripTitle.trim()) {
            Alert.alert('Erreur', 'Veuillez entrer un titre pour le voyage');
            return false;
        }
        if (!destination.trim()) {
            Alert.alert('Erreur', 'Veuillez entrer une destination');
            return false;
        }
        if (!startDate) {
            Alert.alert('Erreur', 'Veuillez sélectionner une date de départ');
            return false;
        }
        if (!endDate) {
            Alert.alert('Erreur', 'Veuillez sélectionner une date de retour');
            return false;
        }
        if (endDate < startDate) {
            Alert.alert('Erreur', 'La date de retour doit être après la date de départ');
            return false;
        }
        if (selectedImages.length === 0) {
            Alert.alert('Erreur', 'Veuillez ajouter au moins une photo');
            return false;
        }
        return true;
    };

    const handleSaveTrip = async () => {
        if (!validateForm()) return;

        const isAuth = await auth.isAuthenticated();
        if (!isAuth) {
            return;
        }

        try {
            setIsUploading(true);
            setUploadProgress(0);

            const { photos, coverImage } = await uploadImages();

            const trip = {
                title: tripTitle,
                destination,
                startDate: formatDate(startDate),
                endDate: formatDate(endDate),
                description,
                image: coverImage,
                photos: photos,
                location: coordinates
            };


            const newTrip = await API.createTrip(trip);

            setIsUploading(false);

            setTimeout(() => {
                Alert.alert(
                    'Succès',
                    'Votre voyage a été créé !',
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            }, 500);

        } catch (error) {
            setIsUploading(false);
            Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de créer le voyage');
        }
    };

    const onStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartDatePicker(false);
        if (selectedDate) {
            setStartDate(selectedDate);
        }
    };

    const onEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndDatePicker(false);
        if (selectedDate) {
            setEndDate(selectedDate);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <Text style={styles.title}>Ajouter un voyage</Text>
            <ScrollView keyboardShouldPersistTaps="handled">
                <View style={styles.section}>
                    <Text style={styles.label}>Photo de couverture</Text>
                    <View style={styles.photoUpload}>
                        <View style={styles.photoButtons}>
                            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                                <Ionicons name="camera" size={32} color="#ED7868" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                                <Ionicons name="image" size={32} color="#a5bb80" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.photoText}>Prendre une photo ou choisir depuis la galerie</Text>
                        {selectedImages.length > 0 && (
                            <Text style={styles.photoCount}>{selectedImages.length} photo(s) sélectionnée(s)</Text>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Titre du voyage</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Vacances à Paris"
                        value={tripTitle}
                        onChangeText={setTripTitle}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Destination</Text>
                    <View style={styles.inputWithIcon}>
                        <Ionicons name="location-outline" size={16} color="#6b7280" />
                        <TextInput
                            style={styles.inputFlex}
                            placeholder="Tapez une ville (ex: Paris)"
                            value={destination}
                            onChangeText={handleDestinationChange}
                            onFocus={() => {
                              if (destination.length >= 2) {
                                searchDestination(destination);
                              }
                            }}
                        />
                        <TouchableOpacity onPress={getLocation}>
                            <Ionicons name="navigate" size={20} color="#a5bb80" />
                        </TouchableOpacity>
                    </View>
                    
                    {showSuggestions && (
                      <View style={styles.suggestionsContainer}>
                        {isLoadingSuggestions ? (
                          <Text style={styles.suggestionText}>Chargement...</Text>
                        ) : (
                          <FlatList
                            data={suggestions}
                            keyExtractor={(item) => item.fullName}
                            renderItem={({ item }) => (
                              <TouchableOpacity
                                style={styles.suggestionItem}
                                onPress={() => selectDestination(item)}
                              >
                                <Ionicons name="location" size={16} color="#ED7868" />
                                <View style={styles.suggestionTextContainer}>
                                  <Text style={styles.suggestionCity}>{item.city}</Text>
                                  <Text style={styles.suggestionCountry}>{item.country}</Text>
                                </View>
                              </TouchableOpacity>
                            )}
                            scrollEnabled={false}
                          />
                        )}
                      </View>
                    )}
                    
                    <Text style={styles.hint}>💡 Utilisez la géolocalisation ou recherchez une ville</Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.dateRow}>
                        <View style={styles.dateColumn}>
                            <Text style={styles.label}>Date de départ</Text>
                            <TouchableOpacity 
                                style={styles.inputWithIcon}
                                onPress={() => setShowStartDatePicker(true)}
                            >
                                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                                <Text style={[styles.dateText, !startDate && styles.placeholderText]}>
                                    {startDate ? formatDate(startDate) : "JJ/MM/AAAA"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dateColumn}>
                            <Text style={styles.label}>Date de retour</Text>
                            <TouchableOpacity 
                                style={styles.inputWithIcon}
                                onPress={() => setShowEndDatePicker(true)}
                            >
                                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                                <Text style={[styles.dateText, !endDate && styles.placeholderText]}>
                                    {endDate ? formatDate(endDate) : "JJ/MM/AAAA"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {showStartDatePicker && (
                    <DateTimePicker
                        value={startDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={onStartDateChange}
                        minimumDate={new Date()}
                    />
                )}

                {showEndDatePicker && (
                    <DateTimePicker
                        value={endDate || startDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={onEndDateChange}
                        minimumDate={startDate || new Date()}
                    />
                )}

                <View style={styles.section}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Décrivez votre voyage..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        placeholderTextColor="#9ca3af"
                    />
                </View>

                {isUploading && (
                    <View style={styles.progressCard}>
                        <View style={styles.progressHeader}>
                            <View style={styles.progressInfo}>
                                <Ionicons name="cloud-upload-outline" size={24} color="#ED7868" />
                                <Text style={styles.progressText}>Téléchargement en cours...</Text>
                            </View>
                            <Text style={styles.progressPercent}>{uploadProgress}%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
                        </View>
                    </View>
                )}

                <TouchableOpacity 
                    style={[styles.saveButton, isUploading && styles.saveButtonDisabled]}
                    onPress={handleSaveTrip}
                    disabled={isUploading}
                >
                    <Text style={styles.saveButtonText}>
                        {isUploading ? 'Enregistrement...' : 'Créer le voyage'}
                    </Text>
                </TouchableOpacity>
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#111827'
    },
    section: {
        marginBottom: 24,
        position: 'relative',
        zIndex: 1,
    },
    label: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 8,
        fontWeight: '600'
    },
    photoUpload: {
        backgroundColor: '#fef8f7',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#f5d5cf',
        paddingVertical: 20,
    },
    photoButtons: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    photoButton: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    photoText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },
    photoCount: {
        fontSize: 12,
        color: '#a5bb80',
        marginTop: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#111827',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 2,
        borderColor: 'transparent',
        gap: 12
    },
    inputFlex: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    dateText: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    placeholderText: {
        color: '#9ca3af',
    },
    hint: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 8
    },
    dateRow: {
        flexDirection: 'row',
        gap: 12,
    },
    dateColumn: {
        flex: 1,
    },
    textArea: {
        height: 100,
        paddingTop: 12,
    },
    progressCard: {
        backgroundColor: '#fef8f7',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    progressInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    progressText: {
        fontSize: 14,
        color: '#111827'
    },
    progressPercent: {
        fontSize: 14,
        color: '#ED7868',
        fontWeight: '600'
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#f5d5cf',
        borderRadius: 4,
        overflow: 'hidden'
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#ED7868',
    },
    saveButton: {
        backgroundColor: '#ED7868',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    suggestionsContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        maxHeight: 200,
        zIndex: 1000,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        gap: 12,
    },
    suggestionTextContainer: {
        flex: 1,
    },
    suggestionCity: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '600',
    },
    suggestionCountry: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    suggestionText: {
        padding: 12,
        textAlign: 'center',
        color: '#6b7280',
    },
});