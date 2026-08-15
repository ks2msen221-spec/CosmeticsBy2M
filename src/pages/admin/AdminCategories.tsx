import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Search, Edit, Trash2, X, Upload, Loader2, ArrowLeft, ChevronRight } from 'lucide-react';
import { catalogService } from '../../lib/catalogService';
import { Category } from '../../types/catalog';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formParentId, setFormParentId] = useState<string | null>(null);
  const [formImageUrl, setFormImageUrl] = useState('');

  // UI Status
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load categories
  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await catalogService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Handle Name and Auto-Slugify
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormName(name);
    if (!editingCategory) {
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

  // Trigger Edit
  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormSlug(category.slug);
    setFormDescription(category.description || '');
    setFormParentId(category.parent_id);
    setFormImageUrl(category.image_url || '');
    setErrorMessage('');
    setSuccessMessage('');
    setIsEditing(true);
  };

  // Trigger Create
  const startCreate = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormParentId(null);
    setFormImageUrl('');
    setErrorMessage('');
    setSuccessMessage('');
    setIsEditing(true);
  };

  // Handle Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMessage('');
    try {
      const publicUrl = await catalogService.uploadImage(file, 'product-images');
      setFormImageUrl(publicUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage("Erreur de téléversement. Veuillez réessayer.");
    } finally {
      setUploading(false);
    }
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSlug.trim()) {
      setErrorMessage("Le nom et le slug sont obligatoires.");
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
        parent_id: formParentId || null,
        image_url: formImageUrl.trim() || null
      };

      if (editingCategory) {
        // Prevent setting parent to itself
        if (formParentId === editingCategory.id) {
          throw new Error("Une catégorie ne peut pas être son propre parent.");
        }
        await catalogService.updateCategory(editingCategory.id, payload);
        setSuccessMessage(`La catégorie "${payload.name}" a été mise à jour.`);
      } else {
        await catalogService.createCategory(payload);
        setSuccessMessage(`La catégorie "${payload.name}" a été créée.`);
      }

      await loadCategories();
      setTimeout(() => {
        setIsEditing(false);
        setSuccessMessage('');
      }, 1500);

    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMessage(err.message || "Une erreur est survenue lors de l'enregistrement de la catégorie.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id: string, name: string) => {
    const children = categories.filter(c => c.parent_id === id);
    if (children.length > 0) {
      setErrorMessage(`Impossible de supprimer "${name}". Veuillez d'abord réattribuer ou supprimer ses sous-catégories (${children.map(c => c.name).join(', ')}).`);
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    if (!window.confirm(`Voulez-vous vraiment supprimer la catégorie "${name}" ?`)) {
      return;
    }

    try {
      await catalogService.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      setSuccessMessage(`La catégorie "${name}" a été supprimée.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      setErrorMessage("Une erreur est survenue lors de la suppression.");
    }
  };

  // Filters
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group Categories hierarchically for select dropdown (exclude current editing category)
  const parentCandidates = categories.filter(cat => !editingCategory || cat.id !== editingCategory.id);

  // Separate parent-level categories (no parent_id)
  const rootCategories = filteredCategories.filter(cat => !cat.parent_id);
  // Sub categories
  const subCategories = filteredCategories.filter(cat => cat.parent_id);

  return (
    <div className="space-y-8">
      {/* Notifications */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-500/10 text-emerald-950 text-xs py-3.5 px-6 rounded-sm shadow-xs animate-fade-in">
          <span className="font-medium">✨ {successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-500/10 text-rose-950 text-xs py-3.5 px-6 rounded-sm shadow-xs">
          <span className="font-medium">⚠️ {errorMessage}</span>
        </div>
      )}

      {/* Form Screen */}
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
                  {editingCategory ? `Modifier : ${editingCategory.name}` : "Nouvelle Catégorie Dermatologique"}
                </h2>
                <p className="text-[10px] text-black/40 font-mono mt-0.5 uppercase tracking-wider">
                  Structure de l'arborescence catalogue
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

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                  Nom de la catégorie <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={handleNameChange}
                  placeholder="ex: Crèmes de jour, Sérums"
                  className="w-full bg-brand-cream border border-black/10 focus:border-brand-taupe focus:outline-hidden text-xs px-3.5 py-2.5 rounded-sm transition-colors text-black"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                  Identifiant URL (Slug) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="ex: cremes-de-jour"
                  className="w-full bg-brand-cream border border-black/10 focus:border-brand-taupe focus:outline-hidden text-xs px-3.5 py-2.5 rounded-sm transition-colors text-black font-mono"
                />
              </div>
            </div>

            {/* Parent Category Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                Catégorie Parente (Hiérarchie)
              </label>
              <select
                value={formParentId || ''}
                onChange={(e) => setFormParentId(e.target.value || null)}
                className="w-full bg-brand-cream border border-black/10 focus:border-brand-taupe focus:outline-hidden text-xs px-3.5 py-2.5 rounded-sm transition-colors text-black"
              >
                <option value="">Aucune (Catégorie racine / Univers principal)</option>
                {parentCandidates
                  .filter(c => !c.parent_id) // Only suggest root level categories as parents
                  .map(parent => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name}
                    </option>
                  ))
                }
              </select>
              <span className="text-[9px] text-black/40 block">
                Les catégories racines définissent les univers principaux (ex: Visage, Corps). Les sous-catégories y sont rattachées.
              </span>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                Description de la collection
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Rédigez un court texte pour présenter cette gamme de soins aux clientes..."
                rows={4}
                className="w-full bg-brand-cream border border-black/10 focus:border-brand-taupe focus:outline-hidden text-xs p-3.5 rounded-sm transition-colors text-black leading-relaxed"
              />
            </div>

            {/* Banner/Image Upload */}
            <div className="space-y-2.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                Image de couverture
              </label>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="w-16 h-16 rounded-sm bg-brand-cream border border-black/10 flex items-center justify-center overflow-hidden shrink-0">
                  {formImageUrl ? (
                    <img 
                      src={formImageUrl} 
                      alt="Category preview" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FolderTree className="w-6 h-6 text-black/20" />
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
                          Téléverser une image
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
                    {formImageUrl && (
                      <button
                        type="button"
                        onClick={() => setFormImageUrl('')}
                        className="text-[10px] text-red-500 hover:underline cursor-pointer"
                      >
                        Retirer
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] text-black/40">
                    Ratio horizontal recommandé pour habiller la page de collection.
                  </p>
                </div>
              </div>

              {/* Raw URL */}
              <div className="pt-2">
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
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
                {editingCategory ? "Enregistrer" : "Créer la catégorie"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* List Screen with Nested Hierarchy */
        <div className="space-y-6">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-black/5">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-brand-taupe font-bold block mb-1">
                Console d'Administration
              </span>
              <h1 className="text-3xl font-serif italic text-black/90">Gestion des Catégories</h1>
              <p className="text-xs text-black/50 font-light mt-1">
                Configurez les univers de soins et l'arborescence hiérarchique parent/enfant.
              </p>
            </div>

            <button
              onClick={startCreate}
              className="px-5 py-3 bg-brand-noir hover:bg-brand-taupe text-brand-cream text-[10px] uppercase tracking-widest font-bold rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Créer une Catégorie
            </button>
          </header>

          {/* Search bar */}
          <div className="flex items-center gap-3 bg-white border border-black/5 p-4 rounded-sm shadow-xs">
            <Search className="w-4 h-4 text-black/40 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher une catégorie..."
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

          {/* Tree Display */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-black/5 rounded-sm">
              <Loader2 className="w-8 h-8 text-brand-taupe animate-spin mb-3" />
              <p className="text-xs text-black/40 font-mono uppercase tracking-widest">Chargement des catégories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="border border-dashed border-black/10 rounded-sm bg-white p-12 text-center">
              <FolderTree className="w-12 h-12 text-brand-taupe/30 mx-auto mb-4" />
              <h3 className="text-lg font-serif italic text-black/80 mb-2">Aucune catégorie configurée</h3>
              <p className="text-xs text-black/50 font-light max-w-md mx-auto leading-relaxed">
                Créez une arborescence en ajoutant de grands thèmes de soins (ex: Visage, Corps) et des sous-catégories (ex: Sérums, Hydratants).
              </p>
            </div>
          ) : (
            <div className="bg-white border border-black/5 rounded-sm divide-y divide-black/5 shadow-xs">
              
              {/* Loop through parent categories */}
              {rootCategories.map((parent) => {
                const children = subCategories.filter(child => child.parent_id === parent.id);

                return (
                  <div key={parent.id} className="p-4 md:p-6 space-y-4">
                    {/* Parent Row */}
                    <div className="flex items-start justify-between gap-4 group">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-sm bg-brand-cream border border-black/5 overflow-hidden shrink-0">
                          {parent.image_url ? (
                            <img src={parent.image_url} alt={parent.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-serif italic text-brand-taupe">2M</div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif italic font-bold text-lg text-black/90">
                              {parent.name}
                            </h3>
                            <span className="bg-brand-taupe/10 text-brand-taupe text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-xs font-bold">
                              Univers Principal
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-black/40">/{parent.slug}</p>
                          <p className="text-xs text-black/60 leading-relaxed font-light mt-1 line-clamp-2">{parent.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => startEdit(parent)}
                          className="p-1.5 hover:bg-black/5 rounded text-black/60 hover:text-black transition-colors cursor-pointer"
                          title="Modifier"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(parent.id, parent.name)}
                          className="p-1.5 hover:bg-red-50 rounded text-red-600/60 hover:text-red-700 transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Children nested list */}
                    {children.length > 0 && (
                      <div className="ml-8 md:ml-12 pl-4 border-l-2 border-brand-taupe/15 space-y-3.5 pt-2">
                        {children.map((child) => (
                          <div key={child.id} className="flex items-center justify-between gap-4 group/child">
                            <div className="flex items-center gap-3">
                              <ChevronRight className="w-3.5 h-3.5 text-brand-taupe" />
                              <div>
                                <h4 className="font-serif italic text-sm text-black/80 font-medium group-hover/child:text-brand-taupe transition-colors">
                                  {child.name}
                                </h4>
                                <span className="text-[9px] font-mono text-black/40">/{child.slug}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover/child:opacity-100 transition-opacity shrink-0">
                              <button
                                onClick={() => startEdit(child)}
                                className="p-1.5 hover:bg-brand-cream rounded text-black/60 hover:text-black transition-colors cursor-pointer"
                                title="Modifier"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDelete(child.id, child.name)}
                                className="p-1.5 hover:bg-red-50 rounded text-red-600/60 hover:text-red-700 transition-colors cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Loop through floating child categories whose parent got deleted or filter search doesn't show parent */}
              {rootCategories.length === 0 && filteredCategories.length > 0 && (
                <div className="p-6 space-y-4">
                  <h3 className="text-xs uppercase font-mono tracking-wider text-brand-taupe mb-4">Sous-catégories trouvées</h3>
                  {filteredCategories.map((child) => (
                    <div key={child.id} className="flex items-center justify-between p-3 bg-brand-cream border border-black/5 rounded-xs group">
                      <div>
                        <h4 className="font-serif italic text-sm text-black/80">{child.name}</h4>
                        <span className="text-[9px] font-mono text-black/40">/{child.slug}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(child)} className="p-1.5 hover:bg-black/5 rounded cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(child.id, child.name)} className="p-1.5 hover:bg-red-50 rounded text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
}
