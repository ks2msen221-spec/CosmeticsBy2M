import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Upload, 
  Loader2, 
  ArrowLeft, 
  Package, 
  Check, 
  AlertTriangle,
  Eye,
  EyeOff,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { catalogService } from '../../lib/catalogService';
import { Product } from '../../types/catalog';

interface CatalogueItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface DeleteConfirmModalData {
  catalogue: CatalogueItem;
  productCount: number;
}

export default function AdminCatalogues() {
  // Main state
  const [catalogues, setCatalogues] = useState<CatalogueItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  // Mapping catalogue_id -> Set of product_id
  const [associations, setAssociations] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // View state: 'list' | 'form' | 'products'
  const [activeView, setActiveView] = useState<'list' | 'form' | 'products'>('list');

  // Form / Editor state
  const [editingCatalogue, setEditingCatalogue] = useState<CatalogueItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCoverImageUrl, setFormCoverImageUrl] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Status & Feedback state
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Product association view state
  const [selectedCatalogueForProducts, setSelectedCatalogueForProducts] = useState<CatalogueItem | null>(null);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);

  // Delete modal state
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<DeleteConfirmModalData | null>(null);

  // Helper to generate slug
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^a-z0-9\s-]/g, '') // remove special chars
      .trim()
      .replace(/\s+/g, '-') // replace spaces with hyphens
      .replace(/-+/g, '-'); // replace multiple hyphens
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormName(val);
    if (!editingCatalogue) {
      setFormSlug(generateSlug(val));
    }
  };

  // Load all data
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch products
      const allProducts = await catalogService.getProducts({ includeInactive: false });
      setProducts(allProducts);

      // 2. Fetch catalogues
      let catData: CatalogueItem[] = [];
      if (supabase) {
        const { data, error } = await supabase
          .from('catalogues')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching catalogues from Supabase:", error);
        } else if (data) {
          catData = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            description: item.description || null,
            cover_image_url: item.cover_image_url || null,
            is_active: item.is_active !== false,
            created_at: item.created_at,
            updated_at: item.updated_at
          }));
        }
      }

      // Fallback if empty or Supabase unavailable
      if (catData.length === 0) {
        const mockCats = await catalogService.getCatalogues();
        catData = mockCats.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || null,
          cover_image_url: (c as any).cover_image_url || null,
          is_active: (c as any).is_active !== false,
        }));
      }

      setCatalogues(catData);

      // 3. Fetch catalogue_products associations
      const assocMap: Record<string, Set<string>> = {};
      if (supabase) {
        const { data: assocData, error: assocErr } = await supabase
          .from('catalogue_products')
          .select('catalogue_id, product_id');

        if (!assocErr && assocData) {
          assocData.forEach((row: any) => {
            if (!assocMap[row.catalogue_id]) {
              assocMap[row.catalogue_id] = new Set();
            }
            assocMap[row.catalogue_id].add(row.product_id);
          });
        }
      }

      setAssociations(assocMap);

    } catch (err) {
      console.error("Error loading catalogue data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers for Form
  const startCreate = () => {
    setEditingCatalogue(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormCoverImageUrl('');
    setFormIsActive(true);
    setErrorMessage('');
    setSuccessMessage('');
    setActiveView('form');
  };

  const startEdit = (cat: CatalogueItem) => {
    setEditingCatalogue(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description || '');
    setFormCoverImageUrl(cat.cover_image_url || '');
    setFormIsActive(cat.is_active);
    setErrorMessage('');
    setSuccessMessage('');
    setActiveView('form');
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMessage('');
    try {
      const publicUrl = await catalogService.uploadImage(file, 'catalogue-images');
      setFormCoverImageUrl(publicUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage("Erreur lors du téléversement de l'image de couverture.");
    } finally {
      setUploading(false);
    }
  };

  // Submit Catalogue Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSlug.trim()) {
      setErrorMessage("Le nom et le slug du catalogue sont obligatoires.");
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        name: formName.trim(),
        slug: formSlug.trim(),
        description: formDescription.trim() || null,
        cover_image_url: formCoverImageUrl.trim() || null,
        is_active: formIsActive,
        updated_at: new Date().toISOString()
      };

      if (editingCatalogue) {
        // Update
        if (supabase) {
          const { error } = await supabase
            .from('catalogues')
            .update(payload)
            .eq('id', editingCatalogue.id);

          if (error) throw error;
        }

        setCatalogues(prev => prev.map(c => c.id === editingCatalogue.id ? { ...c, ...payload } : c));
        setSuccessMessage(`Le catalogue "${payload.name}" a été mis à jour.`);
      } else {
        // Create
        let newId = crypto.randomUUID ? crypto.randomUUID() : `cat_${Date.now()}`;
        if (supabase) {
          const { data, error } = await supabase
            .from('catalogues')
            .insert([{ ...payload, created_at: new Date().toISOString() }])
            .select()
            .single();

          if (error) throw error;
          if (data) newId = data.id;
        }

        const newCat: CatalogueItem = {
          id: newId,
          ...payload
        };

        setCatalogues(prev => [newCat, ...prev]);
        setSuccessMessage(`Le catalogue "${payload.name}" a été créé avec succès.`);
      }

      setTimeout(() => {
        setActiveView('list');
        setSuccessMessage('');
      }, 1200);

    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMessage("Impossible d'enregistrer le catalogue. Vérifiez les champs et vos droits RLS.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete flow
  const handleDeleteRequest = (cat: CatalogueItem) => {
    const associatedCount = associations[cat.id]?.size || 0;
    if (associatedCount > 0) {
      // Show custom confirmation modal for catalogue with associated products
      setDeleteConfirmModal({
        catalogue: cat,
        productCount: associatedCount
      });
    } else {
      // Direct deletion with simple confirm
      if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le catalogue "${cat.name}" ?`)) {
        performDeleteCatalogue(cat.id, cat.name, false);
      }
    }
  };

  const performDeleteCatalogue = async (catalogueId: string, name: string, deleteAssociationsFirst: boolean) => {
    try {
      if (supabase) {
        if (deleteAssociationsFirst) {
          const { error: assocErr } = await supabase
            .from('catalogue_products')
            .delete()
            .eq('catalogue_id', catalogueId);
          if (assocErr) console.error("Error deleting catalogue_products:", assocErr);
        }

        const { error: catErr } = await supabase
          .from('catalogues')
          .delete()
          .eq('id', catalogueId);
        if (catErr) throw catErr;
      }

      setCatalogues(prev => prev.filter(c => c.id !== catalogueId));
      setAssociations(prev => {
        const copy = { ...prev };
        delete copy[catalogueId];
        return copy;
      });

      setDeleteConfirmModal(null);
      setSuccessMessage(`Le catalogue "${name}" a été supprimé.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error("Delete error:", err);
      setErrorMessage("Erreur lors de la suppression du catalogue.");
    }
  };

  // Open Product Association view
  const startManageProducts = (cat: CatalogueItem) => {
    setSelectedCatalogueForProducts(cat);
    setProductSearchTerm('');
    setErrorMessage('');
    setSuccessMessage('');
    setActiveView('products');
  };

  // Toggle product association in catalogue_products
  const toggleProductAssociation = async (productId: string) => {
    if (!selectedCatalogueForProducts) return;
    const catId = selectedCatalogueForProducts.id;

    const currentSet = new Set(associations[catId] || []);
    const isAssociated = currentSet.has(productId);

    setUpdatingProductId(productId);

    try {
      if (isAssociated) {
        // Remove association
        if (supabase) {
          const { error } = await supabase
            .from('catalogue_products')
            .delete()
            .match({ catalogue_id: catId, product_id: productId });

          if (error) throw error;
        }
        currentSet.delete(productId);
      } else {
        // Add association
        if (supabase) {
          const { error } = await supabase
            .from('catalogue_products')
            .insert([{ catalogue_id: catId, product_id: productId }]);

          if (error) throw error;
        }
        currentSet.add(productId);
      }

      setAssociations(prev => ({
        ...prev,
        [catId]: currentSet
      }));

    } catch (err: any) {
      console.error("Error updating product association:", err);
      setErrorMessage("Impossible de mettre à jour l'association du produit.");
    } finally {
      setUpdatingProductId(null);
    }
  };

  // Filtered lists
  const filteredCatalogues = catalogues.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    (p.brand?.name && p.brand.name.toLowerCase().includes(productSearchTerm.toLowerCase()))
  );

  const currentAssociatedSet = selectedCatalogueForProducts ? (associations[selectedCatalogueForProducts.id] || new Set()) : new Set();

  return (
    <div className="space-y-8">
      {/* Top Banner Notifications */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-500/10 text-emerald-950 text-xs py-3.5 px-6 rounded-sm flex items-center justify-between shadow-xs animate-fade-in">
          <span className="font-medium">✨ {successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-500/10 text-rose-950 text-xs py-3.5 px-6 rounded-sm flex items-center justify-between shadow-xs">
          <span className="font-medium">⚠️ {errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="text-rose-700 hover:text-rose-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-black/10 rounded-sm shadow-2xl max-w-md w-full p-6 space-y-5 animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-50 rounded-full text-amber-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif italic text-lg text-black/90">
                  Supprimer le catalogue ?
                </h3>
                <p className="text-xs text-black/70 leading-relaxed font-light">
                  Ce catalogue <strong className="font-semibold text-black">"{deleteConfirmModal.catalogue.name}"</strong> contient actuellement <strong className="font-semibold text-amber-700">{deleteConfirmModal.productCount} produit(s) associé(s)</strong>.
                </p>
                <p className="text-[11px] text-black/50 font-light italic pt-1">
                  Les retirer d'abord, ou supprimer le catalogue quand même ?
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
              <button
                onClick={() => setDeleteConfirmModal(null)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-black/70 text-xs font-semibold rounded-sm transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => performDeleteCatalogue(deleteConfirmModal.catalogue.id, deleteConfirmModal.catalogue.name, true)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Supprimer quand même
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: FORM / EDITOR MODE */}
      {activeView === 'form' && (
        <div className="max-w-2xl bg-white border border-black/5 rounded-sm shadow-md overflow-hidden">
          <header className="border-b border-black/5 px-6 py-5 bg-brand-cream flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveView('list')}
                className="p-1.5 hover:bg-black/5 rounded transition-all cursor-pointer"
                title="Retour"
              >
                <ArrowLeft className="w-4 h-4 text-black/60" />
              </button>
              <div>
                <h2 className="font-serif italic text-lg text-black/90">
                  {editingCatalogue ? `Modifier : ${editingCatalogue.name}` : "Nouveau Catalogue Thématique"}
                </h2>
                <p className="text-[10px] text-black/40 font-mono mt-0.5 uppercase tracking-wider">
                  Maison 2M Cosmetics Dakar
                </p>
              </div>
            </div>
            <button 
              onClick={() => setActiveView('list')}
              className="p-1 hover:bg-black/5 rounded transition-all cursor-pointer text-black/40 hover:text-black/70"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <form onSubmit={handleSubmitForm} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Catalogue Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                  Nom du catalogue <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={handleNameChange}
                  placeholder="ex: Sélection Botanique"
                  className="w-full bg-brand-cream border border-black/10 focus:border-brand-taupe focus:outline-hidden text-xs px-3.5 py-2.5 rounded-sm transition-colors text-black"
                />
              </div>

              {/* Catalogue Slug */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                  Identifiant URL (Slug) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="ex: selection-botanique"
                  className="w-full bg-brand-cream border border-black/10 focus:border-brand-taupe focus:outline-hidden text-xs px-3.5 py-2.5 rounded-sm transition-colors text-black font-mono"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                Description du catalogue
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Rédigez la présentation ou la ligne thématique de ce catalogue..."
                rows={4}
                className="w-full bg-brand-cream border border-black/10 focus:border-brand-taupe focus:outline-hidden text-xs p-3.5 rounded-sm transition-colors text-black leading-relaxed"
              />
            </div>

            {/* Active Status Toggle */}
            <div className="flex items-center justify-between p-4 bg-brand-cream border border-black/5 rounded-sm">
              <div>
                <label className="text-xs font-bold text-black/80 block">
                  Statut d'affichage
                </label>
                <p className="text-[10px] text-black/50 font-light">
                  {formIsActive ? "Visible en boutique et accessible aux clients." : "Masqué des sélections publiques."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFormIsActive(!formIsActive)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                  formIsActive 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-gray-200 text-gray-700 border border-gray-300'
                }`}
              >
                {formIsActive ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    Actif
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    Inactif
                  </>
                )}
              </button>
            </div>

            {/* Cover Image Upload */}
            <div className="space-y-2.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                Image de couverture
              </label>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="w-24 h-24 rounded-sm bg-brand-cream border border-black/10 flex items-center justify-center overflow-hidden shrink-0 relative">
                  {formCoverImageUrl ? (
                    <img 
                      src={formCoverImageUrl} 
                      alt="Aperçu couverture" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-black/20" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-black/5 border border-black/10 rounded-sm cursor-pointer text-xs font-semibold text-black/70 transition-all">
                      {uploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Téléchargement...
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          Téléverser une couverture
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        disabled={uploading}
                        className="hidden" 
                      />
                    </label>
                    {formCoverImageUrl && (
                      <button
                        type="button"
                        onClick={() => setFormCoverImageUrl('')}
                        className="text-[10px] text-red-500 hover:underline cursor-pointer"
                      >
                        Retirer
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] text-black/40">
                    Image haute définition recommandée. Stockée dans le bucket "catalogue-images".
                  </p>
                </div>
              </div>

              {/* Raw URL alternative */}
              <div className="pt-2">
                <input
                  type="text"
                  value={formCoverImageUrl}
                  onChange={(e) => setFormCoverImageUrl(e.target.value)}
                  placeholder="Ou collez un lien d'image externe (facultatif)"
                  className="w-full bg-brand-cream border border-black/5 focus:border-brand-taupe focus:outline-hidden text-[10px] px-3.5 py-2 rounded-sm transition-colors text-black/60 font-mono"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-black/5 flex items-center justify-end gap-3.5">
              <button
                type="button"
                onClick={() => setActiveView('list')}
                className="px-6 py-2.5 bg-transparent hover:bg-black/5 text-xs text-black/60 hover:text-black font-semibold rounded-sm transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting || uploading}
                className="px-8 py-2.5 bg-brand-noir hover:bg-brand-taupe text-white hover:text-white disabled:bg-black/20 text-xs font-bold uppercase tracking-widest rounded-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingCatalogue ? "Enregistrer les modifications" : "Créer le catalogue"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 2: PRODUCT ASSOCIATION MANAGEMENT */}
      {activeView === 'products' && selectedCatalogueForProducts && (
        <div className="space-y-6">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-black/5">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveView('list')}
                className="p-2 hover:bg-black/5 rounded transition-all cursor-pointer"
                title="Retour aux catalogues"
              >
                <ArrowLeft className="w-5 h-5 text-black/60" />
              </button>
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-brand-taupe font-bold block mb-1">
                  Gestion des associations
                </span>
                <h1 className="text-2xl font-serif italic text-black/90">
                  Gérer les produits : {selectedCatalogueForProducts.name}
                </h1>
                <p className="text-xs text-black/50 font-light mt-0.5">
                  Cochez les produits à inclure dans ce catalogue thématique. Chaque modification prend effet immédiatement.
                </p>
              </div>
            </div>

            <div className="px-4 py-2.5 bg-brand-cream border border-brand-taupe/30 rounded-sm shrink-0 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-taupe" />
              <span className="text-xs font-bold text-black/80 font-mono">
                {currentAssociatedSet.size} produit(s) sélectionné(s)
              </span>
            </div>
          </header>

          {/* Product Search Bar */}
          <div className="flex items-center gap-3 bg-white border border-black/5 p-4 rounded-sm shadow-xs">
            <Search className="w-4 h-4 text-black/40 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher un produit par nom ou marque..."
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs focus:outline-hidden text-black placeholder-black/30"
            />
            {productSearchTerm && (
              <button 
                onClick={() => setProductSearchTerm('')} 
                className="text-[10px] text-black/40 hover:text-black cursor-pointer"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Product List */}
          {filteredProducts.length === 0 ? (
            <div className="border border-dashed border-black/10 rounded-sm bg-white p-12 text-center">
              <Package className="w-12 h-12 text-brand-taupe/30 mx-auto mb-4" />
              <h3 className="text-lg font-serif italic text-black/80 mb-2">Aucun produit trouvé</h3>
              <p className="text-xs text-black/50 font-light max-w-md mx-auto leading-relaxed">
                {productSearchTerm ? "Aucun produit actif ne correspond à votre filtre." : "Aucun produit actif n'est enregistré dans la boutique."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const isChecked = currentAssociatedSet.has(product.id);
                const isUpdating = updatingProductId === product.id;

                return (
                  <div
                    key={product.id}
                    onClick={() => !isUpdating && toggleProductAssociation(product.id)}
                    className={`bg-white border rounded-sm p-4 flex items-center gap-4 transition-all cursor-pointer select-none ${
                      isChecked 
                        ? 'border-brand-taupe bg-brand-cream/80 shadow-xs' 
                        : 'border-black/5 hover:border-black/20 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="relative flex items-center justify-center shrink-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Handled by card click
                        className="w-5 h-5 accent-brand-taupe rounded-xs cursor-pointer"
                      />
                      {isUpdating && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                          <Loader2 className="w-3.5 h-3.5 text-brand-taupe animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Image Thumbnail */}
                    <div className="w-12 h-12 bg-white border border-black/10 rounded-sm flex items-center justify-center overflow-hidden shrink-0">
                      {product.images && product.images[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-black/20" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-black/90 truncate leading-snug">
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-black/50 font-mono mt-0.5">
                        {product.brand?.name || 'Marque partenaire'}
                      </p>
                      <p className="text-[11px] font-bold text-brand-taupe mt-1 font-serif">
                        {product.price.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>

                    {/* Check Badge indicator */}
                    {isChecked && (
                      <div className="p-1 bg-brand-taupe text-white rounded-full shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: CATALOGUES LIST VIEW (DEFAULT) */}
      {activeView === 'list' && (
        <div className="space-y-6">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-black/5">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-brand-taupe font-bold block mb-1">
                Console d'Administration
              </span>
              <h1 className="text-3xl font-serif italic text-black/90">Gestion des Catalogues</h1>
              <p className="text-xs text-black/50 font-light mt-1">
                Organisez les catalogues thématiques et collections saisonnières (ex: Nouveautés, Sélection Botanique, routines de l'Aïd).
              </p>
            </div>

            <button
              onClick={startCreate}
              className="px-5 py-3 bg-brand-noir hover:bg-brand-taupe text-brand-cream text-[10px] uppercase tracking-widest font-bold rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nouveau Catalogue
            </button>
          </header>

          {/* Search Bar */}
          <div className="flex items-center gap-3 bg-white border border-black/5 p-4 rounded-sm shadow-xs">
            <Search className="w-4 h-4 text-black/40 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher un catalogue par nom, description ou slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs focus:outline-hidden text-black placeholder-black/30"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="text-[10px] text-black/40 hover:text-black cursor-pointer"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Catalogues Cards Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-black/5 rounded-sm">
              <Loader2 className="w-8 h-8 text-brand-taupe animate-spin mb-3" />
              <p className="text-xs text-black/40 font-mono uppercase tracking-widest">Chargement des catalogues...</p>
            </div>
          ) : filteredCatalogues.length === 0 ? (
            <div className="border border-dashed border-black/10 rounded-sm bg-white p-12 text-center">
              <BookOpen className="w-12 h-12 text-brand-taupe/30 mx-auto mb-4" />
              <h3 className="text-lg font-serif italic text-black/80 mb-2">Aucun catalogue trouvé</h3>
              <p className="text-xs text-black/50 font-light max-w-md mx-auto leading-relaxed">
                {searchTerm ? "Aucun catalogue ne correspond à votre recherche actuelle." : "Commencez par créer votre premier catalogue thématique."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCatalogues.map((cat) => {
                const productCount = associations[cat.id]?.size || 0;

                return (
                  <div 
                    key={cat.id}
                    className="bg-white border border-black/5 rounded-sm overflow-hidden flex flex-col shadow-xs hover:shadow-md transition-all group"
                  >
                    {/* Cover Header */}
                    <div className="h-36 bg-brand-cream border-b border-black/5 relative overflow-hidden flex items-center justify-center">
                      {cat.cover_image_url ? (
                        <img 
                          src={cat.cover_image_url} 
                          alt={cat.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <BookOpen className="w-10 h-10 text-brand-taupe/20" />
                      )}

                      {/* Active Status Badge */}
                      <div className="absolute top-3 right-3">
                        {cat.is_active ? (
                          <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            Actif
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
                            Inactif
                          </span>
                        )}
                      </div>

                      {/* Associated Products Badge */}
                      <div className="absolute bottom-3 left-3">
                        <span className="text-[9px] font-bold font-mono px-2.5 py-1 rounded-sm bg-black/80 text-white backdrop-blur-xs flex items-center gap-1">
                          <Package className="w-3 h-3 text-brand-taupe" />
                          {productCount} produit(s)
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-[9px] font-mono text-black/40 uppercase block mb-1">
                          /{cat.slug}
                        </span>
                        <h3 className="font-serif italic text-xl text-black/90 group-hover:text-brand-taupe transition-colors">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-black/60 font-light mt-2 line-clamp-2 leading-relaxed">
                          {cat.description || "Aucune description renseignée pour cette collection."}
                        </p>
                      </div>

                      {/* Actions Footer */}
                      <div className="pt-3 border-t border-black/5 flex items-center justify-between gap-2">
                        <button
                          onClick={() => startManageProducts(cat)}
                          className="px-3 py-1.5 bg-brand-cream hover:bg-brand-taupe text-black/80 hover:text-white border border-black/10 text-[10px] uppercase tracking-wider font-bold rounded-sm transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Package className="w-3.5 h-3.5" />
                          Gérer les produits
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(cat)}
                            className="p-1.5 hover:bg-black/5 rounded text-black/60 hover:text-black transition-colors cursor-pointer"
                            title="Modifier le catalogue"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(cat)}
                            className="p-1.5 hover:bg-red-50 rounded text-red-600/60 hover:text-red-700 transition-colors cursor-pointer"
                            title="Supprimer le catalogue"
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
