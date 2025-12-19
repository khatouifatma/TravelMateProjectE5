import { API } from '@/services/api';
import { auth } from '@/services/auth';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme as useNavTheme } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  roles: string[];
  avatar?: string | null;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors } = useNavTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to load profile');
      }

      const profile: UserProfile = await response.json();
      setOriginalProfile(profile);
      setName(profile.name);
      setEmail(profile.email);
      setAvatar(profile.avatar || null);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Erreur', 'Impossible de charger le profil');
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
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner une image');
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      setIsUploadingAvatar(true);
      const uploadedUrl = await API.uploadImage(uri);
      setAvatar(uploadedUrl);
      Alert.alert('Succès', 'Photo de profil mise à jour');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Erreur', "Impossible d'uploader la photo");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom ne peut pas être vide');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Erreur', 'Veuillez entrer un email valide');
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PATCH',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          avatar: avatar,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update profile');
      }

      Alert.alert('Succès', 'Profil mis à jour avec succès', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      Alert.alert('Erreur', error.message || 'Impossible de mettre à jour le profil');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = () => {
    if (!originalProfile) return false;
    return (
      name !== originalProfile.name ||
      email !== originalProfile.email ||
      avatar !== originalProfile.avatar
    );
  };

  const styles = getStyles(colors);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
  

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color="#9ca3af" />
              </View>
            )}
            {isUploadingAvatar && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color="white" />
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.changePhotoButton} 
            onPress={pickImage}
            disabled={isUploadingAvatar}
          >
            <Ionicons name="camera" size={20} color={colors.primary} />
            <Text style={styles.changePhotoText}>
              {isUploadingAvatar ? 'Upload en cours...' : 'Changer la photo'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom complet</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#6b7280" />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Votre nom"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#6b7280" />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="votre@email.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {originalProfile && (
            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
              <Text style={styles.infoText}>
                Rôle : {originalProfile.roles.join(', ')}
              </Text>
            </View>
          )}
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

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const API_BASE_URL = 'http://localhost:4000';

async function getAuthHeaders(): Promise<HeadersInit> {
  const tokens = await auth.getTokens();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (tokens?.accessToken) {
    headers['Authorization'] = `Bearer ${tokens.accessToken}`;
  }
  
  return headers;
}

const getStyles = (colors: { primary: any; background: any; card: any; text: any; border: any; notification?: string; }) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.border,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  changePhotoText: {
    color: colors.primary,
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
    color: colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: 24,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: colors.primary,
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
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
});