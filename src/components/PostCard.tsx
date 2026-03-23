'use client';

import React, { useState } from 'react';
import { useSavedPosts } from '@/context/SavedPostsContext';

interface Comment {
    id: string;
    authorName: string;
    content: string;
    createdAt: string;
}

interface PostCardProps {
    id: string;
    authorName: string;
    authorRole: string;
    categoryName: string;
    categoryColorClass: string;
    content: string;
    tags?: string[];
    isSensitive?: boolean;
    subcategoryName?: string;
}

export function PostCard({
    id,
    authorName,
    authorRole,
    categoryName,
    categoryColorClass,
    content,
    tags = [],
    isSensitive = false,
    subcategoryName,
}: PostCardProps) {

    const [supported, setSupported] = useState(false);

    // Comentários
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');

    // Salvos (via Context)
    const { toggleSave, isSaved } = useSavedPosts();
    const saved = isSaved(id);

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        const comment: Comment = {
            id: `c-${Date.now()}`,
            authorName: 'Você',
            content: newComment.trim(),
            createdAt: 'Agora',
        };
        setComments([...comments, comment]);
        setNewComment('');
    };

    const handleToggleSave = () => {
        toggleSave({
            id,
            authorName,
            authorRole,
            categoryName,
            categoryColorClass,
            content,
            tags,
            isSensitive,
        });
    };

    const isMedicalPost = categoryName.toLowerCase() === 'médico' || categoryName.toLowerCase() === 'saúde' || categoryName.toLowerCase() === 'tratamentos';

    return (
        <div className="bg-white dark:bg-[#252830] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6 transition-all overflow-hidden flex flex-col">
            <div className="p-5 flex-1">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-brand-lavender/20 flex items-center justify-center text-brand-lavender font-bold text-lg border border-brand-lavender/30">
                            {authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-semibold text-soft-text dark:text-soft-dark-text leading-tight">{authorName}</h3>
                            <span className="text-xs text-brand-blue/80 dark:text-brand-blue font-medium">{authorRole}</span>
                            <span className="text-xs text-gray-400 ml-2">Há 2 horas</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-bold shadow-sm ${categoryColorClass}`}>
                            {categoryName}
                        </span>
                        {subcategoryName && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                ↳ {subcategoryName}
                            </span>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="relative mb-3">
                    <p className="text-base leading-relaxed text-gray-700 dark:text-gray-200">
                        {content}
                    </p>
                </div>

                {/* Tags */}
                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {tags.map((tag, idx) => (
                            <span key={idx} className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer / Actions */}
                <div className="flex items-center space-x-6 pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => setSupported(!supported)}
                        className={`flex items-center space-x-2 text-sm font-bold transition-transform active:scale-95 ${supported ? 'text-brand-lavender' : 'text-gray-500 hover:text-brand-lavender/80'}`}
                    >
                        <span className="text-lg">{supported ? '🤝' : '🤍'}</span>
                        <span>{supported ? 'Tamo Junto!' : 'Tamo Junto'}</span>
                    </button>
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className={`flex items-center space-x-2 text-sm font-medium transition-colors ${showComments ? 'text-brand-blue' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        <span className="text-lg">💬</span>
                        <span>Comentar{comments.length > 0 ? ` (${comments.length})` : ''}</span>
                    </button>
                    <button
                        onClick={handleToggleSave}
                        className={`flex items-center space-x-2 text-sm font-medium transition-all active:scale-95 ${saved ? 'text-amber-500' : 'text-gray-500 hover:text-amber-400'}`}
                    >
                        <span className="text-lg">{saved ? '🔖' : '🏷️'}</span>
                        <span>{saved ? 'Salvo' : 'Salvar'}</span>
                    </button>
                </div>

                {/* Seção de Comentários */}
                {showComments && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        {comments.length > 0 && (
                            <div className="space-y-3 mb-4">
                                {comments.map((c) => (
                                    <div key={c.id} className="flex items-start space-x-3">
                                        <div className="w-7 h-7 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-xs flex-shrink-0 mt-0.5">
                                            {c.authorName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="bg-gray-50 dark:bg-[#1A1C23] rounded-xl px-3 py-2 flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{c.authorName}</span>
                                                <span className="text-xs text-gray-400">{c.createdAt}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{c.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-start space-x-3">
                            <div className="w-7 h-7 rounded-full bg-brand-lavender/20 flex items-center justify-center text-brand-lavender font-bold text-xs flex-shrink-0 mt-1">
                                V
                            </div>
                            <div className="flex-1 flex items-center bg-gray-50 dark:bg-[#1A1C23] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-brand-blue/50 transition-all">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(); }}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 px-3 py-2.5"
                                    placeholder="Escreva uma palavra de apoio..."
                                />
                                <button
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim()}
                                    className={`px-4 py-2.5 text-sm font-bold transition-colors ${newComment.trim()
                                            ? 'text-brand-blue hover:bg-brand-blue/5'
                                            : 'text-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    Enviar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Medical Disclaimer */}
            {isMedicalPost && (
                <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-start space-x-3">
                    <span className="text-brand-blue text-lg">ℹ️</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                        <strong>Nota da Comunidade:</strong> Este relato é uma experiência pessoal. Sempre consulte um médico especialista antes de alterar tratamentos ou medicações.
                    </p>
                </div>
            )}
        </div>
    );
}
