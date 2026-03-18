'use client';

import React from 'react';

interface PillCategoryProps {
    label: string;
    colorClass: string;
    onClick?: () => void;
    isActive?: boolean;
}

export function PillCategory({ label, colorClass, onClick, isActive = false }: PillCategoryProps) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-transform active:scale-95 ${isActive ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                } ${colorClass} hover:opacity-90`}
        >
            {label}
        </button>
    );
}
