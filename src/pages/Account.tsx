import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, normalizePhoneToTechnicalEmail } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { CONTACT_CONFIG } from '../config/contact';
import { 
  LogOut, 
  User, 
  Phone, 
  MapPin, 
  Shield, 
  Edit2, 
  Check, 
  ArrowRight,
  Plus,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Save,
  Mail,
  KeyRound,
  Send,
  CheckCircle2
} from 'lucide-react';

interface Address {
  id: string;
  user_id: string;
  title: string;
  full_address: string;
  phone: string;
  shipping_zone_id: string;
}

interface ShippingZone {
  id: string;
  name: string;
  fee: number;
}

const MOCK_SHIPPING_ZONES = [
  { id: 'zone_dakar_centre', name: 'Dakar Plateau / Fann / Almadies', fee: 1500 },
  { id: 'zone_dakar_banlieue', name: 'Dakar Banlieue (Pikine, Guédiawaye, Keur Massar)', fee: 2500 },
  { id: 'zone_rufisque', name: 'Rufisque / Bargny / Diamniadio', fee: 3500 },
  { id: 'zone_regions', name: 'Autres régions du Sénégal (Salloum, Casamance, Saint-Louis, etc.)', fee: 5000 }
];

export default function Account() {
  const { user, profile, signOut, updateProfile, isMocked } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  
  // Email & Verification States
  const [email, setEmail] = useState(profile?.email || '');
  const [sendingCodeLoading, setSendingCodeLoading] = useState(false);
  const [emailSendError, setEmailSendError] = useState<string | null>(null);
  const [emailSendSuccess, setEmailSendSuccess] = useState<string | null>(null);

  const [showCodeInput, setShowCodeInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyingCodeLoading, setVerifyingCodeLoading] = useState(false);
  const [emailVerifyError, setEmailVerifyError] = useState<string | null>(null);
  const [emailVerifySuccess, setEmailVerifySuccess] = useState<string | null>(null);

  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Password Change States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.email) {
      setEmail(profile.email);
    }
  }, [profile?.email]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // Email Verification Handlers
  const handleSendVerificationCode = async () => {
    if (!email || !email.trim()) {
      setEmailSendError("Veuillez saisir une adresse email valide.");
      return;
    }
    setEmailSendError(null);
    setEmailSendSuccess(null);
    setEmailVerifyError(null);
    setEmailVerifySuccess(null);
    setSendingCodeLoading(true);

    try {
      let token = '';
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        token = data.session?.access_token || '';
      }

      const rawApiUrl = (import.meta as any).env?.VITE_ORDERS_API_URL || '';
      const apiBaseUrl = rawApiUrl.replace(/\/api\/orders\/?$/, '').replace(/\/orders\/?$/, '');
      const res = await fetch(`${apiBaseUrl}/api/email/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errMsg = data.error || data.message || `Erreur (${res.status})`;
        setEmailSendError(errMsg);
        return;
      }

      setShowCodeInput(true);
      setEmailSendSuccess("Un code de vérification à 6 chiffres a été envoyé à votre adresse email.");
      setCooldownSeconds(60);
    } catch (err: any) {
      setEmailSendError(err.message || "Erreur lors de l'envoi du code.");
    } finally {
      setSendingCodeLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.trim().length !== 6) {
      setEmailVerifyError("Veuillez saisir le code à 6 chiffres.");
      return;
    }
    setEmailVerifyError(null);
    setEmailVerifySuccess(null);
    setVerifyingCodeLoading(true);

    try {
      let token = '';
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        token = data.session?.access_token || '';
      }

      const rawApiUrl = (import.meta as any).env?.VITE_ORDERS_API_URL || '';
      const apiBaseUrl = rawApiUrl.replace(/\/api\/orders\/?$/, '').replace(/\/orders\/?$/, '');
      const res = await fetch(`${apiBaseUrl}/api/email/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ code: verificationCode.trim() })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errMsg = data.error || data.message || `Erreur (${res.status})`;
        setEmailVerifyError(errMsg);
        return;
      }

      setEmailVerifySuccess("Email vérifié avec succès");
      setShowCodeInput(false);
      setVerificationCode('');

      // Reload profile
      if (supabase && user) {
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (updatedProfile) {
          await updateProfile(updatedProfile);
        } else {
          await updateProfile({ email: email.trim(), email_verified: true } as any);
        }
      } else {
        await updateProfile({ email: email.trim(), email_verified: true } as any);
      }
    } catch (err: any) {
      setEmailVerifyError(err.message || "Erreur lors de la vérification du code.");
    } finally {
      setVerifyingCodeLoading(false);
    }
  };

  // Password Change Handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError("Veuillez saisir votre mot de passe actuel.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setPasswordLoading(true);

    try {
      const userPhone = profile?.phone || '';
      if (!userPhone) {
        setPasswordError("Numéro de téléphone introuvable sur votre profil.");
        setPasswordLoading(false);
        return;
      }

      const technicalEmail = normalizePhoneToTechnicalEmail(userPhone);

      if (supabase && !isMocked) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: technicalEmail,
          password: currentPassword
        });

        if (signInErr) {
          setPasswordError("Mot de passe actuel incorrect");
          setPasswordLoading(false);
          return;
        }

        const { error: updateErr } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (updateErr) {
          setPasswordError(updateErr.message || "Erreur lors de la mise à jour du mot de passe.");
          setPasswordLoading(false);
          return;
        }
      } else {
        if (currentPassword.length < 3) {
          setPasswordError("Mot de passe actuel incorrect");
          setPasswordLoading(false);
          return;
        }
      }

      setPasswordSuccess("Mot de passe mis à jour avec succès.");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || "Erreur lors de la mise à jour du mot de passe.");
    } finally {
      setPasswordLoading(false);
    }
  };
  
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Address management states
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Form states for address
  const [addressFormTitle, setAddressFormTitle] = useState('');
  const [addressFormFullAddress, setAddressFormFullAddress] = useState('');
  const [addressFormPhone, setAddressFormPhone] = useState('');
  const [addressFormZoneId, setAddressFormZoneId] = useState('');

  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressSuccess, setAddressSuccess] = useState<string | null>(null);
  const [addressActionLoading, setAddressActionLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    async function fetchAddressesAndZones() {
      setAddressesLoading(true);
      try {
        // Load Shipping Zones
        let zonesData: ShippingZone[] = [];
        if (supabase && !isMocked) {
          const { data, error: zonesErr } = await supabase.from('shipping_zones').select('*');
          if (!zonesErr && data && data.length > 0) {
            zonesData = data.map((z: any) => ({
              id: z.id,
              name: z.name,
              fee: Number(z.fee ?? z.price ?? z.cost ?? 0)
            }));
          } else {
            zonesData = MOCK_SHIPPING_ZONES;
          }
        } else {
          zonesData = MOCK_SHIPPING_ZONES;
        }
        setShippingZones(zonesData);

        // Load Addresses
        let addrData: Address[] = [];
        if (supabase && !isMocked) {
          const { data, error: addrErr } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id);
          if (!addrErr && data) {
            addrData = data as Address[];
          }
        } else {
          const saved = localStorage.getItem(`2m_cosmetics_mock_addresses_${user.id}`);
          if (saved) {
            addrData = JSON.parse(saved);
          } else {
            const defaultAddr: Address = {
              id: 'addr_default_1',
              user_id: user.id,
              title: 'Adresse par défaut',
              full_address: profile?.address || CONTACT_CONFIG.address,
              phone: profile?.phone || CONTACT_CONFIG.phone,
              shipping_zone_id: 'zone_dakar_centre'
            };
            addrData = [defaultAddr];
            localStorage.setItem(`2m_cosmetics_mock_addresses_${user.id}`, JSON.stringify(addrData));
          }
        }
        setAddresses(addrData);
      } catch (err) {
        console.error("Failed to load addresses on account page:", err);
      } finally {
        setAddressesLoading(false);
      }
    }

    fetchAddressesAndZones();
  }, [user, isMocked, profile]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAddressError(null);
    setAddressSuccess(null);
    setAddressActionLoading(true);

    if (!addressFormTitle.trim() || !addressFormFullAddress.trim() || !addressFormPhone.trim() || !addressFormZoneId) {
      setAddressError('Veuillez renseigner tous les champs obligatoires.');
      setAddressActionLoading(false);
      return;
    }

    try {
      const payload = {
        title: addressFormTitle.trim(),
        full_address: addressFormFullAddress.trim(),
        phone: addressFormPhone.trim(),
        shipping_zone_id: addressFormZoneId
      };

      if (editingAddressId) {
        // Edit mode
        if (supabase && !isMocked) {
          const { data, error: updateErr } = await supabase
            .from('addresses')
            .update(payload)
            .eq('id', editingAddressId)
            .select()
            .single();
          if (updateErr) throw updateErr;

          setAddresses(prev => prev.map(a => a.id === editingAddressId ? (data as Address) : a));
        } else {
          // Mock mode
          const updated = addresses.map(a => a.id === editingAddressId ? { ...a, ...payload } : a);
          setAddresses(updated);
          localStorage.setItem(`2m_cosmetics_mock_addresses_${user.id}`, JSON.stringify(updated));
        }
        setAddressSuccess('Adresse mise à jour avec succès.');
      } else {
        // Add mode
        let created: Address;
        if (supabase && !isMocked) {
          const { data, error: insertErr } = await supabase
            .from('addresses')
            .insert({ ...payload, user_id: user.id })
            .select()
            .single();
          if (insertErr) throw insertErr;
          created = data as Address;
        } else {
          created = {
            id: 'addr_' + Math.random().toString(36).substring(2, 9),
            user_id: user.id,
            ...payload
          };
          const updated = [...addresses, created];
          localStorage.setItem(`2m_cosmetics_mock_addresses_${user.id}`, JSON.stringify(updated));
        }
        setAddresses(prev => [...prev, created]);
        setAddressSuccess('Nouvelle adresse enregistrée avec succès.');
      }

      // Close Form and Reset
      setIsEditingAddress(false);
      setEditingAddressId(null);
      setAddressFormTitle('');
      setAddressFormFullAddress('');
      setAddressFormPhone('');
    } catch (err: any) {
      console.error("Failed to save address:", err);
      setAddressError(err.message || "Impossible d'enregistrer l'adresse.");
    } finally {
      setAddressActionLoading(false);
    }
  };

  const handleStartEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setIsEditingAddress(true);
    setAddressFormTitle(addr.title);
    setAddressFormFullAddress(addr.full_address);
    setAddressFormPhone(addr.phone);
    setAddressFormZoneId(addr.shipping_zone_id);
    setAddressError(null);
    setAddressSuccess(null);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!user) return;
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) return;

    setAddressError(null);
    setAddressSuccess(null);
    setAddressActionLoading(true);

    try {
      if (supabase && !isMocked) {
        const { error: deleteErr } = await supabase
          .from('addresses')
          .delete()
          .eq('id', id);
        if (deleteErr) throw deleteErr;
      } else {
        const updated = addresses.filter(a => a.id !== id);
        localStorage.setItem(`2m_cosmetics_mock_addresses_${user.id}`, JSON.stringify(updated));
      }
      setAddresses(prev => prev.filter(a => a.id !== id));
      setAddressSuccess('Adresse supprimée avec succès.');
    } catch (err: any) {
      console.error("Failed to delete address:", err);
      setAddressError(err.message || 'Impossible de supprimer cette adresse.');
    } finally {
      setAddressActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLocal(true);
    setLocalError(null);
    setSuccessMessage(null);

    try {
      if (supabase && !isMocked && user) {
        await supabase
          .from('profiles')
          .update({ email: email.trim() })
          .eq('id', user.id);
      }
      await updateProfile({
        full_name: fullName,
        phone: phone,
        address: address,
        email: email.trim()
      } as any);
      setSuccessMessage('Votre profil dermatologique a été mis à jour avec succès.');
      setIsEditing(false);
    } catch (err: any) {
      setLocalError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoadingLocal(false);
    }
  };

  const startEditing = () => {
    setFullName(profile?.full_name || '');
    setPhone(profile?.phone || '');
    setAddress(profile?.address || '');
    setEmail(profile?.email || '');
    setIsEditing(true);
    setLocalError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left column: Quick Actions & Role */}
        <div className="space-y-6">
          <div className="border border-black/5 bg-white p-8 shadow-sm">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#9A8C73] font-bold block mb-2">
              Statut du Client 2M
            </span>
            
            <div className="flex items-center gap-4 py-4 border-b border-black/5">
              <div className="w-12 h-12 rounded-full bg-[#9A8C73]/10 flex items-center justify-center text-[#9A8C73]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif italic text-lg leading-snug">
                  {profile?.full_name || 'Membre 2M'}
                </h3>
                <p className="text-xs text-black/50 font-mono truncate max-w-[180px]">{user?.email}</p>
              </div>
            </div>

            {/* Role indicator (Strictly read-only) */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-medium py-1.5 px-3 bg-[#FAF9F6] border border-black/5">
                <span className="text-black/50">Rôle de Sécurité</span>
                <span className="flex items-center gap-1 font-mono uppercase font-bold text-[10px] text-[#9A8C73]">
                  <Shield className="w-3 h-3" />
                  {profile?.role === 'admin' ? 'Administrateur' : 'Client Privilégié'}
                </span>
              </div>
              <p className="text-[10px] text-black/40 leading-tight">
                * Les rôles et privilèges sont gérés de manière sécurisée côté serveur par Supabase et ne peuvent pas être modifiés par le client.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-black/5 flex flex-col gap-3">
              <Link 
                to="/compte/commandes" 
                className="w-full py-3 bg-[#1A1A1A] text-[#FAF9F6] text-[10px] uppercase tracking-widest font-bold hover:bg-[#9A8C73] hover:text-[#1A1A1A] transition-colors flex items-center justify-center gap-2"
              >
                Suivi de mes commandes
                <ArrowRight className="w-3 h-3" />
              </Link>

              {profile?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="w-full py-3 bg-amber-500 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                >
                  Console Administration
                </Link>
              )}

              <button 
                onClick={handleLogout}
                className="w-full py-3 border border-black/10 text-black/70 hover:bg-red-50 hover:text-red-700 hover:border-red-500/10 text-[10px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Déconnexion
              </button>
            </div>
          </div>

          {isMocked && (
            <div className="p-4 bg-amber-50 border border-amber-500/10 text-amber-800 text-[10px] rounded leading-relaxed">
              💡 <strong>Note de Test :</strong> Vous êtes connecté en mode d'évaluation. Les modifications de profil sont persistées localement dans votre navigateur (`localStorage`).
            </div>
          )}
        </div>

        {/* Right column: Profile details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-black/5 bg-white p-8 md:p-10 shadow-sm relative">
            <h2 className="text-3xl font-serif mb-2">Informations Personnelles</h2>
            <p className="text-xs text-black/50 mb-8">Consultez et éditez vos coordonnées de livraison pour accélérer vos prochaines commandes 2M Cosmetics.</p>
            
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-500/10 text-green-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                {successMessage}
              </div>
            )}

            {localError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-500/10 text-red-800 text-xs">
                {localError}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-black/50 font-bold mb-1.5">
                      Nom Complet
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-sm bg-[#FAF9F6] border border-black/5 p-3 outline-none focus:border-[#9A8C73] transition-colors font-serif italic"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-black/50 font-bold mb-1.5">
                      Téléphone Sénégal
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-sm bg-[#FAF9F6] border border-black/5 p-3 outline-none focus:border-[#9A8C73] transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Champ Email dans le formulaire */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] uppercase tracking-widest text-black/50 font-bold">
                      Email
                    </label>
                    {(profile as any)?.email_verified ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-800 border border-green-200">
                        Vérifié
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        Non vérifié
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre.email@exemple.com"
                      className="flex-1 text-sm bg-[#FAF9F6] border border-black/5 p-3 outline-none focus:border-[#9A8C73] transition-colors font-serif italic"
                    />
                    {email.trim() !== '' && (
                      <button
                        type="button"
                        onClick={handleSendVerificationCode}
                        disabled={sendingCodeLoading}
                        className="px-4 py-3 bg-[#9A8C73] text-white hover:bg-[#83755e] text-[10px] uppercase tracking-widest font-bold transition-colors cursor-pointer rounded-sm shrink-0 flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {sendingCodeLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        {sendingCodeLoading ? 'Envoi...' : 'Vérifier cet email'}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-black/50 font-bold mb-1.5">
                    Adresse complète de livraison
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-sm bg-[#FAF9F6] border border-black/5 p-3 outline-none focus:border-[#9A8C73] transition-colors font-serif italic resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-black/5">
                  <button
                    type="submit"
                    disabled={loadingLocal}
                    className="px-6 py-3 bg-[#1A1A1A] text-white hover:bg-[#9A8C73] hover:text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold transition-colors cursor-pointer"
                  >
                    {loadingLocal ? 'Mise à jour...' : 'Sauvegarder'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 border border-black/10 text-black text-[10px] uppercase tracking-widest font-bold hover:bg-black/5 transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase tracking-widest text-black/40 font-bold flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#9A8C73]" />
                      Nom Complet
                    </span>
                    <p className="text-sm font-serif italic font-semibold text-black/80">
                      {profile?.full_name || 'Non renseigné'}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase tracking-widest text-black/40 font-bold flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#9A8C73]" />
                      Téléphone Sénégal
                    </span>
                    <p className="text-sm font-mono font-semibold text-black/80">
                      {profile?.phone || 'Non renseigné'}
                    </p>
                  </div>

                  <div className="space-y-1.5 md:col-span-2 border-t border-black/5 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-widest text-black/40 font-bold flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-[#9A8C73]" />
                        Email
                      </span>
                      {(profile as any)?.email_verified ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-800 border border-green-200">
                          Vérifié
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          Non vérifié
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-serif italic font-semibold text-black/80">
                      {profile?.email || 'Non renseigné'}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase tracking-widest text-black/40 font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#9A8C73]" />
                    Adresse de livraison
                  </span>
                  <p className="text-sm font-serif italic font-semibold text-black/80 leading-relaxed">
                    {profile?.address || 'Aucune adresse enregistrée pour le moment.'}
                  </p>
                </div>

                <div className="pt-6 border-t border-black/5 flex justify-between items-center">
                  <p className="text-[10px] text-black/40">ID unique 2M : <span className="font-mono">{profile?.id}</span></p>
                  <button
                    onClick={startEditing}
                    className="px-6 py-2.5 border border-[#9A8C73] text-[#9A8C73] hover:bg-[#9A8C73] hover:text-white text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    Modifier mes infos
                  </button>
                </div>
              </div>
            )}

            {/* Email Verification Feedback & Code Input Encart */}
            {emailSendError && (
              <div className="mt-6 p-4 bg-red-50 border border-red-500/10 text-red-800 text-xs">
                {emailSendError}
              </div>
            )}

            {emailSendSuccess && (
              <div className="mt-6 p-4 bg-green-50 border border-green-500/10 text-green-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 shrink-0" />
                {emailSendSuccess}
              </div>
            )}

            {emailVerifyError && (
              <div className="mt-6 p-4 bg-red-50 border border-red-500/10 text-red-800 text-xs">
                {emailVerifyError}
              </div>
            )}

            {emailVerifySuccess && (
              <div className="mt-6 p-4 bg-green-50 border border-green-500/10 text-green-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 shrink-0" />
                {emailVerifySuccess}
              </div>
            )}

            {showCodeInput && (
              <div className="mt-6 p-5 bg-[#FAF9F6] border border-[#9A8C73]/30 rounded-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#9A8C73]" />
                  <span className="text-xs font-bold text-black/80">Code de vérification</span>
                </div>
                <p className="text-[11px] text-black/60 leading-relaxed">
                  Saisissez le code à 6 chiffres envoyé à <strong className="font-semibold">{email}</strong>.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    className="w-36 text-center font-mono text-base font-bold bg-white border border-black/10 p-2.5 outline-none focus:border-[#9A8C73] tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={verifyingCodeLoading}
                    className="px-5 py-2.5 bg-[#1A1A1A] text-white hover:bg-[#9A8C73] text-[10px] uppercase tracking-widest font-bold transition-colors cursor-pointer rounded-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {verifyingCodeLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    {verifyingCodeLoading ? 'Validation...' : 'Valider le code'}
                  </button>
                </div>

                <div className="pt-2 border-t border-black/5 flex items-center justify-between">
                  {cooldownSeconds > 0 ? (
                    <span className="text-[10px] text-black/40 font-mono">
                      Renvoyer le code ({cooldownSeconds}s)
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      disabled={sendingCodeLoading}
                      className="text-[10px] uppercase tracking-wider text-[#9A8C73] hover:underline font-bold cursor-pointer"
                    >
                      Renvoyer le code
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* NEW SECTION: Changer le mot de passe */}
          <div className="border border-black/5 bg-white p-8 md:p-10 shadow-sm relative mt-8">
            <div className="pb-4 border-b border-black/5 mb-6">
              <h2 className="text-2xl font-serif">Changer le mot de passe</h2>
              <p className="text-xs text-black/50 mt-1">
                Sécurisez votre compte 2M Cosmetics en modifiant votre mot de passe.
              </p>
            </div>

            {passwordSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-500/10 text-green-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 shrink-0" />
                {passwordSuccess}
              </div>
            )}

            {passwordError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-500/10 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                {passwordError}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-black/50 font-bold mb-1.5" htmlFor="currentPassword">
                  Mot de passe actuel
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm bg-[#FAF9F6] border border-black/5 p-3 outline-none focus:border-[#9A8C73] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-black/50 font-bold mb-1.5" htmlFor="newPassword">
                    Nouveau mot de passe
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-sm bg-[#FAF9F6] border border-black/5 p-3 outline-none focus:border-[#9A8C73] transition-colors"
                  />
                  <p className="text-[9px] text-black/40 mt-1">Minimum 6 caractères</p>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-black/50 font-bold mb-1.5" htmlFor="confirmPassword">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-sm bg-[#FAF9F6] border border-black/5 p-3 outline-none focus:border-[#9A8C73] transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-black/5">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-6 py-3 bg-[#1A1A1A] text-white hover:bg-[#9A8C73] hover:text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {passwordLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <KeyRound className="w-3.5 h-3.5" />
                  )}
                  {passwordLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                </button>
              </div>
            </form>
          </div>

          {/* SECOND CARD: Address Management */}
          <div className="border border-black/5 bg-white p-8 md:p-10 shadow-sm relative mt-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-black/5 mb-6">
              <div>
                <h2 className="text-2xl font-serif">Mes Adresses de Livraison</h2>
                <p className="text-xs text-black/50 mt-1">Gérez vos différentes adresses pour accélérer le passage de vos commandes.</p>
              </div>
              {!isEditingAddress && (
                <button
                  onClick={() => {
                    setIsEditingAddress(true);
                    setEditingAddressId(null);
                    setAddressFormTitle('');
                    setAddressFormFullAddress('');
                    setAddressFormPhone(profile?.phone || '');
                    setAddressFormZoneId(shippingZones[0]?.id || '');
                    setAddressError(null);
                    setAddressSuccess(null);
                  }}
                  className="px-4 py-2 bg-[#1A1A1A] text-white hover:bg-[#9A8C73] hover:text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nouvelle Adresse
                </button>
              )}
            </div>

            {addressSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-500/10 text-green-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                {addressSuccess}
              </div>
            )}

            {addressError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-500/10 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                {addressError}
              </div>
            )}

            {isEditingAddress ? (
              <form onSubmit={handleSaveAddress} className="space-y-6">
                <h3 className="text-sm uppercase tracking-widest font-bold text-[#9A8C73] border-b border-black/5 pb-1.5">
                  {editingAddressId ? 'Modifier l\'adresse d\'expédition' : 'Ajouter une adresse d\'expédition'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-black/50 font-bold mb-1.5">
                      Intitulé (ex: Domicile, Bureau, Famille)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Mon Domicile Dakar"
                      value={addressFormTitle}
                      onChange={(e) => setAddressFormTitle(e.target.value)}
                      className="w-full text-sm bg-[#FAF9F6] border border-black/5 p-3 outline-none focus:border-[#9A8C73] transition-colors font-serif italic"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-black/50 font-bold mb-1.5">
                      Téléphone de contact
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder={`ex: ${CONTACT_CONFIG.phone}`}
                      value={addressFormPhone}
                      onChange={(e) => setAddressFormPhone(e.target.value)}
                      className="w-full text-sm bg-[#FAF9F6] border border-black/5 p-3 outline-none focus:border-[#9A8C73] transition-colors font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-widest text-black/50 font-bold mb-1.5">
                      Zone de livraison du Sénégal
                    </label>
                    <select
                      required
                      value={addressFormZoneId}
                      onChange={(e) => setAddressFormZoneId(e.target.value)}
                      className="w-full text-sm bg-[#FAF9F6] border border-black/5 p-3 outline-none focus:border-[#9A8C73] transition-colors"
                    >
                      <option value="" disabled>Sélectionner la zone de livraison</option>
                      {shippingZones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} (+{zone.fee} FCFA)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-black/50 font-bold mb-1.5">
                    Adresse complète (Rue, Quartier, Indications pour le livreur)
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="ex: Rue 12 x Boulevard de la Gueule Tapée, en face de la pharmacie"
                    value={addressFormFullAddress}
                    onChange={(e) => setAddressFormFullAddress(e.target.value)}
                    className="w-full text-sm bg-[#FAF9F6] border border-[#9A8C73]/20 p-3 outline-none focus:border-[#9A8C73] transition-colors font-serif italic resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-black/5">
                  <button
                    type="submit"
                    disabled={addressActionLoading}
                    className="px-6 py-3 bg-[#1A1A1A] text-white hover:bg-[#9A8C73] hover:text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {addressActionLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    {addressActionLoading ? 'Enregistrement...' : 'Enregistrer l\'adresse'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingAddress(false);
                      setEditingAddressId(null);
                    }}
                    className="px-6 py-3 border border-black/10 text-black text-[10px] uppercase tracking-widest font-bold hover:bg-black/5 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Annuler
                  </button>
                </div>
              </form>
            ) : addressesLoading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#9A8C73] animate-spin mb-2" />
                <span className="text-[10px] uppercase tracking-widest font-mono text-black/40">Chargement de vos adresses...</span>
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-black/10 rounded-sm">
                <MapPin className="w-10 h-10 text-black/20 mx-auto mb-3" />
                <p className="text-xs text-black/50 font-light">Vous n'avez pas encore configuré d'adresses de livraison.</p>
                <button
                  onClick={() => {
                    setIsEditingAddress(true);
                    setEditingAddressId(null);
                    setAddressFormTitle('');
                    setAddressFormFullAddress('');
                    setAddressFormPhone(profile?.phone || '');
                    setAddressFormZoneId(shippingZones[0]?.id || '');
                    setAddressError(null);
                  }}
                  className="mt-4 px-4 py-2 border border-[#9A8C73] text-[#9A8C73] hover:bg-[#9A8C73] hover:text-white text-[10px] uppercase tracking-widest font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Créer votre première adresse
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((addr) => {
                  const zone = shippingZones.find(z => z.id === addr.shipping_zone_id);
                  return (
                    <div 
                      key={addr.id} 
                      className="border border-black/5 rounded-sm p-5 hover:border-[#9A8C73]/30 transition-all flex flex-col justify-between bg-white shadow-sm"
                    >
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-start">
                          <span className="font-serif italic font-bold text-sm text-[#1A1A1A]">
                            {addr.title}
                          </span>
                          {zone && (
                            <span className="text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 bg-[#FAF9F6] border border-black/5 text-black/60 rounded">
                              Livraison: +{zone.fee} FCFA
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-black/70 font-serif italic leading-relaxed">
                          {addr.full_address}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] font-mono text-black/50">
                          <Phone className="w-3.5 h-3.5 text-[#9A8C73]" />
                          <span>Contact: {addr.phone}</span>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6 pt-4 border-t border-black/5 justify-end">
                        <button
                          onClick={() => handleStartEditAddress(addr)}
                          className="px-3 py-1.5 border border-black/10 text-black hover:border-[#9A8C73] hover:text-[#9A8C73] text-[9px] uppercase tracking-widest font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="px-3 py-1.5 border border-transparent text-red-600 hover:bg-red-50 text-[9px] uppercase tracking-widest font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
