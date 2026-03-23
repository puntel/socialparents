import React from 'react';
import { AuthForm } from '@/components/AuthForm';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-[#1A1C23] px-4 py-8">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-primary-lavender-dark mb-2">Rede Solidária</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">Rede de Apoio</p>
            </div>
            <AuthForm />
        </div>
    );
}
