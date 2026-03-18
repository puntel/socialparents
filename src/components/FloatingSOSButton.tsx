'use client';

import React, { useState } from 'react';

export function FloatingSOSButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Botão Flutuante */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-red-400 hover:bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-transform hover:scale-105 z-50 focus:outline-none focus:ring-4 focus:ring-red-300"
                aria-label="Botão de Acolhimento"
            >
                ❤️‍🩹
            </button>

            {/* Modal de Acolhimento */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1A1C23] rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-fade-in-up">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            ✕
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                                🫂
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                                Você não está só.
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Sabemos que o cansaço às vezes transborda. Como podemos te apoiar agora?
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button className="w-full py-3 bg-red-400 text-white rounded-xl font-medium hover:bg-red-500 transition-colors shadow-sm">
                                Preciso desabafar com a rede
                            </button>
                            <button className="w-full py-3 bg-primary-lavender text-primary-lavender-dark rounded-xl font-medium hover:brightness-95 transition-all">
                                Ligar para o CVV (188)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
