import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Edit, Trash2, X, Loader2, ArrowLeft, Check, AlertCircle, MapPin, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export interface ShippingZone {
  id: string;
  name: string;
  fee: number;
  is_active: boolean;
  created_at?: string;
}

const MOCK_ZONES: ShippingZone[] = [
  { id: 'zone_dakar_centre', name: 'Dakar Centre / Plateau', fee: 2000, is_active: true },
  { id: 'zone_banlieue', name: 'Banlieue & Pikine / Guédiawaye', fee: 3500, is_active: true },
  { id: 'zone_rufisque', name: 'Rufisque & Bargny', fee: 5000, is_active: true },
  { id: 'zone_regions', name: 'Régions du Sénégal (Poste/Express)', fee: 7500, is_active: false }
];

export default function AdminShippingZones() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [formName, setFormName] = useState('');
  const [formFee, setFormFee] = useState<number | string>(0);
  const [formIsActive, setFormIsActive] = useState(true);

  // UI Status
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load Shipping Zones
  const loadZones = async () => {
    setLoading(true);
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('shipping_zones')
          .select('*')
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: ShippingZone[] = data.map((z: any) => ({
            id: z.id,
            name: z.name || 'Zone sans nom',
            fee: Number(z.fee ?? z.price ?? z.cost ?? 0),
            is_active: z.is_active ?? true,
            created_at: z.created_at
          }));
          setZones(mapped);
          setLoading(false);
          return;
        }
      }

      // Fallback to localStorage / Mock data
      const saved = localStorage.getItem('2m_cosmetics_admin_shipping_zones');
      if (saved) {
        setZones(JSON.parse(saved));
      } else {
        setZones(MOCK_ZONES);
        localStorage.setItem('2m_cosmetics_admin_shipping_zones', JSON.stringify(MOCK_ZONES));
      }
    } catch (err) {
      console.error("Error loading shipping zones:", err);
      setZones(MOCK_ZONES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  // Trigger Create
  const startCreate = () => {
    setEditingZone(null);
    setFormName('');
    setFormFee(2000);
    setFormIsActive(true);
    setErrorMessage('');
    setSuccessMessage('');
    setIsEditing(true);
  };

  // Trigger Edit
  const startEdit = (zone: ShippingZone) => {
    setEditingZone(zone);
    setFormName(zone.name);
    setFormFee(zone.fee);
    setFormIsActive(zone.is_active);
    setErrorMessage('');
    setSuccessMessage('');
    setIsEditing(true);
  };

  // Toggle Active/Inactive directly from table
  const handleToggleActive = async (zone: ShippingZone) => {
    const newStatus = !zone.is_active;
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (supabase) {
        const { error } = await supabase
          .from('shipping_zones')
          .update({ is_active: newStatus })
          .eq('id', zone.id);

        if (error) throw error;
      }

      const updated = zones.map(z => z.id === zone.id ? { ...z, is_active: newStatus } : z);
      setZones(updated);
      localStorage.setItem('2m_cosmetics_admin_shipping_zones', JSON.stringify(updated));
      setSuccessMessage(`Statut de la zone "${zone.name}" mis à jour (${newStatus ? 'Active' : 'Inactive'}).`);
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err: any) {
      console.error("Toggle active error:", err);
      setErrorMessage("Impossible de modifier le statut : " + (err.message || 'Erreur réseau'));
    }
  };

  // Handle Submit (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMessage("Le nom de la zone de livraison est obligatoire.");
      return;
    }

    const numericFee = Number(formFee);
    if (isNaN(numericFee) || numericFee < 0) {
      setErrorMessage("Les frais de livraison doivent être un nombre supérieur ou égal à 0.");
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        name: formName.trim(),
        fee: numericFee,
        is_active: formIsActive
      };

      if (editingZone) {
        if (supabase) {
          const { error } = await supabase
            .from('shipping_zones')
            .update(payload)
            .eq('id', editingZone.id);

          if (error) throw error;
        }

        const updated = zones.map(z => z.id === editingZone.id ? { ...z, ...payload } : z);
        setZones(updated);
        localStorage.setItem('2m_cosmetics_admin_shipping_zones', JSON.stringify(updated));
        setSuccessMessage(`La zone "${payload.name}" a été mise à jour.`);

      } else {
        let createdId = 'zone_' + Math.random().toString(36).substring(2, 9);
        if (supabase) {
          const { data, error } = await supabase
            .from('shipping_zones')
            .insert(payload)
            .select()
            .single();

          if (error) throw error;
          if (data && data.id) createdId = data.id;
        }

        const newZone: ShippingZone = {
          id: createdId,
          ...payload
        };

        const updated = [...zones, newZone];
        setZones(updated);
        localStorage.setItem('2m_cosmetics_admin_shipping_zones', JSON.stringify(updated));
        setSuccessMessage(`La zone de livraison "${payload.name}" a été créée.`);
      }

      setTimeout(() => {
        setIsEditing(false);
        setSuccessMessage('');
      }, 1500);

    } catch (err: any) {
      console.error("Save shipping zone error:", err);
      setErrorMessage(err.message || "Une erreur est survenue lors de l'enregistrement de la zone.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete with verification against addresses table
  const handleDelete = async (zone: ShippingZone) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // 1. Check in Supabase addresses table
      let addressesCount = 0;
      if (supabase) {
        const { count, error } = await supabase
          .from('addresses')
          .select('*', { count: 'exact', head: true })
          .eq('shipping_zone_id', zone.id);

        if (!error && count !== null && count > 0) {
          addressesCount = count;
        }
      }

      // 2. Also check local storage mock addresses
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('2m_cosmetics_mock_addresses')) {
          try {
            const addrs = JSON.parse(localStorage.getItem(key) || '[]');
            const matches = addrs.filter((a: any) => a.shipping_zone_id === zone.id).length;
            addressesCount += matches;
          } catch (e) {
            // Ignore parse errors
          }
        }
      }

      // If referenced by addresses, block deletion
      if (addressesCount > 0) {
        setErrorMessage(`Cette zone est utilisée par ${addressesCount} adresse(s) client, impossible de la supprimer.`);
        return;
      }

      // Confirm deletion
      if (!window.confirm(`Voulez-vous vraiment supprimer la zone de livraison "${zone.name}" ?`)) {
        return;
      }

      // Perform deletion in Supabase
      if (supabase) {
        const { error } = await supabase
          .from('shipping_zones')
          .delete()
          .eq('id', zone.id);

        if (error) throw error;
      }

      const updated = zones.filter(z => z.id !== zone.id);
      setZones(updated);
      localStorage.setItem('2m_cosmetics_admin_shipping_zones', JSON.stringify(updated));
      setSuccessMessage(`La zone "${zone.name}" a été supprimée.`);
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err: any) {
      console.error("Delete shipping zone error:", err);
      setErrorMessage(err.message || "Une erreur est survenue lors de la suppression.");
    }
  };

  // Filtered Zones
  const filteredZones = zones.filter(zone =>
    zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.fee.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      {/* Notifications */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-500/10 text-emerald-950 text-xs py-3.5 px-6 rounded-sm shadow-xs animate-fade-in flex items-center gap-2">
          <span>✨</span>
          <span className="font-medium">{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-500/10 text-rose-950 text-xs py-3.5 px-6 rounded-sm shadow-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Form Screen */}
      {isEditing ? (
        <div className="max-w-2xl bg-white border border-black/5 rounded-sm shadow-md overflow-hidden">
          <header className="border-b border-black/5 px-6 py-5 bg-[#FAF9F6] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsEditing(false)}
                className="p-1.5 hover:bg-black/5 rounded transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-black/60" />
              </button>
              <div>
                <h2 className="font-serif italic text-lg text-black/90">
                  {editingZone ? `Modifier : ${editingZone.name}` : "Nouvelle Zone de Livraison"}
                </h2>
                <p className="text-[10px] text-black/40 font-mono mt-0.5 uppercase tracking-wider">
                  Tarification d'expédition par zone géographique
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
            <div className="space-y-4">
              {/* Zone Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                  Nom de la zone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="ex: Dakar Centre / Plateau, Banlieue, Saint-Louis..."
                  className="w-full bg-[#FAF9F6] border border-black/10 focus:border-[#9A8C73] focus:outline-hidden text-xs px-3.5 py-2.5 rounded-sm transition-colors text-black"
                />
              </div>

              {/* Fee */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-black/60 block">
                  Frais de livraison (FCFA) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    value={formFee}
                    onChange={(e) => setFormFee(e.target.value)}
                    placeholder="2000"
                    className="w-full bg-[#FAF9F6] border border-black/10 focus:border-[#9A8C73] focus:outline-hidden text-xs px-3.5 py-2.5 rounded-sm transition-colors text-black pr-16"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-black/40 font-mono font-medium pointer-events-none">
                    FCFA
                  </span>
                </div>
                <p className="text-[10px] text-black/40 italic">Indiquez 0 pour une livraison gratuite.</p>
              </div>

              {/* Is Active Toggle */}
              <div className="pt-2 border-t border-black/5 flex items-center justify-between">
                <div>
                  <label className="text-xs font-medium text-black/80 block">Zone active</label>
                  <p className="text-[10px] text-black/40">Si désactivée, cette zone n'apparaîtra pas au moment du checkout client.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    formIsActive ? 'bg-emerald-600' : 'bg-black/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formIsActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-black/10 hover:bg-black/5 text-xs font-medium rounded-sm text-black/70 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-[#1A1A1A] hover:bg-[#9A8C73] text-white text-xs font-medium rounded-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{editingZone ? 'Mettre à jour' : 'Créer la zone'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* List Screen */
        <div className="space-y-6">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 pb-5">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#9A8C73] font-bold block mb-1">
                Console d'Administration
              </span>
              <h1 className="text-2xl font-serif italic text-black/90 flex items-center gap-2">
                <Truck className="w-6 h-6 text-[#9A8C73]" />
                <span>Zones de livraison</span>
              </h1>
              <p className="text-xs text-black/50 font-light mt-1">
                Gérez la tarification des expéditions par secteur géographique.
              </p>
            </div>

            <button
              onClick={startCreate}
              className="inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#9A8C73] text-white text-xs font-medium px-4 py-2.5 rounded-sm transition-colors cursor-pointer shadow-xs self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle Zone</span>
            </button>
          </header>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-black/5 rounded-sm shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-black/40 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher une zone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-black/10 focus:border-[#9A8C73] focus:outline-hidden text-xs pl-9 pr-3 py-2 rounded-sm text-black"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-2.5 top-2.5 text-black/40 hover:text-black cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="text-[11px] text-black/50 font-mono self-end sm:self-center">
              Total : <span className="font-bold text-black">{filteredZones.length}</span> zone(s)
            </div>
          </div>

          {/* Zones Table */}
          {loading ? (
            <div className="bg-white border border-black/5 p-12 text-center rounded-sm">
              <Loader2 className="w-6 h-6 text-[#9A8C73] animate-spin mx-auto mb-3" />
              <p className="text-xs text-black/50 font-mono">Chargement des zones de livraison...</p>
            </div>
          ) : filteredZones.length === 0 ? (
            <div className="bg-white border border-dashed border-black/10 rounded-sm p-12 text-center">
              <MapPin className="w-10 h-10 text-black/20 mx-auto mb-3" />
              <h3 className="text-sm font-serif italic text-black/70 mb-1">
                {searchTerm ? 'Aucun résultat trouvé' : 'Aucune zone de livraison configurée'}
              </h3>
              <p className="text-xs text-black/40 mb-4">
                {searchTerm ? 'Essayez de modifier vos termes de recherche.' : 'Créez votre première zone pour activer le calcul automatique des frais au checkout.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={startCreate}
                  className="inline-flex items-center gap-1.5 text-xs text-[#9A8C73] font-medium hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter une zone</span>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white border border-black/5 rounded-sm shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F6] border-b border-black/5 text-[10px] uppercase font-mono tracking-wider text-black/50">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Zone / Emplacement</th>
                      <th className="py-3 px-4 font-semibold">Frais de livraison</th>
                      <th className="py-3 px-4 font-semibold">Statut</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {filteredZones.map((zone) => (
                      <tr key={zone.id} className="hover:bg-[#FAF9F6]/50 transition-colors">
                        {/* Name & ID */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-black/5 flex items-center justify-center shrink-0">
                              <MapPin className="w-4 h-4 text-[#9A8C73]" />
                            </div>
                            <div>
                              <span className="font-medium text-black/90 block">{zone.name}</span>
                              <span className="text-[9px] font-mono text-black/30 block mt-0.5">ID: {zone.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Fee */}
                        <td className="py-3.5 px-4 font-mono font-medium text-black">
                          {zone.fee === 0 ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs text-[10px] uppercase tracking-wider border border-emerald-500/20">
                              Gratuit
                            </span>
                          ) : (
                            `${zone.fee.toLocaleString('fr-FR')} FCFA`
                          )}
                        </td>

                        {/* Status Toggle Badge */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleActive(zone)}
                            title="Cliquer pour changer le statut"
                            className="group inline-flex items-center gap-1.5 cursor-pointer focus:outline-hidden"
                          >
                            {zone.is_active ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-medium group-hover:bg-emerald-100 transition-colors">
                                <ToggleRight className="w-3.5 h-3.5 text-emerald-600" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-full text-[10px] font-medium group-hover:bg-gray-200 transition-colors">
                                <ToggleLeft className="w-3.5 h-3.5 text-gray-400" />
                                Inactive
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => startEdit(zone)}
                              className="p-1.5 hover:bg-black/5 rounded-xs text-black/60 hover:text-black transition-colors cursor-pointer"
                              title="Modifier la zone"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(zone)}
                              className="p-1.5 hover:bg-rose-50 rounded-xs text-black/40 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Supprimer la zone"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
