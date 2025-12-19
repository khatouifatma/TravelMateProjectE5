import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { FavoritesProvider } from '@/contexts/favoris-context';
import { ThemeProvider as AppThemeProvider, useTheme } from '@/contexts/theme-context';
import { UserProvider } from '@/contexts/user-context';
import { useOffline } from '@/hooks/use-offline';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import 'react-native-reanimated';
import { Colors } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const DEV_AUTH_BYPASS = __DEV__;

const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.background,
    text: Colors.light.text,
    border: 'transparent',
  },
};

const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.background,
    text: Colors.dark.text,
    border: 'transparent',
  },
};

function RootLayoutContent() {
  const { theme } = useTheme();
  const { isOnline, pendingCount, isSyncing, syncNow } = useOffline();
  const { isAuthenticated, isLoading, refreshAuth } = useAuth();
  const segments = useSegments();
  const router = useRouter();


  // check auth
  // useEffect(() => {
  //   if (isLoading) {
  //     return;
  //   }
  //   const inAuthGroup = segments[0] === '(tabs)' || segments[0] === 'modal';
  //   const isLoginpage = segments[0] === 'login';
  //   if (!isAuthenticated && inAuthGroup) {
  //     return router.replace('/login');
  //   } else if (isAuthenticated && isLoginpage) {
  //     return router.replace('/(tabs)');

  //   } else {
  //     console.log('✅ [ROUTER] Route access granted');

  //   }

  // }, [segments, isLoading, isAuthenticated, router])


  // useEffect(() => {
  //     if (segments[0] === '(tabs)' && ! isLoading && !isAuthenticated) {
  //     refreshAuth();
  //   }
  // }, [segments, isLoading, isAuthenticated, router])

  useEffect(() => {
  if (isLoading) {
    return;
  }

  // 🔧 DEV MODE — bypass auth
  if (DEV_AUTH_BYPASS) {
    console.log('🔧 [DEV MODE] Auth bypassed - accessing app directly');
    return;
  }

  const inAuthGroup = segments[0] === '(tabs)' || segments[0] === 'modal';
  const isLoginpage = segments[0] === 'login';

  if (!isAuthenticated && inAuthGroup) {
    router.replace('/login');
  } else if (isAuthenticated && isLoginpage) {
    router.replace('/(tabs)');
  } else {
    console.log('✅ [ROUTER] Route access granted');
  }
}, [segments, isLoading, isAuthenticated, router]);

useEffect(() => {
  if (DEV_AUTH_BYPASS) {
    return;
  }

  if (segments[0] === '(tabs)' && !isLoading && !isAuthenticated) {
    refreshAuth();
  }
}, [segments, isLoading, isAuthenticated, router]);


  return (
    <ThemeProvider value={theme === 'dark' ? darkTheme : lightTheme}>
      {/*Banner Offline*/}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Ionicons name='cloud-offline-outline' size={16} color='#fff' />
          <Text style={styles.bannerText}>
            Hors ligne {pendingCount > 0 && `• ${pendingCount} en attente`}
          </Text>
        </View>
      )}

      {/*Banner Sync */}

      {isOnline && pendingCount > 0 && (
        <TouchableOpacity>
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
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
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
        <FavoritesProvider>
          <AppThemeProvider>
            <RootLayoutContent />
          </AppThemeProvider>
        </FavoritesProvider>
      </UserProvider>
    </AuthProvider>
  );
  
}
