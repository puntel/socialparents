'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SavedPost {
    id: string;
    authorName: string;
    authorRole: string;
    categoryName: string;
    categoryColorClass: string;
    content: string;
    tags: string[];
    isSensitive: boolean;
}

interface SavedPostsContextType {
    savedPosts: SavedPost[];
    toggleSave: (post: SavedPost) => void;
    isSaved: (id: string) => boolean;
}

const SavedPostsContext = createContext<SavedPostsContextType>({
    savedPosts: [],
    toggleSave: () => { },
    isSaved: () => false,
});

export function SavedPostsProvider({ children }: { children: ReactNode }) {
    const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);

    const toggleSave = (post: SavedPost) => {
        setSavedPosts(prev => {
            const exists = prev.find(p => p.id === post.id);
            if (exists) {
                return prev.filter(p => p.id !== post.id);
            }
            return [...prev, post];
        });
    };

    const isSaved = (id: string) => savedPosts.some(p => p.id === id);

    return (
        <SavedPostsContext.Provider value={{ savedPosts, toggleSave, isSaved }}>
            {children}
        </SavedPostsContext.Provider>
    );
}

export function useSavedPosts() {
    return useContext(SavedPostsContext);
}
