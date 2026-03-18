'use client';

import React from 'react';
import Link from 'next/link';
import { useSavedPosts } from '@/context/SavedPostsContext';
import { PostCard } from '@/components/PostCard';

export default function SalvosPage() {
    const { savedPosts } = useSavedPosts();

    return (
        <div className="min-h-screen bg-brand-bg dark:bg-soft-dark-bg">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white dark:bg-[#1A1C23] border-b border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="text-gray-500 hover:text-brand-blue transition-colors text-xl">
                            ←
                        </Link>
                        <h1 className="text-xl font-black text-brand-blue">Posts Salvos</h1>
                    </div>
                    <span className="text-sm text-gray-400 font-medium">
                        {savedPosts.length} {savedPosts.length === 1 ? 'post salvo' : 'posts salvos'}
                    </span>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-4 py-8">
                {savedPosts.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-[#252830] rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                        <span className="text-5xl mb-4 block">🔖</span>
                        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">Nenhum post salvo ainda</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                            Quando você encontrar relatos que te ajudam, clique em &ldquo;Salvar&rdquo; para guardar aqui e acessar depois.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center px-6 py-3 bg-brand-blue text-white font-bold rounded-full hover:brightness-110 transition-all shadow-sm"
                        >
                            ← Voltar ao Feed
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {savedPosts.map(post => (
                            <PostCard
                                key={post.id}
                                id={post.id}
                                authorName={post.authorName}
                                authorRole={post.authorRole}
                                categoryName={post.categoryName}
                                categoryColorClass={post.categoryColorClass}
                                content={post.content}
                                tags={post.tags}
                                isSensitive={post.isSensitive}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
