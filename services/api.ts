import { config } from "@/utils/env";
import { auth } from "./auth";
import { OFFLINE } from "./offline";

interface Trip {
    title: string,
    destination: string,
    startDate: string,
    endDate: string,
    description: string,
    image?: string,
    photos?: string[]
}

async function getAuthHeaders(includeContentType: boolean = true): Promise<HeadersInit> {
    const tokens = await auth.getTokens();
    const headers: HeadersInit = {};
    
    if (includeContentType) {
        headers['Content-Type'] = 'application/json';
    }
    
    if (tokens?.accessToken) {
        headers['Authorization'] = `Bearer ${tokens.accessToken}`;
    }
    
    return headers;
}

export const API = {

    async uploadImage(uri: string): Promise<string> {

        const formData = new FormData();

        const filename = uri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append(
            'file',
            {
                uri,
                name: filename,
                type,
            } as any
        );

        const response = await fetch(`${config.mockBackendUrl}/uploads`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Error upload image');
        }

        const data = await response.json();
        console.log('✅ Image uploaded:', data.url);
        return data.url;
    },
    async createTrip(trip: Trip) {

        const isOnline = await OFFLINE.checkIsOnline();

        if (isOnline) {
            try {
                const headers = await getAuthHeaders();
                
                const response = await fetch(`${config.mockBackendUrl}/trips`, {
                    method: 'POST',
                    body: JSON.stringify(trip),
                    headers
                });


                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Erreur création voyage');
                }

                const result = await response.json();
                return result;
                
            } catch (error) {
                throw error;
            }
        } else {
            console.log('Offline: Add to queue');

            await OFFLINE.addToQueue({
                type: 'CREATE',
                endpoint: '/trips',
                method: 'POST',
                payload: trip,
            });

            return {
                ...trip,
                id: `local-${Date.now()}`,
            }
        }
    },

    async updateTrip(id: string, trip: Partial<Trip>) {
        const isOnline = await OFFLINE.checkIsOnline();

        if (isOnline) {
            try {
                const headers = await getAuthHeaders();
                
                
                const response = await fetch(`${config.mockBackendUrl}/trips/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(trip),
                    headers
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Erreur modification voyage');
                }

                const result = await response.json();
                return result;
                
            } catch (error) {
                throw error;
            }
        } else {

            await OFFLINE.addToQueue({
                type: 'UPDATE',
                endpoint: `/trips/${id}`,
                method: 'PUT',
                payload: trip,
            });

            return { ...trip, id };
        }
    },

    async deleteTrip(id: string) {
        const isOnline = await OFFLINE.checkIsOnline();

        if (isOnline) {
            try {
                const headers = await getAuthHeaders();
                
                console.log('🗑️ Deleting trip:', id);
                
                const response = await fetch(`${config.mockBackendUrl}/trips/${id}`, {
                    method: 'DELETE',
                    headers
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Erreur suppression voyage');
                }

                return { success: true };
                
            } catch (error) {
                throw error;
            }
        } else {

            await OFFLINE.addToQueue({
                type: 'DELETE',
                endpoint: `/trips/${id}`,
                method: 'DELETE',
                payload: undefined
            });

            return { success: true };
        }
    },

    async getTrips() {
        const isOnline = await OFFLINE.checkIsOnline();

        if (isOnline) {

            try {
                const headers = await getAuthHeaders();
                
                const response = await fetch(`${config.mockBackendUrl}/trips`, {
                    headers
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch trips');
                }

                const trips = await response.json();
                
                await OFFLINE.cacheTrips(trips);

                return trips;
            } catch (error) {
                console.log('Erreur fetch, utilisation du cache', error);
                const cached = await OFFLINE.getCachedTrips();

                return cached || [];
            }
        } else {
            console.log('Offline, utilisation du cache');
            const cached = await OFFLINE.getCachedTrips();
            return cached || [];
        }
    },

    async getTripById(id: string) {
        const trips = await this.getTrips();
        return trips.find((trip: any) => trip.id === id);
    }
}