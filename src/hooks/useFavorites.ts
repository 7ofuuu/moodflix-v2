'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/auth-client';
import { useAuth } from '@/hooks/useAuth';

export function useFavorites() {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchFavorites() {
            if (!user) {
                setFavorites([]);
                setIsLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('user_favorites')
                .select('movie_id')
                .eq('user_id', user.id);

            if (!error && data) {
                setFavorites(data.map((f) => f.movie_id));
            }

            setIsLoading(false);
        }

        fetchFavorites();
    }, [user]);

    const toggleFavorite = async (movieId: number) => {
        if (!user) return;

        const isFavorited = favorites.includes(movieId);

        if (isFavorited) {
            await supabase
                .from('user_favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('movie_id', movieId);

            setFavorites((prev) => prev.filter((id) => id !== movieId));
        } else {
            await supabase
                .from('user_favorites')
                .insert({ user_id: user.id, movie_id: movieId });

            setFavorites((prev) => [...prev, movieId]);
        }
    };

    return { favorites, isLoading, toggleFavorite };
}