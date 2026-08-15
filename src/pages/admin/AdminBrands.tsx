import React, { useState, useEffect } from 'react';
import { Tag, Plus, Search, Edit, Trash2, X, Upload, Loader2, ArrowLeft } from 'lucide-react';
import { catalogService } from '../../lib/catalogService';
import { Brand } from '../../types/catalog';

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form/Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formLogoUrl, setFormLogoUrl] = useState('');
  
  // UI Status
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch brands
  const loadBrands = async () => {
    setLoading(true);
    try {
      const data = await catalogService.getBrands();
      setBrands(data);
    } catch (err) {
      console.error("Error loading brands:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  // Helper to auto-generate slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormName(name);
    if (!editingBrand) {
      // Auto-generate slug from name
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

  // Trigger Edit Form
  const startEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormName(brand.name);
    setFormSlug(brand.slug);
    setFormBio(brand.bio || '');
    setFormLogoUrl(brand.logo_url || '');
    setErrorMessage('');
    setSuccessMessage('');
    setIsEditing(true);
  };

  // Trigger Create Form
  const startCreate = () => {
    setEditingBrand(null);
    setFormName('');
    setFormSlug('');
    setFormBio('');
    setFormLogoUrl('');
    setErrorMessage('');
    setSuccessMessage('');
    setIsEditing(true);
  };

  // Handle Logo Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMessage('');
    try {
      const publicUrl = await catalogService.uploadImage(file, 'product-images');
      setFormLogoUrl(publicUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage("Erreur lors du téléversement de l'image. Veuillez réessayer.");
    } finally {
      setUploading(false);
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSlug.trim()) {
      setErrorMessage("Le nom et le slug de la marque sont obligatoires.");
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        name: formName.trim(),
        slug: formSlug.trim(),
        bio: formBio.trim() || null,
        logo_url: formLogoUrl.trim() || null
      };

      if (editingBrand) {
        // Update
        await catalogService.updateBrand(editingBrand.id, payload);
        setSuccessMessage(`La marque "${payload.name}" a été mise à jour avec succès.`);
      } else {
        // Create
        await catalogService.createBrand(payload);
        setSuccessMessage(`La marque "${payload.name}" a été créée avec succès.`);
      }

      await loadBrands();
      // Keep message visible for a short time, then close form
      setTimeout(() => {
        setIsEditing(false);
        setSuccessMessage('');
      }, 1500);

    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMessage("Impossible d'enregistrer la marque. Veuillez vérifier les champs ou vos droits RLS.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement la marque "${name}" ?`)) {
      return;
    }

    try {
      await catalogService.deleteBrand(id);
      setBrands(brands.filter(b => b.id !== id));
      setSuccessMessage(`La marque "${name}" a été supprimée.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      setErrorMessage("Une erreur est survenue lors de la suppression.");
    }
  };

  // Filter list
  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (brand.bio && brand.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
    brand.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Messages */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-500/10 text-emerald-950 text-xs py-3.5 px-6 rounded-sm flex items-center justify-between shadow-xs animate-fade-in">
          <span className="font-medium">✨ {successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-500/10 text-rose-950 text-xs py-3.5 px-6 rounded-sm flex items-center justify-between shadow-xs">
          <span className="font-medium">⚠️ {errorMessage}</span>
        </div>
      )}

      {/* Mode 1: Editor/Form screen */}
      {isEditing ? (
        <div className="max-w-2xl bg-white border border-black/5 rounded-sm shadow-md overflow-hidden">
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
                  {editingBrand ? `Modifier : ${editingBrand.name}` : "Nouvelle Marque Partenaire"}
                </h2>
                <p className="text-[10px] text-black/40 font-mono mt-0.5 uppercase tracking-wider">
                  Maison 2M Cosmetics Dakar
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsEditing(false)}
              className="p-1 hover:bg-black/5 rounded transition-all cursor-pointer text-black/40 hover:text-black/70"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brand Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                  Nom de la marque <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={handleNameChange}
                  placeholder="ex: M Botanics"
                  className="w-full bg-brand-cream border border-black/10 focus:border-brand-taupe focus:outline-hidden text-xs px-3.5 py-2.5 rounded-sm transition-colors text-black"
                />
              </div>

              {/* Brand Slug */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                  Identifiant URL (Slug) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="ex: m-botanics"
                  className="w-full bg-brand-cream border border-black/10 focus:border-brand-taupe focus:outline-hidden text-xs px-3.5 py-2.5 rounded-sm transition-colors text-black font-mono"
                />
              </div>
            </div>

            {/* Brand Bio */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                Histoire & Engagement (Bio)
              </label>
              <textarea
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                placeholder="Rédigez l'histoire ou l'engagement de la marque..."
                rows={4}
                className="w-full bg-brand-cream border border-black/10 focus:border-brand-taupe focus:outline-hidden text-xs p-3.5 rounded-sm transition-colors text-black leading-relaxed"
              />
            </div>

            {/* Brand Logo Upload */}
            <div className="space-y-2.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                Logo de la marque
              </label>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="w-16 h-16 rounded-sm bg-brand-cream border border-black/10 flex items-center justify-center overflow-hidden shrink-0">
                  {formLogoUrl ? (
                    <img 
                      src={formLogoUrl} 
                      alt="Logo preview" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Tag className="w-6 h-6 text-black/20" />
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
                          Téléverser un logo
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload} 
                        disabled={uploading}
                        className="hidden" 
                      />
                    </label>
                    {formLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormLogoUrl('')}
                        className="text-[10px] text-red-500 hover:underline cursor-pointer"
                      >
                        Retirer
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] text-black/40">
                    PNG, JPG ou SVG d'exception recommandé. Stocké dans le dossier d'images Supabase.
                  </p>
                </div>
              </div>

              {/* Raw URL alternative */}
              <div className="pt-2">
                <input
                  type="text"
                  value={formLogoUrl}
                  onChange={(e) => setFormLogoUrl(e.target.value)}
                  placeholder="Ou collez un lien d'image externe (facultatif)"
                  className="w-full bg-brand-cream border border-black/5 focus:border-brand-taupe focus:outline-hidden text-[10px] px-3.5 py-2 rounded-sm transition-colors text-black/60 font-mono"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-black/5 flex items-center justify-end gap-3.5">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
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
                {editingBrand ? "Enregistrer" : "Créer la marque"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Mode 2: Grid/List of brands */
        <div className="space-y-6">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-black/5">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-brand-taupe font-bold block mb-1">
                Console d'Administration
              </span>
              <h1 className="text-3xl font-serif italic text-black/90">Gestion des Marques</h1>
              <p className="text-xs text-black/50 font-light mt-1">
                Gérez les laboratoires et coopératives d'exception distribués sur la boutique.
              </p>
            </div>

            <button
              onClick={startCreate}
              className="px-5 py-3 bg-brand-noir hover:bg-brand-taupe text-brand-cream text-[10px] uppercase tracking-widest font-bold rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Ajouter une Marque
            </button>
          </header>

          {/* Filters and Searches */}
          <div className="flex items-center gap-3 bg-white border border-black/5 p-4 rounded-sm shadow-xs">
            <Search className="w-4 h-4 text-black/40 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher une marque par nom ou biographie..."
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

          {/* List display */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-black/5 rounded-sm">
              <Loader2 className="w-8 h-8 text-brand-taupe animate-spin mb-3" />
              <p className="text-xs text-black/40 font-mono uppercase tracking-widest">Chargement des marques...</p>
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="border border-dashed border-black/10 rounded-sm bg-white p-12 text-center">
              <Tag className="w-12 h-12 text-brand-taupe/30 mx-auto mb-4" />
              <h3 className="text-lg font-serif italic text-black/80 mb-2">Aucune marque trouvée</h3>
              <p className="text-xs text-black/50 font-light max-w-md mx-auto leading-relaxed">
                {searchTerm ? "Aucun laboratoire ou herboristerie ne correspond à votre recherche actuelle." : "Commencez par ajouter votre première marque partenaire ci-dessus."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBrands.map((brand) => (
                <div 
                  key={brand.id}
                  className="bg-white border border-black/5 rounded-sm p-6 flex items-start gap-5 shadow-xs hover:shadow-md transition-all group"
                >
                  <div className="w-14 h-14 rounded-sm bg-brand-cream border border-black/5 flex items-center justify-center overflow-hidden shrink-0">
                    {brand.logo_url ? (
                      <img 
                        src={brand.logo_url} 
                        alt={brand.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Tag className="w-6 h-6 text-brand-taupe/30" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-serif italic text-lg leading-tight text-black/90 group-hover:text-brand-taupe transition-colors">
                          {brand.name}
                        </h3>
                        <span className="text-[10px] font-mono text-black/40 mt-0.5 block">
                          /{brand.slug}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => startEdit(brand)}
                          className="p-1.5 hover:bg-black/5 rounded text-black/60 hover:text-black transition-colors cursor-pointer"
                          title="Modifier"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(brand.id, brand.name)}
                          className="p-1.5 hover:bg-red-50 rounded text-red-600/60 hover:text-red-700 transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-black/60 leading-relaxed font-light line-clamp-3">
                      {brand.bio || "Aucun détail historique rédigé pour le moment."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
