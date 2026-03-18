'use client';

import { SavedPostsProvider } from '@/context/SavedPostsContext';
import { FloatingSOSButton } from '@/components/FloatingSOSButton';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <SavedPostsProvider>
            {children}
            <FloatingSOSButton />
        </SavedPostsProvider>
    );
}
