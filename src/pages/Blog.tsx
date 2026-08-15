import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BlogPost } from '../types/blog';
import { SEED_BLOG_POSTS } from '../data/blogSeed';
import { 
  Calendar, 
  Clock, 
  Search, 
  Newspaper, 
  ArrowRight,
  BookOpen,
  Tag,
  Sparkles
} from 'lucide-react';
import { usePageSEO } from '../utils/seo';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [errorMessage, setErrorMessage] = useState('');

  usePageSEO(
    "Conseils & Guides Soins | 2M Cosmetics Dakar",
    "Découvrez nos articles, guides pratiques et conseils d'utilisation rédigés par notre équipe à Dakar."
  );

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        if (!supabase) {
          throw new Error("Client Supabase non initialisé. Veuillez configurer vos variables d'environnement.");
        }
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setPosts(data as BlogPost[]);
      } catch (err: any) {
        const msg = err.message || JSON.stringify(err);
        console.error("Erreur de chargement depuis Supabase :", err);
        setPosts(SEED_BLOG_POSTS);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Filter posts based on search term and category
  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.category || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Unique categories for filtering
  const categories = ['all', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];

  const formatFrenchDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 selection:bg-brand-taupe/20" id="public-blog-page">
      
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <span className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-extrabold flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
          Le Journal 2M Cosmetics
        </span>
        <h1 className="text-4xl lg:text-5xl font-serif text-black/90 font-light leading-tight">
          Conseils &amp; Guides Pratiques au Quotidien
        </h1>
        <div className="h-[2px] w-12 bg-brand-gold mx-auto"></div>
        <p className="text-xs text-black/60 font-light leading-relaxed max-w-lg mx-auto">
          Retrouvez nos conseils et routines simples pour prendre soin de votre peau, comprendre les ingrédients et faire des choix adaptés sous le climat de Dakar.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="max-w-4xl mx-auto mb-12 flex flex-col md:flex-row gap-4 justify-between items-center bg-brand-cream border border-black/5 p-4 rounded-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30" />
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-black/10 text-xs rounded-sm focus:outline-hidden focus:border-brand-gold bg-white font-light"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-[9px] uppercase tracking-wider font-bold rounded-xs border transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-noir text-brand-cream border-brand-noir'
                  : 'bg-white text-black/60 border-black/5 hover:border-black/25'
              }`}
            >
              {cat === 'all' ? 'Tous les articles' : cat}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="max-w-4xl mx-auto mb-10 p-4 bg-red-50 border border-red-500/10 text-red-800 text-xs rounded-sm flex items-center gap-2">
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Blog Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-[10px] uppercase tracking-widest text-black/40 font-mono">Chargement des articles...</span>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="border border-black/5 bg-brand-cream/30 p-16 text-center max-w-xl mx-auto rounded-sm">
          <Newspaper className="w-10 h-10 text-brand-taupe/30 mx-auto mb-3" />
          <h4 className="text-sm font-serif italic text-black/70 mb-1">Aucun conseil répertorié</h4>
          <p className="text-xs text-black/40 max-w-xs mx-auto font-light leading-relaxed">
            Nous n'avons trouvé aucun article correspondant à vos critères de recherche pour le moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {filteredPosts.map((post, idx) => {
            const isFeatured = idx === 0 && !searchTerm && selectedCategory === 'all';
            
            return (
              <div 
                key={post.id}
                className={`bg-white border border-black/5 hover:border-black/15 transition-all duration-300 rounded-sm overflow-hidden flex flex-col justify-between text-left group ${
                  isFeatured ? 'md:col-span-2 lg:col-span-3 lg:flex-row' : ''
                }`}
              >
                {/* Image Cover */}
                <div className={`relative bg-brand-cream overflow-hidden shrink-0 ${
                  isFeatured 
                    ? 'h-64 sm:h-80 lg:h-auto lg:w-3/5' 
                    : 'h-52'
                }`}>
                  {post.cover_image ? (
                    <img 
                      src={post.cover_image} 
                      alt={post.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-serif text-sm italic text-black/20">
                      2M Cosmetics
                    </div>
                  )}

                  {/* Ribbon tag for Category */}
                  {post.category && (
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs text-black text-[8px] uppercase tracking-[0.2em] font-bold px-2.5 py-1 border border-black/5 rounded-xs shadow-xs">
                      {post.category}
                    </span>
                  )}
                </div>

                {/* Card Details */}
                <div className={`p-6 sm:p-8 flex-grow flex flex-col justify-between ${
                  isFeatured ? 'lg:w-2/5 lg:p-10' : ''
                }`}>
                  <div className="space-y-3">
                    {/* Date and Reading Time */}
                    <div className="flex items-center gap-3 text-[10px] text-black/40 font-mono font-light">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-brand-taupe" />
                        {formatFrenchDate(post.created_at)}
                      </span>
                      {post.reading_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-brand-taupe" />
                          {post.reading_time}
                        </span>
                      )}
                    </div>

                    <h3 className={`font-serif italic text-black/85 group-hover:text-brand-gold transition-colors leading-tight ${
                      isFeatured ? 'text-2xl sm:text-3xl' : 'text-xl'
                    }`}>
                      {post.title}
                    </h3>

                    <p className="text-xs text-black/60 font-light leading-relaxed">
                      {post.excerpt || "Découvrez nos explications claires et nos conseils d'utilisation pour vos soins du quotidien."}
                    </p>
                  </div>

                  <div className="border-t border-black/5 mt-6 pt-4 flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-widest text-brand-gold font-bold">
                      Conseil 2M
                    </span>

                    <Link 
                      to={`/blog/${post.slug}`} 
                      className="text-[10px] uppercase tracking-widest font-extrabold text-brand-noir group-hover:text-brand-gold transition-colors inline-flex items-center gap-1"
                    >
                      Je lis l'article
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
