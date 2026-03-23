'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PostCard } from '@/components/PostCard';
import { createClient } from '@/utils/supabase/client';
import type { CategoryWithSubcats, Post } from '@/types/database';

// Paleta de cores disponíveis para novas categorias
const CATEGORY_COLORS = [
  { name: 'Verde', colorClass: 'bg-cat-medical/20 text-[#2B774E]' },
  { name: 'Roxo', colorClass: 'bg-cat-psycho/20 text-[#6B3482]' },
  { name: 'Laranja', colorClass: 'bg-cat-rights/30 text-[#A67D3A]' },
  { name: 'Azul', colorClass: 'bg-cat-vent/30 text-[#2B6082]' },
  { name: 'Rosa', colorClass: 'bg-pink-100 text-pink-700' },
  { name: 'Índigo', colorClass: 'bg-indigo-100 text-indigo-700' },
  { name: 'Amarelo', colorClass: 'bg-amber-100 text-amber-700' },
  { name: 'Cinza', colorClass: 'bg-gray-200 text-gray-700' },
];

export default function Home() {
  const supabase = createClient();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [postCategory, setPostCategory] = useState<string>('');
  const [postCategoryId, setPostCategoryId] = useState<string>('');
  const [postCategoryColor, setPostCategoryColor] = useState<string>('');
  const [postSubcategory, setPostSubcategory] = useState<string>('');
  const [postSubcategoryId, setPostSubcategoryId] = useState<string>('');

  const [postContent, setPostContent] = useState<string>('');

  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 5;

  const [isMaster, setIsMaster] = useState(false);

  // ─── Data from Supabase ───────────────────────────────────────────
  const [categories, setCategories] = useState<CategoryWithSubcats[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingCats, setIsLoadingCats] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  const fetchCategories = useCallback(async () => {
    setIsLoadingCats(true);
    const { data: cats } = await supabase
      .from('categories')
      .select('*, subcategories(*)')
      .order('created_at', { ascending: true });
    setCategories((cats ?? []) as CategoryWithSubcats[]);
    setIsLoadingCats(false);
  }, []);

  const fetchPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    setPosts((data as Post[]) ?? []);
    setIsLoadingPosts(false);
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, [fetchCategories, fetchPosts]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeSubcategory]);

  // ─── Category Modal (New) ─────────────────────────────────────────
  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(CATEGORY_COLORS[0].colorClass);

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    const { error } = await supabase
      .from('categories')
      .insert({ label: newCatName.trim(), color_class: newCatColor });
    if (error) {
      alert(`Erro Categoria: ${error.message}`);
      return;
    }
    await fetchCategories();
    setNewCatName('');
    setNewCatColor(CATEGORY_COLORS[0].colorClass);
    setShowNewCatModal(false);
  };

  // ─── Category Modal (Edit) ────────────────────────────────────────
  const [editingCat, setEditingCat] = useState<CategoryWithSubcats | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatColor, setEditCatColor] = useState('');
  const [editSubcategories, setEditSubcategories] = useState<{ id: string; label: string }[]>([]);
  const [newSubcatName, setNewSubcatName] = useState('');

  const openEditModal = (cat: CategoryWithSubcats) => {
    setEditingCat(cat);
    setEditCatName(cat.label);
    setEditCatColor(cat.color_class);
    setEditSubcategories(cat.subcategories || []);
    setNewSubcatName('');
  };

  const handleAddSubcategory = () => {
    if (!newSubcatName.trim()) return;
    setEditSubcategories([...editSubcategories, { id: `temp-${Date.now()}`, label: newSubcatName.trim() }]);
    setNewSubcatName('');
  };

  const handleRemoveSubcategory = (id: string) => {
    setEditSubcategories(editSubcategories.filter(s => s.id !== id));
  };

  const handleEditCategory = async () => {
    if (!editingCat || !editCatName.trim()) return;
    const oldLabel = editingCat.label;

    // Update category in DB
    const { error: updateErr } = await supabase
      .from('categories')
      .update({ label: editCatName.trim(), color_class: editCatColor })
      .eq('id', editingCat.id);

    if (updateErr) {
      alert(`Erro ao atualizar categoria: ${updateErr.message}`);
      return;
    }

    // Sync subcategories without mass-deleting to preserve FOREIGN KEY references
    const originalSubcats = editingCat.subcategories || [];
    
    // 1. Delete removed subcats
    const editSubcatIds = editSubcategories.map(s => s.id);
    const toDelete = originalSubcats.filter(s => !editSubcatIds.includes(s.id));
    if (toDelete.length > 0) {
      const { error: delErr } = await supabase.from('subcategories').delete().in('id', toDelete.map(s => s.id));
      if (delErr) console.error('Erro deletar subcat', delErr);
    }

    // 2. Update existing subcats that changed
    const toUpdate = editSubcategories.filter(s => !s.id.startsWith('temp-') && s.label.trim() !== originalSubcats.find(o => o.id === s.id)?.label);
    for (const sub of toUpdate) {
      const { error: updErr } = await supabase.from('subcategories').update({ label: sub.label.trim() }).eq('id', sub.id);
      if (updErr) console.error('Erro atualizar subcat', updErr);
      else await supabase.from('posts').update({ subcategory_name: sub.label.trim() }).eq('subcategory_id', sub.id);
    }

    // 3. Insert new subcats
    const toInsert = editSubcategories
      .filter(s => s.id.startsWith('temp-') && s.label.trim())
      .map(s => ({ category_id: editingCat.id, label: s.label.trim() }));
    if (toInsert.length > 0) {
      const { error: insErr } = await supabase.from('subcategories').insert(toInsert);
      if (insErr) console.error('Erro inserir subcat', insErr);
    }

    // Update posts that referenced the old category label
    if (oldLabel !== editCatName.trim()) {
      await supabase
        .from('posts')
        .update({ category_name: editCatName.trim(), color_class: editCatColor })
        .eq('category_name', oldLabel);
      if (activeCategory === oldLabel) setActiveCategory(editCatName.trim());
    }

    await fetchCategories();
    await fetchPosts();
    setEditingCat(null);
  };

  const handleDeleteCategory = async (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;
    if (activeCategory === cat.label) {
      setActiveCategory(null);
      setActiveSubcategory(null);
    }
    const { error } = await supabase.from('categories').delete().eq('id', catId);
    if (error) {
      alert(`Erro Excluir: ${error.message}`);
      return;
    }
    await fetchCategories();
  };

  // ─── Sorting ──────────────────────────────────────────────────────
  type SortFilter = 'recentes' | 'comentados' | 'salvos' | 'apoiados';
  const [sortFilter, setSortFilter] = useState<SortFilter>('recentes');

  const SORT_OPTIONS: { key: SortFilter; label: string; icon: string }[] = [
    { key: 'recentes', label: 'Mais Recentes', icon: '🕐' },
    { key: 'comentados', label: 'Mais Comentados', icon: '💬' },
    { key: 'salvos', label: 'Mais Salvos', icon: '🔖' },
    { key: 'apoiados', label: 'Mais Apoiados', icon: '🤝' },
  ];

  // ─── Filter + Sort ────────────────────────────────────────────────
  const filteredAndSortedPosts = (() => {
    let result = activeCategory
      ? posts.filter(p => p.category_name === activeCategory)
      : posts;

    if (activeSubcategory) {
      result = result.filter(p => p.subcategory_name === activeSubcategory);
    }

    const sorted = [...result];
    switch (sortFilter) {
      case 'recentes':
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'comentados':
        sorted.sort((a, b) => b.comment_count - a.comment_count);
        break;
      case 'salvos':
        sorted.sort((a, b) => b.save_count - a.save_count);
        break;
      case 'apoiados':
        sorted.sort((a, b) => b.support_count - a.support_count);
        break;
    }
    return sorted;
  })();

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedPosts.length / POSTS_PER_PAGE));
  const paginatedPosts = filteredAndSortedPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const getCategoryColorClass = (catLabel: string) => {
    const found = categories.find(c => c.label === catLabel);
    return found ? found.color_class : 'bg-gray-200 text-gray-700';
  };

  // ─── Publish Post ─────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!postContent.trim() || !postCategory) return;

    const newTags: string[] = [];
    if (postSubcategory) newTags.push(postSubcategory);

    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_name: 'Você',
        author_role: 'Membro da Rede',
        category_id: postCategoryId || null,
        category_name: postCategory,
        subcategory_id: postSubcategoryId || null,
        subcategory_name: postSubcategory || null,
        color_class: postCategoryColor,
        content: postContent.trim(),
        tags: newTags,
        is_sensitive: false,
        comment_count: 0,
        save_count: 0,
        support_count: 0,
      })
      .select()
      .single();

    if (error) {
      alert(`Erro Publicar: ${error.message}`);
      return;
    }

    if (data) {
      setPosts([data as Post, ...posts]);
    }

    setPostContent('');
    setPostCategory('');
    setPostCategoryId('');
    setPostCategoryColor('');
    setPostSubcategory('');
    setPostSubcategoryId('');
  };

  const getCreatorColor = () => {
    switch (postCategory) {
      case 'Médico': return 'focus-within:ring-cat-medical';
      case 'Desabafo': return 'focus-within:ring-cat-vent';
      case 'Psicológico': return 'focus-within:ring-cat-psycho';
      case 'Direitos': return 'focus-within:ring-cat-rights';
      default: return 'focus-within:ring-brand-blue';
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-soft-dark-bg">

      {/* Modal: Nova Categoria (Master Only) */}
      {showNewCatModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252830] rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
            <button onClick={() => setShowNewCatModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>

            <div className="mb-6">
              <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">🏷️</div>
              <h2 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100">Nova Categoria</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">Apenas administradores podem criar categorias.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Categoria</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1A1C23] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all dark:text-gray-100"
                  placeholder="Ex: Inclusão Escolar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cor da Tag</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setNewCatColor(c.colorClass)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${c.colorClass} ${newCatColor === c.colorClass ? 'ring-2 ring-offset-2 ring-brand-blue scale-105' : 'opacity-70 hover:opacity-100'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {newCatName.trim() && (
                <div className="bg-gray-50 dark:bg-[#1A1C23] rounded-xl p-3 flex items-center space-x-3">
                  <span className="text-xs text-gray-400">Preview:</span>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${newCatColor}`}>{newCatName}</span>
                </div>
              )}

              <button
                onClick={handleAddCategory}
                disabled={!newCatName.trim()}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${newCatName.trim()
                  ? 'bg-brand-blue text-white hover:brightness-110 shadow-sm'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                Criar Categoria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar Categoria (Master Only) */}
      {editingCat && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252830] rounded-3xl max-w-sm w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEditingCat(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>

            <div className="mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">✏️</div>
              <h2 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100">Editar Categoria</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">Altere o nome ou a cor da categoria.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Categoria</label>
                <input
                  type="text"
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1A1C23] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all dark:text-gray-100"
                  placeholder="Nome da categoria"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cor da Tag</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setEditCatColor(c.colorClass)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${c.colorClass} ${editCatColor === c.colorClass ? 'ring-2 ring-offset-2 ring-brand-blue scale-105' : 'opacity-70 hover:opacity-100'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {editCatName.trim() && (
                <div className="bg-gray-50 dark:bg-[#1A1C23] rounded-xl p-3 flex items-center space-x-3">
                  <span className="text-xs text-gray-400">Preview:</span>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${editCatColor}`}>{editCatName}</span>
                </div>
              )}

              {/* Subcategories editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subcategorias</label>
                <div className="space-y-1 mb-2">
                  {editSubcategories.map((sub, index) => (
                    <div key={sub.id} className="flex items-center justify-between bg-gray-50 dark:bg-[#1A1C23] px-3 py-1.5 rounded-lg">
                      <input
                        type="text"
                        value={sub.label}
                        onChange={(e) => {
                          const newSubs = [...editSubcategories];
                          newSubs[index].label = e.target.value;
                          setEditSubcategories(newSubs);
                        }}
                        className="bg-transparent border-none focus:ring-0 text-xs text-gray-700 dark:text-gray-300 w-full p-0"
                      />
                      <button onClick={() => handleRemoveSubcategory(sub.id)} className="text-red-400 hover:text-red-600 text-xs ml-2">✕</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubcatName}
                    onChange={(e) => setNewSubcatName(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-gray-50 dark:bg-[#1A1C23] border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-brand-blue dark:text-gray-100"
                    placeholder="Nova subcategoria..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubcategory()}
                  />
                  <button onClick={handleAddSubcategory} className="px-3 py-2 bg-brand-blue text-white rounded-lg text-xs font-bold hover:brightness-110">+</button>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => { handleDeleteCategory(editingCat.id); setEditingCat(null); }}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                >
                  🗑️ Excluir
                </button>
                <button
                  onClick={handleEditCategory}
                  disabled={!editCatName.trim()}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${editCatName.trim()
                      ? 'bg-brand-blue text-white hover:brightness-110 shadow-sm'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Fixo Global */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#1A1C23] border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-black text-brand-blue">Rede de Apoio</h1>
            <div className="hidden md:flex items-center bg-gray-50 dark:bg-gray-800 rounded-full px-4 py-2 w-80">
              <span className="text-gray-400 mr-2">🔍</span>
              <input type="text" placeholder="Buscar posts, diagnósticos..." className="bg-transparent border-none focus:outline-none w-full text-sm text-gray-700 dark:text-gray-200" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Toggle Master */}
            <button
              onClick={() => setIsMaster(!isMaster)}
              className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${isMaster
                ? 'bg-brand-blue text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}
            >
              {isMaster ? '🔑 Admin' : '👤 Usuário'}
            </button>
            <button className="text-gray-500 hover:text-brand-blue text-xl relative">
              🔔
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-brand-lavender/30 flex items-center justify-center text-brand-lavender font-bold cursor-pointer hover:opacity-80 transition-opacity">
              M
            </div>
          </div>
        </div>
      </header>

      {/* Grid de 3 Colunas */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">

        {/* COLUNA 1: Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-[#252830] rounded-3xl p-6 shadow-sm sticky top-28">
            <nav className="space-y-4 mb-8">
              <a href="#" className="flex items-center text-brand-blue dark:text-brand-blue font-bold px-3 py-2 bg-brand-blue/5 rounded-xl transition-colors">
                <span className="mr-3 text-xl">🌐</span> Início
              </a>
              <a href="#" className="flex items-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium px-3 py-2 rounded-xl transition-colors">
                <span className="mr-3 text-xl">👥</span> Categorias Favoritas
              </a>
              <Link href="/salvos" className="flex items-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium px-3 py-2 rounded-xl transition-colors">
                <span className="mr-3 text-xl">🔖</span> Mensagens salvas
              </Link>
            </nav>

            <div className="flex items-center justify-between mb-4 px-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Criar Nova Categoria</h3>
              {isMaster && (
                <button
                  onClick={() => setShowNewCatModal(true)}
                  className="w-6 h-6 flex items-center justify-center bg-brand-blue text-white rounded-lg text-xs font-bold hover:brightness-110 transition-all shadow-sm"
                  title="Adicionar nova categoria"
                >
                  +
                </button>
              )}
            </div>

            {isLoadingCats ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-9 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => { setActiveCategory(null); setActiveSubcategory(null); }}
                  className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${activeCategory === null ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  Todas as Áreas
                </button>
                {categories.map(cat => (
                  <div key={cat.id} className="flex flex-col mb-1">
                    <div className="flex items-center group">
                      <button
                        onClick={() => { setActiveCategory(cat.label); setActiveSubcategory(null); }}
                        className={`flex-1 flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-colors ${activeCategory === cat.label && !activeSubcategory ? 'ring-2 ring-brand-blue ring-offset-2' : 'hover:opacity-80'} ${cat.color_class.replace('text-', 'bg-').replace('/20', '/10')}`}
                      >
                        <span className={`w-3 h-3 rounded-full mr-2 ${cat.color_class.split(' ')[0].replace('/20', '').replace('/30', '')}`}></span>
                        <span className={cat.color_class.split(' ')[1]}>{cat.label}</span>
                      </button>
                      {isMaster && (
                        <div className="flex items-center ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditModal(cat); }}
                            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-brand-blue rounded transition-colors text-xs"
                            title="Editar categoria"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 rounded transition-colors text-xs"
                            title="Excluir categoria"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                    {/* Subcategories */}
                    {activeCategory === cat.label && cat.subcategories && cat.subcategories.length > 0 && (
                      <div className="flex flex-col pl-6 mt-1 space-y-1">
                        {cat.subcategories.map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => setActiveSubcategory(sub.label)}
                            className={`text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeSubcategory === sub.label ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                          >
                            ↳ {sub.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* COLUNA 2: Main Feed */}
        <main className="flex-1 max-w-2xl">
          {/* Caixa de Publicação */}
          <div className={`bg-white dark:bg-[#252830] rounded-3xl p-5 shadow-sm border-2 border-transparent transition-all mb-8 ${getCreatorColor()}`}>
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-lavender/20 flex-shrink-0 flex items-center justify-center text-brand-lavender font-bold">M</div>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 resize-none text-gray-800 dark:text-gray-100 placeholder-gray-400 text-lg pt-1"
                rows={2}
                placeholder="Como está sua jornada hoje?"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 border-t border-gray-100 dark:border-gray-800 gap-4">
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-1 text-gray-500 hover:text-brand-blue bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-xl transition-colors text-sm font-medium">
                  <span>📷</span> <span className="hidden sm:inline">Imagem</span>
                </button>

                <select
                  value={postCategory}
                  onChange={(e) => {
                    const selected = categories.find(c => c.label === e.target.value);
                    setPostCategory(e.target.value);
                    setPostCategoryId(selected?.id ?? '');
                    setPostCategoryColor(selected?.color_class ?? '');
                    // Reset subcategory when category changes
                    setPostSubcategory('');
                    setPostSubcategoryId('');
                  }}
                  className="bg-gray-50 dark:bg-gray-800 border-none text-sm text-gray-600 dark:text-gray-300 rounded-xl focus:ring-0 cursor-pointer font-medium py-1.5"
                >
                  <option value="" disabled>🏷️ Selecionar Categoria</option>
                  {categories.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}
                </select>

                {/* Subcategory dropdown - only shown when selected category has subcategories */}
                {postCategoryId && categories.find(c => c.id === postCategoryId)?.subcategories?.length ? (
                  <select
                    value={postSubcategory}
                    onChange={(e) => {
                      const cat = categories.find(c => c.id === postCategoryId);
                      const sub = cat?.subcategories?.find(s => s.label === e.target.value);
                      setPostSubcategory(e.target.value);
                      setPostSubcategoryId(sub?.id ?? '');
                    }}
                    className="bg-gray-50 dark:bg-gray-800 border-none text-sm text-gray-600 dark:text-gray-300 rounded-xl focus:ring-0 cursor-pointer font-medium py-1.5"
                  >
                    <option value="" disabled>↳ Subcategoria</option>
                    {categories
                      .find(c => c.id === postCategoryId)
                      ?.subcategories?.map(s => (
                        <option key={s.id} value={s.label}>{s.label}</option>
                      ))}
                  </select>
                ) : null}


              </div>

              <button
                onClick={handlePublish}
                disabled={!postCategory || !postContent.trim()}
                className={`font-bold py-2 px-6 rounded-full transition-all shadow-sm ${postCategory && postContent.trim()
                  ? 'bg-brand-blue text-white hover:brightness-110'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                Publicar
              </button>
            </div>
          </div>

          {/* Header do Feed: Categoria ativa + Barra de Filtros */}
          <div className="bg-white dark:bg-[#252830] rounded-2xl px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {activeCategory ? (
                  <>
                    <button onClick={() => setActiveCategory(null)} className="text-gray-400 hover:text-gray-600 transition-colors text-lg">←</button>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${getCategoryColorClass(activeCategory)}`}>{activeCategory}</span>
                    <span className="text-sm text-gray-500">• {filteredAndSortedPosts.length} {filteredAndSortedPosts.length === 1 ? 'post' : 'posts'}</span>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">🌐 Todos os Posts</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 overflow-x-auto">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setSortFilter(opt.key)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${sortFilter === opt.key
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Listagem de Posts */}
          {isLoadingPosts ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#252830] rounded-3xl p-6 shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/3 mb-4" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-4/5" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {paginatedPosts.map(post => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  authorName={post.author_name}
                  authorRole={post.author_role}
                  categoryName={post.category_name}
                  categoryColorClass={post.color_class}
                  content={post.content}
                  tags={post.tags}
                  isSensitive={post.is_sensitive}
                  subcategoryName={post.subcategory_name ?? undefined}
                />
              ))}
              {filteredAndSortedPosts.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-white dark:bg-[#252830] rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                  <span className="text-4xl mb-3 block">🌱</span>
                  <p>Nenhuma história encontrada nesta categoria por enquanto.</p>
                  <p className="text-sm mt-1">Seja a primeira pessoa a compartilhar.</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-[#252830] border border-gray-200 dark:border-gray-700 disabled:opacity-40"
              >
                ←
              </button>
              <span className="text-sm text-gray-500">{currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-[#252830] border border-gray-200 dark:border-gray-700 disabled:opacity-40"
              >
                →
              </button>
            </div>
          )}
        </main>

        {/* COLUNA 3: Widgets e Sugestões */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-28 space-y-6">


            <div className="bg-white dark:bg-[#252830] rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Em Alta (Tags)</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-full font-medium cursor-pointer hover:bg-gray-200 transition-colors">#AutismoNivel1</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-full font-medium cursor-pointer hover:bg-gray-200 transition-colors">#Medicacao</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-full font-medium cursor-pointer hover:bg-gray-200 transition-colors">#CansaçoDoCuidador</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-full font-medium cursor-pointer hover:bg-gray-200 transition-colors">#EscolaInclusiva</span>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
