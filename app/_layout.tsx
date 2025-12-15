import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { UserProvider } from '@/contexts/user-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useOffline } from '@/hooks/use-offline';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

const DEV_BYPASS_AUTH = true;

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { isOnline, pendingCount, isSyncing, syncNow } = useOffline();
  const { isAuthenticated, isLoading, refreshAuth } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // check auth
  useEffect(() => {
    if (DEV_BYPASS_AUTH) {
      console.log('🔧 [DEV MODE] Auth bypassed - accessing app directly');
      return;
    }

    if (isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === '(tabs)' || segments[0] === 'modal';
    const isLoginpage = segments[0] === 'login';

    if (!isAuthenticated && inAuthGroup) {
      return router.replace('/login');
    } else if (isAuthenticated && isLoginpage) {
      return router.replace('/(tabs)');
    } else {
      console.log('✅ [ROUTER] Route access granted');
    }
  }, [segments, isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (DEV_BYPASS_AUTH) {
      return;
    }

    if (segments[0] === '(tabs)' && !isLoading && !isAuthenticated) {
      refreshAuth();
    }
  }, [segments, isLoading, isAuthenticated, router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/*Banner Offline*/}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Ionicons name='cloud-offline-outline' size={16} color='#fff' />
          <Text style={styles.bannerText}>
            Hors ligne {pendingCount > 0 && `• ${pendingCount} en attente`}
          </Text>
        </View>
      )}

      {/* Banner Sync */}
      {isOnline && pendingCount > 0 && (
        <TouchableOpacity 
          style={styles.syncBanner}
          onPress={syncNow}
        >
          <Ionicons
            name={isSyncing ? "sync" : "sync-outline"}
            size={16}
            color="#fff"
          />
          <Text style={styles.bannerText}>
            {isSyncing
              ? 'Synchronisation...'
              : `Synchroniser ${pendingCount} action(s)`}
          </Text>
        </TouchableOpacity>
      )}

      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}



const styles = StyleSheet.create({
  offlineBanner: {
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingTop: 50,
    gap: 8,
  },
  syncBanner: {
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingTop: 50,
    gap: 8,
  },
  bannerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  }
});


export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <RootLayoutContent />
      </UserProvider>
    </AuthProvider>
  );
  
}