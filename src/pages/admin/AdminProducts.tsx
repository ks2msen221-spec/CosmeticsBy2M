import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Upload, 
  Loader2, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Check, 
  AlertTriangle,
  Calendar,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Archive,
  ArchiveRestore
} from 'lucide-react';
import { catalogService } from '../../lib/catalogService';
import { Product, Category, Brand } from '../../types/catalog';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // 'all' | 'active' | 'inactive'

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(0);
  const [formDescription, setFormDescription] = useState('');
  const [formIngredients, setFormIngredients] = useState('');
  const [formAllergens, setFormAllergens] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formBrandId, setFormBrandId] = useState('');
  const [formExpirationDate, setFormExpirationDate] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formActive, setFormActive] = useState(true);

  // UI status
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [conflictProduct, setConflictProduct] = useState<Product | null>(null);
  const [manualImageUrl, setManualImageUrl] = useState('');

  // Fetch initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats, brs] = await Promise.all([
        catalogService.getProducts({ includeInactive: true }),
        catalogService.getCategories(),
        catalogService.getBrands()
      ]);
      setProducts(prods);
      setCategories(cats);
      setBrands(brs);
    } catch (err) {
      console.error("Error loading products data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle auto-slugification
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormName(name);
    if (!editingProduct) {
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .trim()
        .replace(/\s+/g, '-') // replace spaces with hyphens
        .replace(/-+/g, '-'); // replace multiple hyphens
      setFormSlug(slug);
    }
  };

  // Start Create Mode
  const startCreate = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSlug('');
    setFormPrice(0);
    setFormStock(10);
    setFormDescription('');
    setFormIngredients('');
    setFormAllergens('');
    setFormCategoryId('');
    setFormBrandId('');
    setFormExpirationDate('');
    setFormImages([]);
    setFormActive(true);
    setErrorMessage('');
    setSuccessMessage('');
    setConflictProduct(null);
    setIsEditing(true);
  };

  // Start Edit Mode
  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormSlug(product.slug);
    setFormPrice(product.price);
    setFormStock(product.stock);
    setFormDescription(product.description || '');
    setFormIngredients(product.ingredients || '');
    setFormAllergens(product.allergens || '');
    setFormCategoryId(product.category_id || '');
    setFormBrandId(product.brand_id || '');
    setFormExpirationDate(product.expiration_date || '');
    setFormImages(product.images || []);
    setFormActive(product.active !== false && product.is_active !== false);
    setErrorMessage('');
    setSuccessMessage('');
    setConflictProduct(null);
    setIsEditing(true);
  };

  // Handle Multi Image Upload
  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMessage('');
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await catalogService.uploadImage(file, 'product-images');
        uploadedUrls.push(url);
      }
      setFormImages(prev => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage("Certaines images n'ont pas pu être téléversées. Veuillez réessayer.");
    } finally {
      setUploading(false);
    }
  };

  // Add Manual Image URL
  const addManualImageUrl = () => {
    if (!manualImageUrl.trim()) return;
    setFormImages(prev => [...prev, manualImageUrl.trim()]);
    setManualImageUrl('');
  };

  // Remove Image
  const removeImage = (indexToRemove: number) => {
    setFormImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Set Primary Image (move to index 0)
  const setPrimaryImage = (index: number) => {
    if (index === 0) return;
    setFormImages(prev => {
      const updated = [...prev];
      const [selected] = updated.splice(index, 1);
      updated.unshift(selected);
      return updated;
    });
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSlug.trim() || formPrice <= 0) {
      setErrorMessage("Le nom, le slug et un prix supérieur à 0 sont requis.");
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload: Omit<Product, 'id'> = {
        name: formName.trim(),
        slug: formSlug.trim(),
        price: Number(formPrice),
        stock: Number(formStock),
        description: formDescription.trim(),
        ingredients: formIngredients.trim() || null,
        allergens: formAllergens.trim() || null,
        category_id: formCategoryId || null,
        brand_id: formBrandId || null,
        expiration_date: formExpirationDate || null,
        images: formImages,
        active: formActive,
        is_active: formActive
      };

      if (editingProduct) {
        await catalogService.updateProduct(editingProduct.id, payload);
        setSuccessMessage(`Le produit "${payload.name}" a été mis à jour.`);
      } else {
        await catalogService.createProduct(payload);
        setSuccessMessage(`Le produit "${payload.name}" a été ajouté.`);
      }

      await loadData();
      setTimeout(() => {
        setIsEditing(false);
        setSuccessMessage('');
      }, 1500);

    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMessage("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Active Status directly from the list
  const toggleProductActive = async (product: Product) => {
    const currentActive = product.active !== false && product.is_active !== false;
    const newActive = !currentActive;
    
    try {
      // Optimistic update
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: newActive, is_active: newActive } : p));
      
      await catalogService.updateProduct(product.id, { 
        active: newActive,
        is_active: newActive 
      });
      
      setSuccessMessage(`Statut du produit "${product.name}" mis à jour.`);
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      console.error("Error toggling active state:", err);
      setErrorMessage("Impossible de modifier le statut d'activation.");
      // Rollback
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: currentActive, is_active: currentActive } : p));
    }
  };

  // Quick Deactivate for products in existing orders
  const handleQuickDeactivate = async (product: Product) => {
    try {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: false, is_active: false } : p));
      await catalogService.updateProduct(product.id, {
        active: false,
        is_active: false
      });
      setConflictProduct(null);
      setErrorMessage('');
      setSuccessMessage(`Le produit "${product.name}" a été désactivé du catalogue public.`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error("Error deactivating product:", err);
      setErrorMessage("Impossible de désactiver le produit.");
    }
  };

  // Handle Delete
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer définitivement le produit "${name}" ?`)) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setConflictProduct(null);

    try {
      await catalogService.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      setSuccessMessage(`Le produit "${name}" a été supprimé.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error("Delete error:", err);
      const targetProduct = products.find(p => p.id === id);
      const isFkConflict = 
        err?.code === '23503' || 
        err?.status === 409 || 
        err?.statusCode === 409 ||
        (typeof err?.message === 'string' && (
          err.message.includes('23503') || 
          err.message.toLowerCase().includes('foreign key') || 
          err.message.toLowerCase().includes('order_items') ||
          err.message.toLowerCase().includes('violates foreign key constraint')
        )) ||
        (typeof err?.details === 'string' && (
          err.details.includes('23503') || 
          err.details.toLowerCase().includes('foreign key') || 
          err.details.toLowerCase().includes('order_items')
        ));

      if (isFkConflict && targetProduct) {
        setConflictProduct(targetProduct);
      } else {
        setErrorMessage("Une erreur est survenue lors de la suppression.");
      }
    }
  };

  // Filter Logic
  const filteredProducts = products.filter(product => {
    // 1. Search term
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.ingredients && product.ingredients.toLowerCase().includes(searchTerm.toLowerCase()));

    // 2. Category filter
    const matchesCategory = !filterCategory || product.category_id === filterCategory;

    // 3. Brand filter
    const matchesBrand = !filterBrand || product.brand_id === filterBrand;

    // 4. Active status filter
    const isActive = product.active !== false && product.is_active !== false;
    const matchesActive = 
      filterActive === 'all' ||
      (filterActive === 'active' && isActive) ||
      (filterActive === 'inactive' && !isActive);

    return matchesSearch && matchesCategory && matchesBrand && matchesActive;
  });

  // Price formatter helper
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  return (
    <div className="space-y-8">
      {/* Success/Error Alerts */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-500/10 text-emerald-950 text-xs py-3.5 px-6 rounded-sm shadow-xs animate-fade-in flex items-center justify-between">
          <span className="font-semibold">✨ {successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-500/10 text-rose-950 text-xs py-3.5 px-6 rounded-sm shadow-xs">
          <span className="font-medium">⚠️ {errorMessage}</span>
        </div>
      )}
      {conflictProduct && (
        <div className="bg-amber-50 border border-amber-500/20 text-amber-950 text-xs py-4 px-6 rounded-sm shadow-xs animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Suppression impossible : produit associé à des commandes existantes</span>
            </div>
            <p className="text-amber-800/90 leading-relaxed max-w-2xl">
              Ce produit ne peut pas être supprimé car il figure dans au moins une commande existante. Pour le retirer du catalogue, désactivez-le plutôt via le statut de visibilité (bouton toggle dans la fiche produit).
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleQuickDeactivate(conflictProduct)}
              className="px-4 py-2 bg-amber-900 hover:bg-amber-800 text-amber-50 text-[10px] uppercase tracking-wider font-bold rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <EyeOff className="w-3.5 h-3.5" />
              Désactiver ce produit
            </button>
            <button
              onClick={() => setConflictProduct(null)}
              className="p-1.5 text-amber-800/60 hover:text-amber-950 transition-colors cursor-pointer rounded-xs"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mode 1: Creating / Editing Form */}
      {isEditing ? (
        <div className="max-w-4xl bg-white border border-black/5 rounded-sm shadow-md overflow-hidden">
          <header className="border-b border-black/5 px-6 py-5 bg-brand-cream flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsEditing(false)}
                className="p-1.5 hover:bg-black/5 rounded transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-black/60" />
              </button>
              <div>
                <h2 className="font-serif italic text-lg text-black/90">
                  {editingProduct ? `Modifier : ${editingProduct.name}` : "Ajouter une Formulation Dermatologique"}
                </h2>
                <p className="text-[10px] text-black/40 font-mono mt-0.5 uppercase tracking-wider">
                  Maison 2M Cosmetics Dakar • Fiche Produit
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsEditing(false)}
              className="p-1 hover:bg-black/5 rounded transition-all text-black/40 hover:text-black/70 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-brand-gold font-bold border-b border-black/5 pb-1">
                Informations de base
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                    Nom du soin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={handleNameChange}
                    placeholder="ex: Sérum Régénérant au Moringa"
                    className="w-full bg-brand-cream border border-black/10 focus:border-brand-gold focus:outline-hidden text-xs px-3.5 py-2.5 rounded-sm transition-colors text-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                    Slug (URL) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="ex: serum-regenerant-moringa"
                    className="w-full bg-brand-cream border border-black/10 focus:border-brand-gold focus:outline-hidden text-xs px-3.5 py-2.5 rounded-sm transition-colors text-black font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Price, Stock and Expiration */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-brand-gold font-bold border-b border-black/5 pb-1">
                Prix et stock
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                    Prix public (FCFA) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formPrice || ''}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    placeholder="ex: 28000"
                    className="w-full bg-brand-cream border border-black/10 focus:border-brand-gold focus:outline-hidden text-xs px-3.5 py-2.5 rounded-sm transition-colors text-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                    Stock disponible <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    placeholder="ex: 24"
                    className="w-full bg-brand-cream border border-black/10 focus:border-brand-gold focus:outline-hidden text-xs px-3.5 py-2.5 rounded-sm transition-colors text-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                    Date d'expiration (facultatif)
                  </label>
                  <input
                    type="date"
                    value={formExpirationDate}
                    onChange={(e) => setFormExpirationDate(e.target.value)}
                    className="w-full bg-brand-cream border border-black/10 focus:border-brand-gold focus:outline-hidden text-xs px-3.5 py-2.5 rounded-sm transition-colors text-black"
                  />
                </div>
              </div>
            </div>

            {/* Classifications */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-brand-gold font-bold border-b border-black/5 pb-1">
                Classification
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                    Catégorie
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full bg-brand-cream border border-black/10 focus:border-brand-gold focus:outline-hidden text-xs px-3.5 py-2.5 rounded-sm transition-colors text-black"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                    Marque
                  </label>
                  <select
                    value={formBrandId}
                    onChange={(e) => setFormBrandId(e.target.value)}
                    className="w-full bg-brand-cream border border-black/10 focus:border-brand-gold focus:outline-hidden text-xs px-3.5 py-2.5 rounded-sm transition-colors text-black"
                  >
                    <option value="">Sélectionner une marque</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Descriptions & Formulations */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-brand-gold font-bold border-b border-black/5 pb-1">
                Description & composition
              </h3>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Décrivez les bénéfices, la texture, l'application et les rituels conseillés..."
                    className="w-full bg-brand-cream border border-black/10 focus:border-brand-gold focus:outline-hidden text-xs p-3.5 rounded-sm transition-colors text-black leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                      Ingrédients
                    </label>
                    <textarea
                      rows={3}
                      value={formIngredients}
                      onChange={(e) => setFormIngredients(e.target.value)}
                      placeholder="Aqua, Moringa seed oil, Hyaluronic acid..."
                      className="w-full bg-brand-cream border border-black/10 focus:border-brand-gold focus:outline-hidden text-xs p-3.5 rounded-sm transition-colors text-black leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                      Allergènes et précautions
                    </label>
                    <textarea
                      rows={3}
                      value={formAllergens}
                      onChange={(e) => setFormAllergens(e.target.value)}
                      placeholder="Ex: Contient des traces de noix. Éviter le contour des yeux."
                      className="w-full bg-brand-cream border border-black/10 focus:border-brand-gold focus:outline-hidden text-xs p-3.5 rounded-sm transition-colors text-black leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Multi Image Manager */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-brand-gold font-bold border-b border-black/5 pb-1">
                Photos du produit
              </h3>

              <div className="space-y-4">
                {/* Images Preview Grid */}
                {formImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                    {formImages.map((imgUrl, index) => (
                      <div 
                        key={index} 
                        className="aspect-[4/5] bg-brand-cream border border-black/10 rounded-sm overflow-hidden relative group/img shadow-xs"
                      >
                        <img 
                          src={imgUrl} 
                          alt={`Soin ${index + 1}`} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                        
                        {/* Primary Badge */}
                        {index === 0 ? (
                          <span className="absolute top-2 left-2 bg-brand-noir text-brand-cream text-[7px] uppercase tracking-widest px-2 py-0.5 rounded-xs font-extrabold z-10">
                            Photo Principale
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(index)}
                            className="absolute top-2 left-2 bg-white/90 hover:bg-white text-black text-[7px] uppercase tracking-widest px-2 py-0.5 rounded-xs font-extrabold z-10 shadow-xs hidden group-hover/img:block cursor-pointer transition-all"
                          >
                            Rendre principale
                          </button>
                        )}

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full z-10 shadow-xs opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer"
                          title="Supprimer cette image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* File Uploader */}
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center bg-brand-cream p-5 border border-black/5 rounded-sm">
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-semibold text-black/80">Ajouter des photos</p>
                    <p className="text-[10px] text-black/40">Vous pouvez téléverser plusieurs photos à la fois vers le dossier d'images Supabase.</p>
                  </div>

                  <div className="shrink-0 flex items-center">
                    <label className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-black/5 border border-black/15 rounded-sm cursor-pointer text-xs font-bold text-black/70 transition-all shadow-xs">
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-brand-gold" />
                          Téléchargement en cours...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-brand-gold" />
                          Téléverser des photos
                        </>
                      )}
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={handleImagesUpload} 
                        disabled={uploading}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                {/* Add Raw URL */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualImageUrl}
                    onChange={(e) => setManualImageUrl(e.target.value)}
                    placeholder="Ou collez un lien direct d'image externe"
                    className="flex-grow bg-brand-cream border border-black/10 focus:border-brand-gold focus:outline-hidden text-xs px-3.5 py-2.5 rounded-sm transition-colors text-black font-mono"
                  />
                  <button
                    type="button"
                    onClick={addManualImageUrl}
                    className="px-5 py-2.5 bg-black/5 hover:bg-black/10 border border-black/10 text-black text-xs font-bold rounded-sm transition-all cursor-pointer"
                  >
                    Ajouter URL
                  </button>
                </div>
              </div>
            </div>

            {/* Visibility Toggle */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-brand-gold font-bold border-b border-black/5 pb-1">
                Statut de visibilité
              </h3>

              <div className="flex items-center gap-4 bg-brand-cream p-4 border border-black/5 rounded-sm">
                <button
                  type="button"
                  onClick={() => setFormActive(!formActive)}
                  className={`
                    w-12 h-6 rounded-full p-1 transition-all duration-300 relative cursor-pointer
                    ${formActive ? 'bg-emerald-600' : 'bg-black/20'}
                  `}
                >
                  <div className={`
                    w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm
                    ${formActive ? 'translate-x-6' : 'translate-x-0'}
                  `}></div>
                </button>
                
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-black/80 flex items-center gap-1.5">
                    {formActive ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        Actif et visible sur la boutique dakaroise
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-black/40" />
                        Désactivé (invisible pour les clientes sans supprimer la fiche)
                      </>
                    )}
                  </p>
                  <p className="text-[10px] text-black/40">Permet de suspendre un produit temporairement en cas de rupture de stock prolongée.</p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-6 border-t border-black/5 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 bg-transparent hover:bg-black/5 text-xs text-black/60 hover:text-black font-semibold rounded-sm transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting || uploading}
                className="px-10 py-3 bg-brand-noir hover:bg-brand-gold text-white hover:text-white disabled:bg-black/20 text-xs font-bold uppercase tracking-widest rounded-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingProduct ? "Mettre à jour le soin" : "Publier le produit"}
              </button>
            </div>

          </form>
        </div>
      ) : (
        /* Mode 2: Interactive Product List with Filtering */
        <div className="space-y-6">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-black/5">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-bold block mb-1">
                Console d'Administration
              </span>
              <h1 className="text-3xl font-serif italic text-black/90">Gestion des Produits</h1>
              <p className="text-xs text-black/50 font-light mt-1">
                Pilotez la visibilité, l'inventaire, les prix et les formulations de l'officine.
              </p>
            </div>

            <button
              onClick={startCreate}
              className="px-6 py-3.5 bg-brand-noir hover:bg-brand-gold text-brand-cream hover:text-brand-noir text-[10px] uppercase tracking-widest font-bold rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Ajouter un Produit
            </button>
          </header>

          {/* Filtering Bento Bar */}
          <div className="bg-white border border-black/5 p-5 rounded-sm shadow-xs space-y-4">
            <div className="flex items-center gap-3 bg-brand-cream border border-black/10 px-4 py-3 rounded-sm">
              <Search className="w-4 h-4 text-black/40 shrink-0" />
              <input
                type="text"
                placeholder="Rechercher par nom, bénéfices ou formule INCI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-xs focus:outline-hidden text-black placeholder-black/30"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="text-[10px] text-black/40 hover:text-black cursor-pointer">
                  Effacer
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-extrabold text-black/40">Filtrer par Catégorie</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full bg-brand-cream border border-black/5 focus:border-brand-gold focus:outline-hidden text-xs p-2 rounded-sm text-black"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-extrabold text-black/40">Filtrer par Marque</label>
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="w-full bg-brand-cream border border-black/5 focus:border-brand-gold focus:outline-hidden text-xs p-2 rounded-sm text-black"
                >
                  <option value="">Toutes les marques</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-extrabold text-black/40">Statut de Visibilité</label>
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value)}
                  className="w-full bg-brand-cream border border-black/5 focus:border-brand-gold focus:outline-hidden text-xs p-2 rounded-sm text-black"
                >
                  <option value="all">Tous les produits</option>
                  <option value="active">Actifs uniquement</option>
                  <option value="inactive">Désactivés uniquement</option>
                </select>
              </div>
            </div>
          </div>

          {/* List display */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-black/5 rounded-sm">
              <Loader2 className="w-8 h-8 text-brand-gold animate-spin mb-3" />
              <p className="text-xs text-black/40 font-mono uppercase tracking-widest">Chargement des formulations...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="border border-dashed border-black/10 rounded-sm bg-white p-12 text-center shadow-xs">
              <Package className="w-12 h-12 text-brand-gold/30 mx-auto mb-4" />
              <h3 className="text-lg font-serif italic text-black/80 mb-2">Aucun soin ne correspond</h3>
              <p className="text-xs text-black/50 font-light max-w-md mx-auto leading-relaxed">
                Ajustez vos filtres de recherche ou commencez par ajouter de nouveaux soins au catalogue.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const isActive = product.active !== false && product.is_active !== false;
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= 5;

                return (
                  <div 
                    key={product.id}
                    className={`
                      bg-white border rounded-sm overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-all group relative
                      ${isActive ? 'border-black/5' : 'border-black/5 bg-brand-noir/2 border-dashed'}
                    `}
                  >
                    {/* Image Header with status toggle */}
                    <div className="aspect-[4/3] bg-brand-cream relative overflow-hidden flex items-center justify-center">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          referrerPolicy="no-referrer"
                          className={`
                            w-full h-full object-cover group-hover:scale-103 transition-transform duration-500
                            ${isActive ? '' : 'grayscale opacity-60'}
                          `}
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-black/10" />
                      )}

                      {/* Active Toggle overlay badge */}
                      <button
                        onClick={() => toggleProductActive(product)}
                        className={`
                          absolute top-4 left-4 text-[8px] uppercase tracking-widest font-extrabold px-2.5 py-1 rounded-xs shadow-xs z-10 flex items-center gap-1 transition-all cursor-pointer
                          ${isActive 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                            : 'bg-black/60 hover:bg-black/80 text-brand-cream'
                          }
                        `}
                        title={isActive ? "Masquer sur le site" : "Rendre visible sur le site"}
                      >
                        {isActive ? (
                          <>
                            <Eye className="w-2.5 h-2.5" /> Visible
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-2.5 h-2.5 text-amber-500" /> Inactif
                          </>
                        )}
                      </button>

                      {/* Stock Badge overlay */}
                      <div className="absolute top-4 right-4 z-10">
                        {isOutOfStock ? (
                          <span className="bg-red-600 text-white text-[8px] uppercase tracking-widest font-extrabold px-2 py-1 rounded-xs flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" /> En Rupture
                          </span>
                        ) : isLowStock ? (
                          <span className="bg-amber-500 text-white text-[8px] uppercase tracking-widest font-extrabold px-2 py-1 rounded-xs">
                            Bas Stock ({product.stock})
                          </span>
                        ) : (
                          <span className="bg-white/80 backdrop-blur-xs text-black/70 text-[8px] uppercase tracking-widest px-2 py-1 rounded-xs font-mono">
                            Stock: {product.stock}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between bg-white space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-bold text-brand-gold">
                          <span>{product.brand?.name || brands.find(b => b.id === product.brand_id)?.name || 'Maison 2M'}</span>
                          <span className="text-black/40 normal-case font-serif italic">
                            {product.category?.name || categories.find(c => c.id === product.category_id)?.name || 'Cosmétique'}
                          </span>
                        </div>

                        <h3 className="font-serif italic text-base text-black/90 group-hover:text-brand-gold transition-colors line-clamp-2 leading-snug">
                          {product.name}
                        </h3>

                        {product.expiration_date && (
                          <div className="flex items-center gap-1 text-[9px] text-black/40 font-mono">
                            <Calendar className="w-3 h-3 text-brand-gold/60" />
                            <span>Exp: {product.expiration_date}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-black/90">
                          {formatPrice(product.price)}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleProductActive(product)}
                            className={`p-1.5 rounded transition-colors cursor-pointer ${
                              isActive 
                                ? 'hover:bg-amber-50 text-amber-700/70 hover:text-amber-800' 
                                : 'hover:bg-emerald-50 text-emerald-700/70 hover:text-emerald-800'
                            }`}
                            title={isActive ? "Archiver (retirer du catalogue)" : "Désarchiver (rendre visible)"}
                          >
                            {isActive ? (
                              <Archive className="w-3.5 h-3.5" />
                            ) : (
                              <ArchiveRestore className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => startEdit(product)}
                            className="p-1.5 hover:bg-black/5 rounded text-black/60 hover:text-black transition-colors cursor-pointer"
                            title="Modifier la fiche"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-1.5 hover:bg-red-50 rounded text-red-600/60 hover:text-red-700 transition-colors cursor-pointer"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
