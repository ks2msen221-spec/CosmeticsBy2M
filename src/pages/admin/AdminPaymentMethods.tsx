import React, { useState, useEffect } from 'react';
import { CreditCard, QrCode, Upload, Save, Loader2, Check, AlertCircle, ToggleLeft, ToggleRight, Info, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export interface PaymentMethodAdmin {
  id: string;
  code: 'cod' | 'wave' | 'om';
  label: string;
  qr_code_url: string | null;
  is_active: boolean;
  updated_at?: string;
}

const DEFAULT_METHODS: PaymentMethodAdmin[] = [
  { id: 'pm_cod', code: 'cod', label: 'Paiement à la livraison (Espèces)', qr_code_url: null, is_active: true },
  { id: 'pm_wave', code: 'wave', label: 'Wave Sénégal', qr_code_url: 'https://images.unsplash.com/photo-1601597111158-2fceff270190?w=400&q=80', is_active: true },
  { id: 'pm_om', code: 'om', label: 'Orange Money Sénégal', qr_code_url: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=400&q=80', is_active: true }
];

export default function AdminPaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethodAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  // Per-method form state edits
  const [editedLabels, setEditedLabels] = useState<Record<string, string>>({});
  const [editedActives, setEditedActives] = useState<Record<string, boolean>>({});
  
  // Upload status and saving per method code
  const [uploadingCode, setUploadingCode] = useState<string | null>(null);
  const [savingCode, setSavingCode] = useState<string | null>(null);

  // Global status messages
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadMethods = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('payment_methods')
          .select('*')
          .order('code', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: PaymentMethodAdmin[] = data.map((p: any) => ({
            id: p.id,
            code: p.code,
            label: p.label || p.name || p.code,
            qr_code_url: p.qr_code_url,
            is_active: p.is_active ?? true,
            updated_at: p.updated_at
          }));
          setMethods(mapped);

          // Populate local edit states
          const labelsMap: Record<string, string> = {};
          const activeMap: Record<string, boolean> = {};
          mapped.forEach(m => {
            labelsMap[m.code] = m.label;
            activeMap[m.code] = m.is_active;
          });
          setEditedLabels(labelsMap);
          setEditedActives(activeMap);
          setLoading(false);
          return;
        }
      }

      // Fallback
      const saved = localStorage.getItem('2m_cosmetics_admin_payment_methods');
      const loaded: PaymentMethodAdmin[] = saved ? JSON.parse(saved) : DEFAULT_METHODS;
      setMethods(loaded);

      const labelsMap: Record<string, string> = {};
      const activeMap: Record<string, boolean> = {};
      loaded.forEach(m => {
        labelsMap[m.code] = m.label;
        activeMap[m.code] = m.is_active;
      });
      setEditedLabels(labelsMap);
      setEditedActives(activeMap);
    } catch (err) {
      console.error("Failed to load payment methods:", err);
      setMethods(DEFAULT_METHODS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMethods();
  }, []);

  const handleToggleActive = async (method: PaymentMethodAdmin) => {
    const currentVal = editedActives[method.code] ?? method.is_active;
    const newVal = !currentVal;

    setEditedActives(prev => ({ ...prev, [method.code]: newVal }));

    // Auto-save toggle
    await saveMethodChanges(method, { is_active: newVal });
  };

  const handleUploadQrCode = async (method: PaymentMethodAdmin, file: File) => {
    if (!file) return;
    setUploadingCode(method.code);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (!supabase) {
        throw new Error("Supabase n'est pas initialisé.");
      }

      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `qr_${method.code}_${Date.now()}.${fileExt}`;
      const filePath = `qrcodes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-qr-codes')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('payment-qr-codes')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // Update state and save
      setMethods(prev => prev.map(m => m.code === method.code ? { ...m, qr_code_url: publicUrl } : m));
      await saveMethodChanges(method, { qr_code_url: publicUrl });

      setSuccessMessage(`Image QR Code pour ${method.code.toUpperCase()} mise à jour avec succès.`);
    } catch (err: any) {
      console.error("QR Code upload error:", err);
      setErrorMessage(err.message || 'Échec du téléchargement de l\'image QR code.');
    } finally {
      setUploadingCode(null);
    }
  };

  const saveMethodChanges = async (method: PaymentMethodAdmin, overrideUpdates?: Partial<PaymentMethodAdmin>) => {
    setSavingCode(method.code);
    setErrorMessage('');
    setSuccessMessage('');

    const newLabel = overrideUpdates?.label !== undefined ? overrideUpdates.label : (editedLabels[method.code] || method.label);
    const newIsActive = overrideUpdates?.is_active !== undefined ? overrideUpdates.is_active : (editedActives[method.code] ?? method.is_active);
    const newQrUrl = overrideUpdates?.qr_code_url !== undefined ? overrideUpdates.qr_code_url : method.qr_code_url;

    try {
      const payload = {
        label: newLabel,
        is_active: newIsActive,
        qr_code_url: newQrUrl,
        updated_at: new Date().toISOString()
      };

      if (supabase) {
        const { error } = await supabase
          .from('payment_methods')
          .update(payload)
          .eq('code', method.code);

        if (error) {
          throw error;
        }
      }

      const updatedList = methods.map(m => m.code === method.code ? { ...m, ...payload } : m);
      setMethods(updatedList);
      localStorage.setItem('2m_cosmetics_admin_payment_methods', JSON.stringify(updatedList));

      setSuccessMessage(`Configuration pour ${method.label} enregistrée.`);
    } catch (err: any) {
      console.error("Failed to update payment method:", err);
      setErrorMessage(err.message || 'Impossible de sauvegarder la modification.');
    } finally {
      setSavingCode(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-brand-taupe animate-spin mb-3" />
        <span className="text-[10px] uppercase tracking-widest font-mono text-black/40">Chargement des modes de paiement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="border-b border-black/5 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-brand-taupe font-bold block mb-2">
            Console d'Administration
          </span>
          <h1 className="text-3xl font-serif italic text-black/90">Modes de paiement</h1>
          <p className="text-xs text-black/50 font-light mt-1">
            Gérez l'intitulé client, le statut d'activation et les QR Codes pour Wave, Orange Money et le Paiement à la livraison.
          </p>
        </div>
      </header>

      {/* Global Status Banner */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between rounded-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-red-500 hover:text-red-900 font-bold">×</button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs flex items-center justify-between rounded-sm">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-green-500 hover:text-green-900 font-bold">×</button>
        </div>
      )}

      <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-sm text-xs text-amber-900/80 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed text-[11px]">
          <strong>Notice des modes fixes :</strong> Les 3 identifiants de règlement (<code>cod</code>, <code>wave</code>, <code>om</code>) sont des piliers de l'architecture backend et ne peuvent pas être supprimés. Vous pouvez en revanche personnaliser le texte explicatif affiché aux clients ou suspendre temporairement un mode.
        </div>
      </div>

      <div className="space-y-6">
        {methods.map((method) => {
          const isActive = editedActives[method.code] ?? method.is_active;
          const currentLabel = editedLabels[method.code] ?? method.label;
          const isSaving = savingCode === method.code;
          const isUploading = uploadingCode === method.code;

          return (
            <div 
              key={method.id || method.code}
              className={`bg-white border transition-all rounded-sm shadow-xs ${
                isActive ? 'border-black/10' : 'border-black/5 bg-gray-50/50 opacity-80'
              }`}
            >
              <div className="p-6 md:p-8 space-y-6">
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-brand-cream border border-black/5 flex items-center justify-center text-brand-taupe">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 bg-black/5 text-black/60 rounded">
                          CODE: {method.code.toUpperCase()}
                        </span>
                        {isActive ? (
                          <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded">Actif</span>
                        ) : (
                          <span className="text-[9px] uppercase font-bold tracking-widest text-gray-500 bg-gray-100 px-2 py-0.5 border border-gray-200 rounded">Inactif</span>
                        )}
                      </div>
                      <h3 className="font-serif italic text-lg text-black font-bold mt-1">{method.label}</h3>
                    </div>
                  </div>

                  {/* Activation Toggle */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-widest text-black/50 font-bold">
                      {isActive ? 'Activé sur la boutique' : 'Désactivé'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(method)}
                      className="text-brand-taupe hover:text-black transition-colors cursor-pointer"
                      title={isActive ? 'Désactiver' : 'Activer'}
                    >
                      {isActive ? (
                        <ToggleRight className="w-8 h-8 text-brand-taupe" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-black/30" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Form Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Label Edit */}
                  <div className="lg:col-span-7 space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-black/60 font-bold mb-2">
                        Intitulé affiché aux clients au checkout
                      </label>
                      <input
                        type="text"
                        value={currentLabel}
                        onChange={(e) => setEditedLabels(prev => ({ ...prev, [method.code]: e.target.value }))}
                        className="w-full text-xs font-serif italic bg-white border border-black/15 p-3 outline-none focus:border-brand-taupe transition-colors rounded-sm"
                        placeholder="Intitulé du mode de paiement"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => saveMethodChanges(method)}
                        className="px-5 py-2.5 bg-brand-noir text-white hover:bg-brand-taupe text-[9px] uppercase tracking-widest font-bold transition-colors cursor-pointer flex items-center gap-2 rounded-sm disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            Enregistrer l'intitulé
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Right Column: QR Code Upload for Wave & OM */}
                  {method.code !== 'cod' && (
                    <div className="lg:col-span-5 bg-brand-cream border border-black/5 p-5 rounded-sm space-y-4">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/60 font-bold">
                        <QrCode className="w-4 h-4 text-brand-taupe" />
                        <span>QR Code de Transfert ({method.code.toUpperCase()})</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-white border border-black/10 p-1 flex items-center justify-center shrink-0 rounded-sm relative overflow-hidden shadow-xs">
                          {method.qr_code_url ? (
                            <img 
                              src={method.qr_code_url} 
                              alt={`QR Code ${method.code}`} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center p-2">
                              <ImageIcon className="w-6 h-6 text-black/20 mx-auto mb-1" />
                              <span className="text-[8px] text-black/30 font-mono">Aucun QR</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 flex-1">
                          <p className="text-[10px] text-black/50 font-light leading-relaxed">
                            Format accepté : PNG, JPG, WEBP.
                            Le fichier sera hébergé sur Supabase Storage.
                          </p>

                          <label className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-black/15 text-black hover:bg-black/5 text-[9px] uppercase tracking-widest font-bold transition-colors cursor-pointer rounded-sm shadow-2xs">
                            {isUploading ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-brand-taupe" />
                                Envoi...
                              </>
                            ) : (
                              <>
                                <Upload className="w-3 h-3 text-brand-taupe" />
                                Changer l'image QR
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploading}
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadQrCode(method, file);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {method.code === 'cod' && (
                    <div className="lg:col-span-5 bg-brand-cream border border-black/5 p-5 rounded-sm">
                      <span className="text-[10px] uppercase tracking-widest text-black/40 font-bold block mb-1">
                        Remarque
                      </span>
                      <p className="text-[11px] text-black/60 font-light leading-relaxed">
                        Le règlement à la livraison s'effectue en espèces auprès du livreur lors de la réception du colis à Dakar. Aucun QR Code n'est requis pour ce mode.
                      </p>
                    </div>
                  )}

                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
