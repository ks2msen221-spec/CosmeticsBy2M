import React, { useState, useEffect, useRef } from 'react';
import { 
  Newspaper, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Upload, 
  Loader2, 
  Check, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  AlertCircle,
  FileText,
  Clock,
  BookOpen,
  Calendar,
  Image as ImageIcon,
  CheckCircle,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Quote,
  List as ListIcon,
  Link as LinkIcon,
  HelpCircle,
  Code
} from 'lucide-react';
import { catalogService } from '../../lib/catalogService';
import { supabase } from '../../lib/supabase';
import { BlogPost } from '../../types/blog';
import { SEED_BLOG_POSTS } from '../../data/blogSeed';
import Markdown from 'react-markdown';

// Utility to generate URL-friendly slugs from strings
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .normalize('NFD') // decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // remove accented diacritics
    .replace(/[^a-z0-9\s-]/g, '') // remove special symbols
    .replace(/[\s_]+/g, '-') // replace spaces with single dash
    .replace(/^-+|-+$/g, ''); // trim trailing/leading dashes
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formStatus, setFormStatus] = useState<'draft' | 'published'>('draft');
  const [formCategory, setFormCategory] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formReadingTime, setFormReadingTime] = useState('');
  
  // Controls
  const [slugLocked, setSlugLocked] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewTab, setPreviewTab] = useState<'edit' | 'preview' | 'split'>('split');
  const [showSqlHelp, setShowSqlHelp] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      if (!supabase) {
        throw new Error("Client Supabase non initialisé. Veuillez configurer vos variables d'environnement.");
      }
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPosts(data as BlogPost[] || []);
    } catch (err: any) {
      const msg = err.message || JSON.stringify(err);
      console.error("Erreur de chargement depuis Supabase :", err);
      setErrorMessage(`Erreur de chargement depuis Supabase : ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormTitle(value);
    if (slugLocked) {
      setFormSlug(generateSlug(value));
    }
  };

  const toggleSlugLock = () => {
    setSlugLocked(!slugLocked);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormSlug(generateSlug(e.target.value));
  };

  // Start creating new post
  const startCreate = () => {
    setEditingPost(null);
    setFormTitle('');
    setFormSlug('');
    setFormContent('');
    setFormCoverImage('');
    setFormStatus('draft');
    setFormCategory('Rituels de Soins');
    setFormExcerpt('');
    setFormReadingTime('4 min');
    setSlugLocked(true);
    setErrorMessage('');
    setSuccessMessage('');
    setIsEditing(true);
  };

  // Start editing existing post
  const startEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormSlug(post.slug);
    setFormContent(post.content);
    setFormCoverImage(post.cover_image || '');
    setFormStatus(post.status);
    setFormCategory(post.category || 'Rituels de Soins');
    setFormExcerpt(post.excerpt || '');
    setFormReadingTime(post.reading_time || '4 min');
    setSlugLocked(false);
    setErrorMessage('');
    setSuccessMessage('');
    setIsEditing(true);
  };

  // Drag and drop for cover image
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setErrorMessage('');
    try {
      const url = await catalogService.uploadImage(files[0], 'blog-images');
      setFormCoverImage(url);
      setSuccessMessage("Image téléversée avec succès.");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error("Cover image upload error:", err);
      setErrorMessage("Échec du téléversement vers le bucket 'blog-images'. Réessayez.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Quick markdown formatting inserts
  const insertMarkdown = (syntax: string) => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const selected = text.substring(start, end);

    let replacement = '';
    switch (syntax) {
      case 'bold':
        replacement = `**${selected || 'texte'}**`;
        break;
      case 'italic':
        replacement = `*${selected || 'texte'}*`;
        break;
      case 'h1':
        replacement = `\n# ${selected || 'Titre 1'}\n`;
        break;
      case 'h2':
        replacement = `\n## ${selected || 'Titre 2'}\n`;
        break;
      case 'quote':
        replacement = `\n> ${selected || 'Citation'}\n`;
        break;
      case 'list':
        replacement = `\n- ${selected || 'Élément'}\n`;
        break;
      case 'link':
        replacement = `[${selected || 'Lien'}](https://)`;
        break;
      default:
        return;
    }

    setFormContent(before + replacement + after);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  // Save Post logic (DB + local Storage fallback)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setErrorMessage("Le titre est obligatoire.");
      return;
    }
    if (!formSlug.trim()) {
      setErrorMessage("Le slug de l'article est obligatoire.");
      return;
    }
    if (!formContent.trim()) {
      setErrorMessage("Le contenu Markdown de l'article ne peut pas être vide.");
      return;
    }

    const postData: BlogPost = {
      id: editingPost?.id || 'blog_' + Math.random().toString(36).substring(2, 11),
      title: formTitle.trim(),
      slug: formSlug.trim(),
      content: formContent,
      cover_image: formCoverImage.trim() || null,
      status: formStatus,
      category: formCategory.trim() || 'Rituels de Soins',
      excerpt: formExcerpt.trim() || null,
      reading_time: formReadingTime.trim() || '4 min',
      created_at: editingPost?.created_at || new Date().toISOString()
    };

    setUploading(true);
    setErrorMessage('');
    setSuccessMessage('');

    let savedInSupabase = false;
    try {
      if (supabase) {
        const { error } = await supabase
          .from('blog_posts')
          .upsert(postData, { onConflict: 'id' });

        if (error) {
          throw error;
        }
        savedInSupabase = true;
      }
    } catch (err: any) {
      console.warn("Maison 2M - Supabase 'blog_posts' table error/not created. Syncing with local state fallback:", err);
    }

    // Sync with local state
    const localPosts = localStorage.getItem('2m_cosmetics_blog_posts');
    let currentPosts: BlogPost[] = localPosts ? JSON.parse(localPosts) : [...SEED_BLOG_POSTS];

    // Remove duplicates based on ID or Slug
    if (editingPost) {
      currentPosts = currentPosts.map(p => p.id === postData.id ? postData : p);
    } else {
      if (currentPosts.some(p => p.slug === postData.slug)) {
        setErrorMessage(`Un article avec le slug permanent "${postData.slug}" existe déjà.`);
        setUploading(false);
        return;
      }
      currentPosts.unshift(postData);
    }

    localStorage.setItem('2m_cosmetics_blog_posts', JSON.stringify(currentPosts));
    setPosts(currentPosts);

    if (savedInSupabase) {
      setSuccessMessage(`Félicitations ! L'article "${postData.title}" a été enregistré et publié en ligne sur Supabase.`);
    } else {
      setSuccessMessage(`Article "${postData.title}" enregistré avec succès en local. (La table Supabase n'est pas configurée mais la Gazette 2M reste fonctionnelle).`);
    }

    // Cleanup
    setIsEditing(false);
    setEditingPost(null);
    setUploading(false);
    
    // Clear toast notice
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  // Delete Post
  const handleDelete = async (postId: string, postTitle: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir définitivement supprimer l'article "${postTitle}" ?`)) return;

    setErrorMessage('');
    setSuccessMessage('');
    let deletedFromSupabase = false;

    try {
      if (supabase) {
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', postId);

        if (!error) {
          deletedFromSupabase = true;
        }
      }
    } catch (err) {
      console.warn("Failed delete query on Supabase table:", err);
    }

    // Always delete locally
    const localPosts = localStorage.getItem('2m_cosmetics_blog_posts');
    if (localPosts) {
      const parsed = JSON.parse(localPosts) as BlogPost[];
      const filtered = parsed.filter(p => p.id !== postId);
      localStorage.setItem('2m_cosmetics_blog_posts', JSON.stringify(filtered));
      setPosts(filtered);
    }

    setSuccessMessage(
      deletedFromSupabase 
        ? "L'article a été supprimé avec succès de Supabase et de l'espace local."
        : "L'article a été supprimé localement de votre console d'administration."
    );
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  // Filter criteria
  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.category || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return post.status === statusFilter;
  });

  return (
    <div className="space-y-6 selection:bg-brand-taupe/20" id="admin-blog-manager">
      
      {/* Back Office Header */}
      <header className="border-b border-black/5 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-brand-taupe font-bold block mb-2">
            Console de Rédaction • Dakar
          </span>
          <h1 className="text-3xl font-serif italic text-black/90">La Gazette 2M — Gestion du Blog</h1>
          <p className="text-xs text-black/50 font-light mt-1">
            Rédigez des diagnostics de peau, des conseils de soins rituels et des articles scientifiques en Markdown.
          </p>
        </div>
        
        {!isEditing && (
          <button 
            onClick={startCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-noir hover:bg-brand-taupe text-white hover:text-brand-noir rounded-sm text-xs font-mono font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Nouvel Article
          </button>
        )}
      </header>

      {/* Messages Feed */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-500/10 text-green-800 text-xs rounded-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-500/10 text-red-800 text-xs rounded-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Database Schema Setup Helper */}
      {!isEditing && (
        <div className="border border-black/5 rounded-sm bg-white overflow-hidden">
          <button 
            onClick={() => setShowSqlHelp(!showSqlHelp)}
            className="w-full flex items-center justify-between p-4 bg-brand-cream text-xs font-mono text-black/60 hover:text-black hover:bg-black/[0.02] transition-colors"
          >
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-brand-taupe" />
              ⚙️ Assistant Base de Données Supabase (Table `blog_posts` et RLS)
            </span>
            <span className="text-[10px] underline">{showSqlHelp ? 'Masquer le script SQL' : 'Afficher le script SQL'}</span>
          </button>

          {showSqlHelp && (
            <div className="p-4 border-t border-black/5 bg-[#1E1E1E] text-white font-mono text-[10px] space-y-3 leading-relaxed overflow-x-auto">
              <p className="text-brand-taupe font-sans">
                Pour assurer une synchronisation transparente en ligne, connectez-vous à votre console Supabase, ouvrez l'éditeur de requêtes SQL (SQL Editor) et exécutez le script ci-dessous :
              </p>
              <pre className="p-3 bg-black/40 rounded border border-white/5 select-all text-green-400">
{`-- 1. Création de la table des articles de la Gazette 2M
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  cover_image TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reading_time TEXT DEFAULT '4 min',
  excerpt TEXT,
  category TEXT DEFAULT 'Rituels de Soins'
);

-- 2. Activation de RLS (Row Level Security)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 3. Configuration des Politiques d'accès
CREATE POLICY "Lecture publique pour articles publiés" ON blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Contrôle total pour administrateurs" ON blog_posts
  FOR ALL TO authenticated USING (true);

-- 4. Optionnel : Autoriser l'accès public en lecture et modification si pas d'Auth actif
CREATE POLICY "Acces total anonyme temporaire" ON blog_posts
  FOR ALL TO anon USING (true);`}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* MODE 1: LISTING & MANAGEMENT */}
      {!isEditing && (
        <div className="space-y-4">
          
          {/* Toolbar Search & Status Filter */}
          <div className="bg-white border border-black/5 p-4 rounded-sm flex flex-col sm:flex-row gap-4 justify-between items-center shadow-2xs">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
              <input
                type="text"
                placeholder="Rechercher par titre, résumé ou étiquette..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-black/10 text-xs rounded-sm focus:outline-hidden focus:border-brand-taupe bg-brand-cream/20 font-light"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto self-stretch sm:self-auto shrink-0 justify-end">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-xs transition-colors border ${
                  statusFilter === 'all'
                    ? 'bg-brand-noir text-white border-brand-noir'
                    : 'bg-white text-black/60 border-black/10 hover:border-black/20'
                }`}
              >
                Tous ({posts.length})
              </button>
              
              <button
                onClick={() => setStatusFilter('published')}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-xs transition-colors border ${
                  statusFilter === 'published'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-green-700/70 border-green-200 hover:border-green-300'
                }`}
              >
                Publiés ({posts.filter(p => p.status === 'published').length})
              </button>

              <button
                onClick={() => setStatusFilter('draft')}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-xs transition-colors border ${
                  statusFilter === 'draft'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-amber-700/70 border-amber-200 hover:border-amber-300'
                }`}
              >
                Brouillons ({posts.filter(p => p.status === 'draft').length})
              </button>
            </div>
          </div>

          {/* Table list or fallback empty card */}
          {loading ? (
            <div className="bg-white border border-black/5 p-20 text-center rounded-sm shadow-xs flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-brand-taupe animate-spin mb-3" />
              <span className="text-[10px] uppercase tracking-widest text-black/40 font-mono">Chargement du pupitre de rédaction...</span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white border border-dashed border-black/10 p-16 text-center rounded-sm shadow-xs">
              <Newspaper className="w-12 h-12 text-brand-taupe/20 mx-auto mb-4" />
              <h3 className="text-sm font-serif italic text-black/70 mb-1">Aucun article trouvé</h3>
              <p className="text-xs text-black/40 max-w-sm mx-auto font-light leading-relaxed">
                Votre recherche ou filtre n'a retourné aucun article de blog pour le moment. Créez votre premier diagnostic de beauté !
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <div 
                  key={post.id}
                  className="bg-white border border-black/5 hover:border-black/15 transition-all duration-300 flex flex-col rounded-sm overflow-hidden shadow-2xs group"
                >
                  {/* Cover block */}
                  <div className="relative h-44 bg-brand-cream border-b border-black/5 overflow-hidden shrink-0">
                    {post.cover_image ? (
                      <img 
                        src={post.cover_image} 
                        alt={post.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-black/20 font-serif italic text-sm">
                        <Newspaper className="w-8 h-8 mb-1 opacity-40" />
                        Maison 2M
                      </div>
                    )}

                    {/* Category Label */}
                    {post.category && (
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-black text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 border border-black/5 rounded-xs">
                        {post.category}
                      </span>
                    )}

                    {/* Status Badge */}
                    <span className={`absolute top-3 right-3 text-[8px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-xs border ${
                      post.status === 'published'
                        ? 'bg-green-500 text-white border-green-500 shadow-sm'
                        : 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    }`}>
                      {post.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-grow flex flex-col justify-between text-left space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-[10px] text-black/40 font-mono font-light">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-brand-taupe" />
                          {new Date(post.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        {post.reading_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-brand-taupe" />
                            {post.reading_time}
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg font-serif italic text-black/85 group-hover:text-brand-taupe transition-colors line-clamp-2">
                        {post.title}
                      </h4>

                      <p className="text-xs text-black/50 font-light leading-relaxed line-clamp-3">
                        {post.excerpt || "Aucun résumé n'a été saisi pour cet article de la Gazette."}
                      </p>
                    </div>

                    {/* Actions and Slug details */}
                    <div className="border-t border-black/5 pt-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[9px] text-black/30 truncate max-w-[130px]" title={`Slug: ${post.slug}`}>
                          /{post.slug}
                        </span>

                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => startEdit(post)}
                            className="p-1.5 border border-black/5 rounded-xs hover:bg-brand-cream text-black/60 hover:text-black transition-all"
                            title="Modifier l'article"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(post.id, post.title)}
                            className="p-1.5 border border-red-100 text-red-600 rounded-xs hover:bg-red-50 hover:text-red-700 transition-all"
                            title="Supprimer l'article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: EDITING / CREATION SCREEN */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-white border border-black/5 rounded-sm overflow-hidden shadow-xs text-left">
          
          {/* Header toolbar */}
          <div className="bg-brand-cream border-b border-black/5 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-brand-noir/5 rounded-xs text-brand-taupe">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-serif italic font-bold text-black/90">
                  {editingPost ? `Modifier l'article : ${formTitle || 'Sans titre'}` : 'Nouveau diagnostic ou article'}
                </h3>
                <p className="text-[10px] text-black/40 font-mono uppercase">
                  {editingPost ? 'ID: ' + editingPost.id : 'Nouveau Post'}
                </p>
              </div>
            </div>

            {/* Editor tab switches (Write, Split view, Preview) */}
            <div className="flex border border-black/10 rounded-sm bg-white p-0.5 text-[10px] font-mono tracking-wider">
              <button
                type="button"
                onClick={() => setPreviewTab('edit')}
                className={`px-2.5 py-1.5 rounded-xs transition-colors ${
                  previewTab === 'edit' ? 'bg-brand-noir text-white font-bold' : 'text-black/50 hover:text-black'
                }`}
              >
                Éditeur
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('split')}
                className={`hidden md:block px-2.5 py-1.5 rounded-xs transition-colors ${
                  previewTab === 'split' ? 'bg-brand-noir text-white font-bold' : 'text-black/50 hover:text-black'
                }`}
              >
                Double Vue (Split)
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('preview')}
                className={`px-2.5 py-1.5 rounded-xs transition-colors ${
                  previewTab === 'preview' ? 'bg-brand-noir text-white font-bold' : 'text-black/50 hover:text-black'
                }`}
              >
                Aperçu Client
              </button>
            </div>
          </div>

          {/* Main workspace layout */}
          <div className="p-6 space-y-6">
            
            {/* Split row - Metadata inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Column 1: Title & Slug & Category */}
              <div className="space-y-4 lg:col-span-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-mono font-bold text-black/50 block">
                    Titre de l'Article de la Gazette *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={handleTitleChange}
                    placeholder="Ex: Les secrets de l'Hydratation Peaux Sèches..."
                    className="w-full px-3.5 py-2.5 border border-black/10 text-xs rounded-xs focus:outline-hidden focus:border-brand-taupe"
                  />
                </div>

                {/* Slug display with unlock toggle */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-mono font-bold text-black/50 block flex items-center gap-1.5">
                    Slug permanent (URL SEO) *
                    <button
                      type="button"
                      onClick={toggleSlugLock}
                      className="text-brand-taupe hover:text-black transition-colors"
                      title={slugLocked ? "Modifier le slug manuellement" : "Verrouiller le slug"}
                    >
                      {slugLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3 text-amber-500" />}
                    </button>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-black/30">
                      /blog/
                    </span>
                    <input
                      type="text"
                      required
                      disabled={slugLocked}
                      value={formSlug}
                      onChange={handleSlugChange}
                      placeholder="generer-automatiquement-du-titre"
                      className="w-full pl-14 pr-4 py-2.5 border border-black/10 text-xs rounded-xs focus:outline-hidden focus:border-brand-taupe font-mono disabled:bg-brand-cream disabled:text-black/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-mono font-bold text-black/50 block">
                      Catégorie de Soins
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-black/10 text-xs rounded-xs focus:outline-hidden focus:border-brand-taupe bg-white font-serif italic"
                    >
                      <option value="Rituels de Soins">Rituels de Soins</option>
                      <option value="Dermatologie">Dermatologie</option>
                      <option value="Ingrédients Actifs">Ingrédients Actifs</option>
                      <option value="Conseils d'Expert">Conseils d'Expert</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-mono font-bold text-black/50 block">
                      Temps de Lecture
                    </label>
                    <input
                      type="text"
                      value={formReadingTime}
                      onChange={(e) => setFormReadingTime(e.target.value)}
                      placeholder="Ex: 5 min"
                      className="w-full px-3.5 py-2.5 border border-black/10 text-xs rounded-xs focus:outline-hidden focus:border-brand-taupe font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-mono font-bold text-black/50 block">
                      Statut de Visibilité
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as 'draft' | 'published')}
                      className="w-full px-3.5 py-2.5 border border-black/10 text-xs rounded-xs focus:outline-hidden focus:border-brand-taupe bg-white font-mono font-bold"
                    >
                      <option value="draft">Brouillon (Draft)</option>
                      <option value="published">Publié (Published)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Column 2: Cover image block */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-mono font-bold text-black/50 block">
                    Image de couverture
                  </label>
                  
                  {/* Upload box */}
                  <div className="border border-black/10 rounded-xs overflow-hidden bg-brand-cream p-4 text-center space-y-3 relative">
                    {formCoverImage ? (
                      <div className="relative h-28 w-full bg-black/5 rounded-xs overflow-hidden">
                        <img 
                          src={formCoverImage} 
                          alt="Cover upload" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormCoverImage('')}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black rounded-full text-white transition-colors"
                          title="Supprimer la couverture"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="py-6 flex flex-col items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-brand-taupe/40 mb-2" />
                        <span className="text-[10px] text-black/40 block font-light">
                          Aucune image sélectionnée
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-black/10 hover:bg-white text-[10px] font-mono rounded-xs cursor-pointer text-black/70 hover:text-black transition-all">
                        {uploadingImage ? (
                          <Loader2 className="w-3 h-3 animate-spin text-brand-taupe" />
                        ) : (
                          <Upload className="w-3 h-3" />
                        )}
                        Téléverser (.png, .jpg)
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Manual input URL */}
                  <div className="pt-2">
                    <input
                      type="text"
                      placeholder="Ou collez un lien d'image externe (Unsplash...)"
                      value={formCoverImage}
                      onChange={(e) => setFormCoverImage(e.target.value)}
                      className="w-full px-3 py-2 border border-black/10 text-[10px] font-mono rounded-xs focus:outline-hidden focus:border-brand-taupe"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Excerpt Summary block */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-mono font-bold text-black/50 block">
                Résumé ou Extrait (Excerpt) - Apparaît sur la liste du blog
              </label>
              <textarea
                value={formExcerpt}
                onChange={(e) => setFormExcerpt(e.target.value)}
                placeholder="Ex: Pourquoi toutes les peaux ont besoin d'un écran protecteur contre les UVA et UVB sous le soleil dakarois..."
                rows={2}
                className="w-full px-3.5 py-2.5 border border-black/10 text-xs rounded-xs focus:outline-hidden focus:border-brand-taupe font-light leading-relaxed"
              />
            </div>

            {/* Markdown Content Editor workspace */}
            <div className="space-y-1">
              <div className="flex justify-between items-center pb-1">
                <label className="text-[10px] uppercase tracking-wider font-mono font-bold text-black/50 block">
                  Contenu en Markdown *
                </label>
                <span className="text-[9px] text-brand-taupe font-mono flex items-center gap-1">
                  <Code className="w-3 h-3" />
                  Rendu en temps réel activé
                </span>
              </div>

              {/* Layout for editor + preview */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 border border-black/10 rounded-xs overflow-hidden">
                
                {/* WRITE / EDITOR COLUMN */}
                <div className={`md:col-span-6 flex flex-col ${
                  previewTab === 'preview' ? 'hidden' : 'block'
                } ${previewTab === 'split' ? 'md:col-span-6 border-r border-black/10' : 'md:col-span-12'}`}>
                  
                  {/* Toolbar helpers */}
                  <div className="bg-brand-cream border-b border-black/5 px-3 py-2 flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => insertMarkdown('bold')}
                      className="p-1.5 hover:bg-black/5 rounded-xs text-black/60 hover:text-black"
                      title="Gras"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('italic')}
                      className="p-1.5 hover:bg-black/5 rounded-xs text-black/60 hover:text-black"
                      title="Italique"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-[1px] bg-black/10 self-stretch my-1"></div>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('h1')}
                      className="p-1.5 hover:bg-black/5 rounded-xs text-black/60 hover:text-black"
                      title="Grand titre (H1)"
                    >
                      <Heading1 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('h2')}
                      className="p-1.5 hover:bg-black/5 rounded-xs text-black/60 hover:text-black"
                      title="Moyen titre (H2)"
                    >
                      <Heading2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-[1px] bg-black/10 self-stretch my-1"></div>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('quote')}
                      className="p-1.5 hover:bg-black/5 rounded-xs text-black/60 hover:text-black"
                      title="Citation"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('list')}
                      className="p-1.5 hover:bg-black/5 rounded-xs text-black/60 hover:text-black"
                      title="Liste à puces"
                    >
                      <ListIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('link')}
                      className="p-1.5 hover:bg-black/5 rounded-xs text-black/60 hover:text-black"
                      title="Lien"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Main textarea */}
                  <textarea
                    id="markdown-editor"
                    required
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="# Utilisez des titres de niveau 1 et 2&#10;&#10;Vous pouvez écrire du texte enrichi avec du **gras**, des *italiques* ou des listes de soins.&#10;&#10;> Ceci est une citation de diagnostic expert."
                    rows={15}
                    className="w-full p-4 text-xs font-mono border-0 focus:ring-0 focus:outline-hidden leading-relaxed resize-y min-h-[300px]"
                  />
                </div>

                {/* PREVIEW RENDERING COLUMN */}
                <div className={`md:col-span-6 p-6 overflow-y-auto bg-white min-h-[300px] ${
                  previewTab === 'edit' ? 'hidden' : 'block'
                } ${previewTab === 'split' ? 'md:col-span-6' : 'md:col-span-12'}`}>
                  
                  {formContent.trim() ? (
                    <article className="prose prose-sm max-w-none text-black/75 font-serif text-xs text-left selection:bg-brand-taupe/20 space-y-4">
                      {/* Markdown content parser as per layout requirement */}
                      <div className="markdown-body">
                        <Markdown>{formContent}</Markdown>
                      </div>
                    </article>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20 text-black/20">
                      <BookOpen className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-[10px] font-mono uppercase tracking-wider font-light">Aperçu en temps réel</p>
                      <p className="text-[11px] font-serif italic mt-1 max-w-xs">Commencez à saisir du contenu Markdown à gauche pour visualiser le résultat.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Save cancel footer */}
            <div className="flex gap-3 justify-end pt-4 border-t border-black/5">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditingPost(null);
                }}
                className="px-5 py-2.5 border border-black/10 hover:bg-brand-cream text-black/70 hover:text-black rounded-sm text-xs font-mono font-bold transition-all"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={uploading}
                className="px-6 py-2.5 bg-brand-noir hover:bg-brand-taupe text-white hover:text-brand-noir rounded-sm text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Enregistrer l'Article
                  </>
                )}
              </button>
            </div>

          </div>
        </form>
      )}

    </div>
  );
}
