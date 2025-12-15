import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refreshAuth } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom ne peut pas être vide.');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Remplacer par un véritable appel API pour mettre à jour le profil
      // Exemple: await api.updateProfile({ name });
      console.log(`Sauvegarde du nouveau nom: ${name}`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simule un appel réseau

      // Mettre à jour l'état local de l'authentification
      await refreshAuth();

      Alert.alert('Succès', 'Votre profil a été mis à jour.');
      router.back();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Une erreur est survenue.';
      Alert.alert('Erreur', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.button}>
          <Text style={styles.buttonText}>Annuler</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier le profil</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading}
          style={styles.button}>
          <Text
            style={[
              styles.buttonText,
              styles.buttonSave,
              isLoading && styles.buttonDisabled,
            ]}>
            {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nom complet</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Entrez votre nom complet"
          autoCapitalize="words"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  button: {
    padding: 8,
  },
  buttonText: {
    fontSize: 16,
    color: '#a855f7',
  },
  buttonSave: {
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  form: {
    padding: 24,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
});