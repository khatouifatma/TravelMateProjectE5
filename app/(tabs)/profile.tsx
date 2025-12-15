import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
    const router = useRouter();
    const { logout } = useAuth();
    const { user, updateUser } = useUser();
    const stats = [
        { label: 'Trips', value: '12', icon: 'map-outline', colors: ['#a855f7', '#ec4899'] as const },
        { label: 'Photos', value: '250', icon: 'camera', colors: ['#3b82f6', '#06b6d4'] as const },
        { label: 'Favorites', value: '12', icon: 'heart-outline', colors: ['#ef4444', '#f43f5e'] as const }

    ];

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
    
        if (!result.canceled) {
          updateUser({ avatar: result.assets[0].uri });
        }
    };


    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/*Header*/}
                <LinearGradient
                    colors={['#a855f7', '#ec4899']}
                    style={styles.header}
                >

                    <Text style={styles.headerTitle}>Profile</Text>

                    {/*Profile card*/}

                    <View style={styles.profileCard}>
                        <View style={styles.profileHeader}>
                            <TouchableOpacity onPress={pickImage}>
                                <View style={styles.avatar}>
                                    {user.avatar ? (
                                        <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                                    ) : (
                                        <Text style={styles.avatarEmoji}>😎​</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>{user.name}</Text>
                                <Text style={styles.profileEmail}>{user.email}</Text>
                            </View>
                        </View>
                        {/*Stats*/}
                        <View style={styles.statsGrid}>
                            {
                                stats.map((stat, idx) => (
                                    <View key={idx} style={styles.statItem}>
                                        <LinearGradient
                                            colors={stat.colors}
                                            style={styles.statIcon}>
                                            <Ionicons name={stat.icon as any} size={24} color="white" />
                                        </LinearGradient>
                                        <Text style={styles.statValue}>{stat.value}</Text>
                                        <Text style={styles.statLabel}>{stat.label}</Text>

                                    </View>
                                ))
                            }
                        </View>
                    </View>
                </LinearGradient>


                {/*Content*/}
                <View style={styles.content}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push({ pathname: '/modal/edit-profile', params: { name: user.name, email: user.email } })}
                    >
                        <LinearGradient
                            colors={['#3b82f6', '#06b6d4']}
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
                                'Re you sure you want to logout ?',
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb'
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 128,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 32
    },
    profileCard: {
        backgroundColor: 'white',
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
        backgroundColor: '#faf5ff',
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
        color: '#111827',
        marginBottom: 4
    },
    profileEmail: {
        fontSize: 14,
        color: '#6b7280'
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
        color: '#111827',
        marginBottom: 2
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280'
    },
    content: {
        padding: 24,
        marginTop: -80,
    },
    menuItem: {
        backgroundColor: '#fff',
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
        fontWeight:'600',
        color: '#111827',
        marginBottom: 4
    },
    menuItemSubTitle: {
        fontSize: 16,
        color: '#6b7280'
    }


});