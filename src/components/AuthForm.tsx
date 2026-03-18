'use client';

import React, { useState } from 'react';

export function AuthForm() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="w-full max-w-md p-8 bg-white dark:bg-[#252830] rounded-3xl shadow-xl">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    {isLogin ? 'Bem-vindo de volta, cuidador.' : 'Junte-se à nossa rodinha.'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {isLogin
                        ? 'Um espaço seguro para trocar vivências e apoio.'
                        : 'Sua jornada é única, mas você não precisa caminhar só.'}
                </p>
            </div>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                {!isLogin && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Como prefere ser chamado?</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1A1C23] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-lavender-dark focus:border-transparent transition-all dark:text-gray-100"
                            placeholder="Seu nome ou apelido"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seu e-mail</label>
                    <input
                        type="email"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1A1C23] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-lavender-dark focus:border-transparent transition-all dark:text-gray-100"
                        placeholder="exemplo@email.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
                    <input
                        type="password"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1A1C23] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-lavender-dark focus:border-transparent transition-all dark:text-gray-100"
                        placeholder="••••••••"
                    />
                    {isLogin && (
                        <div className="mt-2 text-right">
                            <a href="#" className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors">
                                Esqueceu a senha?
                            </a>
                        </div>
                    )}
                </div>

                {!isLogin && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Qual é a sua relação com o diagnóstico?</label>
                        <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1A1C23] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-lavender-dark focus:border-transparent transition-all dark:text-gray-100">
                            <option value="" disabled selected>Selecione uma opção</option>
                            <option value="pai_mae">Pai / Mãe / Responsável</option>
                            <option value="pcd">Pessoa com Deficiência</option>
                            <option value="profissional">Profissional de Saúde/Educação</option>
                            <option value="amigo_familiar">Familiar ou Amigo</option>
                        </select>
                        <p className="mt-2 text-xs text-gray-400">Isso nos ajuda a personalizar seu feed.</p>
                    </div>
                )}

                <button
                    className="w-full py-4 bg-primary-lavender text-primary-lavender-dark font-bold text-lg rounded-xl hover:brightness-95 transition-all mt-4"
                >
                    {isLogin ? 'Entrar no Refúgio' : 'Criar minha conta'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                    {isLogin
                        ? 'Ainda não tem conta? Crie uma aqui.'
                        : 'Já faz parte da rede? Faça login.'}
                </button>
            </div>
        </div>
    );
}
