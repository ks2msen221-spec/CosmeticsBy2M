import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types/catalog';
import { motion } from 'motion/react';
import { Sparkles, ArrowUpRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  key?: React.Key;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Format price in FCFA with space grouping
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const hasStock = product.stock > 0;
  const isLowStock = hasStock && product.stock <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="group bg-white border border-black/5 hover:border-brand-taupe/40 transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md relative"
    >
      {/* Visual Image container */}
      <div className="aspect-[4/5] bg-brand-cream relative overflow-hidden flex items-center justify-center">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="text-black/20 text-xs italic font-serif">2M Cosmetics</div>
        )}

        {/* Stock alerts and badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
          {!hasStock ? (
            <span className="bg-red-500 text-white text-[8px] uppercase tracking-widest font-extrabold px-2.5 py-1 rounded-sm">
              Rupture
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-500 text-white text-[8px] uppercase tracking-widest font-extrabold px-2.5 py-1 rounded-sm">
              Stock Limité
            </span>
          ) : null}
        </div>

        {/* Floating Quick Action overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
          <Link
            to={`/produit/${product.slug}`}
            className="bg-brand-cream text-brand-noir text-[10px] uppercase tracking-widest font-bold px-6 py-3 shadow-xl hover:bg-brand-noir hover:text-brand-cream transition-all flex items-center gap-1.5"
          >
            Je découvre le produit
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Information details */}
      <div className="p-6 flex-1 flex flex-col justify-between bg-white">
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between items-start gap-2">
            <span className="text-[9px] uppercase tracking-widest text-brand-taupe font-bold">
              {product.brand?.name || '2M Cosmetics'}
            </span>
            {product.category && (
              <span className="text-[9px] text-black/40 italic font-serif">
                {product.category.name}
              </span>
            )}
          </div>
          
          <h3 className="font-serif italic text-base text-black/90 group-hover:text-brand-gold transition-colors leading-snug line-clamp-2">
            <Link to={`/produit/${product.slug}`}>{product.name}</Link>
          </h3>
        </div>

        <div className="pt-4 border-t border-black/5 flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-black/80">
            {formatPrice(product.price)}
          </span>
          
          <Link
            to={`/produit/${product.slug}`}
            className="text-[10px] uppercase tracking-widest font-bold text-brand-noir group-hover:text-brand-gold transition-colors flex items-center gap-1"
          >
            Je découvre
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
