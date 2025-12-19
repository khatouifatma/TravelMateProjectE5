import React, { createContext, ReactNode, useContext, useState } from 'react';

interface FavoritesContextType {
  favorites: Set<string>;
  toggleFavorite: (tripId: string) => void;
  isFavorite: (tripId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (tripId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(tripId)) {
        newFavorites.delete(tripId);
      } else {
        newFavorites.add(tripId);
      }
      return newFavorites;
    });
  };

  const isFavorite = (tripId: string) => {
    return favorites.has(tripId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}