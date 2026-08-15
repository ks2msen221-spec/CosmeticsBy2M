import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BlogPost } from '../types/blog';
import { SEED_BLOG_POSTS } from '../data/blogSeed';
import Markdown from 'react-markdown';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Twitter, 
  Facebook, 
  Mail, 
  BookOpen, 
  Bookmark,
  ChevronRight,
  User,
  Heart,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { usePageSEO } from '../utils/seo';

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [recommendations, setRecommendations] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  usePageSEO(
    post ? `${post.title} | Conseils 2M Cosmetics Dakar` : "Conseils Soins | 2M Cosmetics Dakar",
    post ? (post.excerpt || `Découvrez nos conseils d'utilisation et explications pour ${post.title} à Dakar.`) : "Conseils pratiques et informations sur les produits de soins 2M Cosmetics à Dakar."
  );

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;
      setLoading(true);
      setLiked(false);
      setErrorMessage('');
      
      try {
        let foundPost: BlogPost | null = null;
        let allPosts: BlogPost[] = [];

        if (supabase) {
          const { data, error } = await supabase
            .from('blog_posts')
            .select('*');
          
          if (!error && data && data.length > 0) {
            allPosts = data as BlogPost[];
            foundPost = allPosts.find(p => p.slug === slug) || null;
          }
        }

        if (!foundPost) {
          allPosts = SEED_BLOG_POSTS;
          foundPost = allPosts.find(p => p.slug === slug) || null;
        }

        if (foundPost) {
          setPost(foundPost);
          const recs = allPosts
            .filter(p => p.status === 'published' && p.slug !== foundPost!.slug)
            .slice(0, 3);
          setRecommendations(recs);
        } else {
          setPost(null);
        }
      } catch (err: any) {
        console.error("Erreur de chargement de l'article :", err);
        const fallback = SEED_BLOG_POSTS.find(p => p.slug === slug) || null;
        setPost(fallback);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = post ? post.title : "La Gazette Maison 2M";

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
      return;
    }

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
        break;
      default:
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const formatFrenchDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-brand-cream" id="blog-detail-loading">
        <div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] uppercase tracking-widest text-black/40 font-mono">Chargement de l'article...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center selection:bg-brand-taupe/20" id="blog-detail-error">
        <div className="p-4 bg-red-50 border border-red-500/10 text-red-800 text-xs rounded-sm mb-6">
          <span>{errorMessage}</span>
        </div>
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 px-8 py-3 bg-brand-noir hover:bg-brand-gold text-brand-cream hover:text-brand-noir text-[10px] uppercase tracking-widest font-bold transition-all rounded-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retourner aux conseils
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center selection:bg-brand-taupe/20" id="blog-detail-not-found">
        <BookOpen className="w-16 h-16 text-brand-taupe/30 mx-auto mb-6" />
        <h2 className="text-3xl font-serif italic text-black/80 mb-3">Conseil introuvable</h2>
        <p className="text-xs text-black/50 font-light leading-relaxed mb-8 max-w-sm mx-auto">
          L'article que vous cherchez n'existe pas ou n'est plus disponible.
        </p>
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 px-8 py-3 bg-brand-noir hover:bg-brand-gold text-brand-cream hover:text-brand-noir text-[10px] uppercase tracking-widest font-bold transition-all rounded-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retourner aux conseils
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen selection:bg-brand-taupe/20" id="blog-detail-article">
      
      {/* Article top breadcrumb / nav */}
      <nav className="max-w-7xl mx-auto px-6 lg:px-12 py-6 border-b border-black/5 flex items-center justify-between text-xs font-mono">
        <Link 
          to="/blog" 
          className="flex items-center gap-2 text-black/55 hover:text-brand-gold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux conseils
        </Link>

        <div className="hidden sm:flex items-center gap-2 text-black/30">
          <Link to="/" className="hover:text-black">Accueil</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/blog" className="hover:text-black">Conseils</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-black/60 truncate max-w-[150px]">{post.title}</span>
        </div>
      </nav>

      {/* Main Container */}
      <article className="max-w-4xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
        
        {/* Article Meta Header */}
        <header className="text-center space-y-6 max-w-2xl mx-auto mb-10">
          {post.category && (
            <span className="inline-block px-3 py-1 bg-brand-cream border border-black/5 text-brand-gold text-[9px] uppercase tracking-[0.2em] font-extrabold rounded-xs">
              {post.category}
            </span>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-black/90 leading-tight">
            {post.title}
          </h1>

          <div className="h-[2px] w-12 bg-brand-gold mx-auto"></div>

          <div className="flex items-center justify-center gap-6 text-[11px] text-black/40 font-mono font-light">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-taupe" />
              {formatFrenchDate(post.created_at)}
            </span>
            {post.reading_time && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-taupe" />
                Temps de lecture : {post.reading_time}
              </span>
            )}
          </div>
        </header>

        {/* Big Cover Image */}
        {post.cover_image && (
          <div className="w-full h-80 sm:h-96 md:h-[450px] bg-brand-cream border border-black/5 rounded-xs overflow-hidden shadow-2xs mb-12">
            <img 
              src={post.cover_image} 
              alt={post.title} 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Editorial Body: Split Grid on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Side block (Metadata, Author, Shares) */}
          <aside className="lg:col-span-3 space-y-8 border-b lg:border-b-0 lg:border-r border-black/5 pb-8 lg:pb-0 lg:pr-6 text-left shrink-0">
            
            {/* Author card */}
            <div className="flex lg:flex-col items-center lg:items-start gap-4">
              <div className="w-12 h-12 bg-brand-cream border border-brand-taupe/20 rounded-full flex items-center justify-center text-brand-taupe shadow-inner shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h5 className="text-[10px] uppercase tracking-wider font-mono font-bold text-brand-gold">
                  Rédigé par
                </h5>
                <p className="font-serif italic text-sm text-black/80 font-bold mt-0.5">
                  L'équipe 2M Cosmetics
                </p>
                <p className="text-[10px] text-black/40 font-light font-mono">
                  Conseil & Soins Dakar
                </p>
              </div>
            </div>

            {/* Micro Interaction panel (Like, Bookmark) */}
            <div className="flex gap-4 items-center">
              <button 
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-1.5 text-[11px] font-mono border px-3 py-1.5 rounded-full transition-all ${
                  liked 
                    ? 'bg-rose-50 border-rose-200 text-rose-600' 
                    : 'border-black/5 text-black/50 hover:text-black hover:border-black/15'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-600' : ''}`} />
                <span>{liked ? 'Aimé !' : 'Aimer'}</span>
              </button>

              <button className="p-1.5 border border-black/5 text-black/40 hover:text-black hover:border-black/15 rounded-full transition-all" title="Enregistrer l'article">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>

            {/* Social Share links */}
            <div className="space-y-3">
              <h5 className="text-[10px] uppercase tracking-wider font-mono font-bold text-black/40">
                Partager l'article
              </h5>
              <div className="flex lg:flex-col gap-2">
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center gap-2 px-3 py-2 border border-black/5 hover:bg-black hover:text-white rounded-xs text-[10px] font-mono text-black/60 transition-colors w-full justify-start"
                >
                  <Twitter className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">X (Twitter)</span>
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center gap-2 px-3 py-2 border border-black/5 hover:bg-black hover:text-white rounded-xs text-[10px] font-mono text-black/60 transition-colors w-full justify-start"
                >
                  <Facebook className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Facebook</span>
                </button>
                <button
                  onClick={() => handleShare('email')}
                  className="flex items-center gap-2 px-3 py-2 border border-black/5 hover:bg-black hover:text-white rounded-xs text-[10px] font-mono text-black/60 transition-colors w-full justify-start"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Email</span>
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="flex items-center gap-2 px-3 py-2 border border-black/5 hover:bg-black hover:text-white rounded-xs text-[10px] font-mono text-black/60 transition-colors w-full justify-start"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Copier le lien</span>
                </button>
              </div>

              {shareSuccess && (
                <p className="text-[9px] text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200 animate-fade-in font-mono">
                  Lien de l'article copié !
                </p>
              )}
            </div>
          </aside>

          {/* Core Markdown article details */}
          <div className="lg:col-span-9 max-w-none text-left">
            <div className="markdown-body">
              <Markdown>{post.content}</Markdown>
            </div>
          </div>

        </div>

        {/* Dynamic Gazette Footer */}
        <footer className="mt-16 pt-12 border-t border-black/5 text-center max-w-xl mx-auto space-y-4">
          <h4 className="font-serif italic text-xl text-black/80">
            Une question sur le choix de vos produits ?
          </h4>
          <p className="text-xs text-black/50 font-light leading-relaxed">
            Notre équipe à Dakar vous conseille pour sélectionner les produits les plus adaptés à vos besoins.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link 
              to="/produits" 
              className="inline-block px-6 py-2.5 bg-brand-noir hover:bg-brand-gold text-white hover:text-brand-noir rounded-sm text-[10px] font-mono tracking-widest uppercase font-bold transition-all shadow-xs"
            >
              Je découvre les produits
            </Link>
            <Link 
              to="/blog" 
              className="inline-block px-6 py-2.5 border border-black/10 hover:bg-brand-cream text-black/70 rounded-sm text-[10px] font-mono tracking-widest uppercase font-bold transition-all"
            >
              Je lis d'autres conseils
            </Link>
          </div>
        </footer>
      </article>

      {/* Recommended Next Readings */}
      {recommendations.length > 0 && (
        <section className="bg-brand-cream border-t border-black/5 py-16 text-left">
          <div className="max-w-4xl mx-auto px-6 lg:px-12">
            <h4 className="font-serif italic text-2xl text-black/95 mb-8">
              Poursuivre votre lecture...
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map(rec => (
                <Link 
                  key={rec.id}
                  to={`/blog/${rec.slug}`}
                  className="bg-white border border-black/5 hover:border-black/15 rounded-sm p-6 block group transition-all duration-300 shadow-2xs"
                >
                  <span className="text-[9px] uppercase tracking-widest font-mono text-brand-gold font-bold block mb-2">
                    {rec.category || 'Conseils'}
                  </span>
                  <h5 className="font-serif italic text-lg text-black/80 group-hover:text-brand-gold transition-colors leading-snug mb-2">
                    {rec.title}
                  </h5>
                  <p className="text-xs text-black/50 font-light line-clamp-2 leading-relaxed mb-4">
                    {rec.excerpt || "Lire les conseils de l'équipe 2M Cosmetics."}
                  </p>
                  <span className="text-[10px] font-mono font-bold text-black/70 group-hover:text-black transition-colors inline-flex items-center gap-1">
                    Je lis la suite <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
