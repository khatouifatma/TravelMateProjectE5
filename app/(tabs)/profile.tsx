import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { API } from '@/services/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme as useNavTheme } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

interface Trip {
    id: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    image: string;
    photos: string[];
}

export default function ProfileScreen() {
    const router = useRouter();
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { colors } = useNavTheme();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userAvatar, setUserAvatar] = useState<string | null>(null);

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

    const totalTrips = trips.length;
    const totalPhotos = trips.reduce((acc, trip) => acc + (trip.photos?.length || 0), 0);

    const countries = new Set(
        trips
            .map(t => {
                const parts = t.destination.split(',');
                return parts[parts.length - 1]?.trim();
            })
            .filter(country => country && country.length > 0)
    );

    const stats = [
        { label: 'Trips', value: totalTrips.toString(), icon: 'map-outline', colors: ['#ED7868', '#a5bb80'] as const },
        { label: 'Photos', value: totalPhotos.toString(), icon: 'camera', colors: ['#a5bb80', '#b8c994'] as const },
        { label: 'Countries', value: countries.size.toString(), icon: 'globe-outline', colors: ['#ED7868', '#f4a68d'] as const }
    ];

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setUserAvatar(result.assets[0].uri);
        }
    };

    const styles = getStyles(colors);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/*Header*/}
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.headerTitle}>Profile</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#d8e6c2ff" }}
                            thumbColor={theme === 'dark' ? "#a5bb80" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleTheme}
                            value={theme === 'dark'}
                        />
                    </View>

                    {/*Profile card*/}
                    <View style={styles.profileCard}>
                        <View style={styles.profileHeader}>
                            <TouchableOpacity onPress={pickImage}>
                                <View style={styles.avatar}>
                                    {userAvatar ? (
                                        <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
                                    ) : (
                                        <Text style={styles.avatarEmoji}>😎​</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>{user?.name || 'Utilisateur'}</Text>
                                <Text style={styles.profileEmail}>{user?.email || 'email@example.com'}</Text>
                            </View>
                        </View>

                        {/*Stats*/}
                        {isLoading ? (
                            <View style={styles.statsLoading}>
                                <ActivityIndicator size="small" color={colors.primary} />
                            </View>
                        ) : (
                            <View style={styles.statsGrid}>
                                {stats.map((stat, idx) => (
                                    <View key={idx} style={styles.statItem}>
                                        <LinearGradient
                                            colors={stat.colors}
                                            style={styles.statIcon}>
                                            <Ionicons name={stat.icon as any} size={24} color="white" />
                                        </LinearGradient>
                                        <Text style={styles.statValue}>{stat.value}</Text>
                                        <Text style={styles.statLabel}>{stat.label}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/*Content*/}
                <View style={styles.content}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push({
                            pathname: '/modal/edit-profile',
                            params: {
                                name: user?.name || '',
                                email: user?.email || ''
                            }
                        })}
                    >
                        <LinearGradient
                            colors={['#a5bb80', '#b8c994']}
                            style={styles.menuItemIcon}
                        >
                            <Ionicons name='create-outline' size={24} color='white' />
                        </LinearGradient>
                        <View>
                            <Text style={styles.menuItemTitle}>Edit profile</Text>
                            <Text style={styles.menuItemSubTitle}>Change your name, email, etc.</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={async () => {
                            Alert.alert(
                                'Logout',
                                'Are you sure you want to logout ?',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                        text: 'Logout',
                                        style: 'destructive',
                                        onPress: async () => {
                                            await logout();
                                            router.replace('/login');
                                        }
                                    }
                                ]
                            )
                        }}
                    >
                        <LinearGradient
                            colors={['#ef4444', '#f43f5e']}
                            style={styles.menuItemIcon}
                        >
                            <Ionicons name='log-out-outline' size={24} color='white' />
                        </LinearGradient>
                        <View>
                            <Text style={styles.menuItemTitle}>Logout</Text>
                            <Text style={styles.menuItemSubTitle}>Log out of your account</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const getStyles = (colors: { primary: any; background: any; card: any; text: any; border?: string; notification?: string; }) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 128,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        backgroundColor: colors.primary
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 32
    },
    profileCard: {
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 16
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarEmoji: {
        fontSize: 40
    },
    profileInfo: {
        flex: 1
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4
    },
    profileEmail: {
        fontSize: 14,
        color: colors.text
    },
    statsLoading: {
        paddingVertical: 32,
        alignItems: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12
    },
    statItem: {
        flex: 1,
        alignItems: 'center'
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 2
    },
    statLabel: {
        fontSize: 12,
        color: colors.text
    },
    content: {
        padding: 24,
        marginTop: -80,
    },
    menuItem: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    menuItemIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    menuItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4
    },
    menuItemSubTitle: {
        fontSize: 14,
        color: colors.text
    }
});