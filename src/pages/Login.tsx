import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const { signIn, signUp, error: authError, isMocked } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination (default to '/compte')
  const from = (location.state as any)?.from?.pathname || '/compte';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLoadingLocal(true);

    try {
      if (isLogin) {
        await signIn(phone, password);
        // Successful signin leads directly to redirection
        navigate(from, { replace: true });
      } else {
        await signUp(fullName, phone, password, email);
        setSignUpSuccess(true);
        // Autoconnect on signup is simulated, let me navigate after a brief timeout for premium user experience
        setTimeout(() => {
          navigate('/compte');
        }, 2000);
      }
    } catch (err: any) {
      console.error(err);
      setLocalError(err.message || "Une erreur est survenue.");
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setLocalError(null);
    setSignUpSuccess(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#FAF9F6] py-12 px-6 lg:px-12">
      <div className="w-full max-w-md bg-white border border-black/5 p-8 md:p-10 shadow-sm relative overflow-hidden">
        
        {/* Decorative thin top line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#9A8C73]"></div>

        {/* Brand identity */}
        <div className="text-center mb-8">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#9A8C73] font-bold mb-2">
            Maison 2M Cosmetics
          </div>
          <h2 className="text-3xl font-serif italic">
            {isLogin ? 'Connexion' : 'Créer un Compte'}
          </h2>
          <div className="h-[1px] w-12 bg-[#9A8C73]/40 mx-auto mt-4"></div>
        </div>

        {/* Mock mode indicator */}
        {isMocked && (
          <div className="mb-6 p-3 bg-amber-50/75 border border-amber-500/10 rounded text-center">
            <p className="text-[10px] text-amber-800 font-medium leading-normal">
              💡 <strong>Mode d'évaluation actif :</strong> Supabase n'est pas encore configuré. Vous pouvez tester librement l'authentification et l'accès sécurisé aux routes.
            </p>
          </div>
        )}

        {/* Global Errors */}
        {(localError || authError) && !signUpSuccess && (
          <div className="mb-6 p-4 bg-red-50 border border-red-500/10 text-red-800 text-xs">
            {localError || authError}
          </div>
        )}

        {/* Success message */}
        {signUpSuccess && (
          <div className="mb-6 p-6 bg-green-50 border border-green-500/10 text-green-800 text-center rounded flex flex-col items-center">
            <CheckCircle2 className="w-8 h-8 text-green-600 mb-2" />
            <h4 className="font-serif italic font-bold mb-1">Bienvenue chez 2M !</h4>
            <p className="text-xs text-green-700/80">
              Votre compte a été créé avec succès. Connexion automatique en cours...
            </p>
          </div>
        )}

        {!signUpSuccess && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Connexion vs Inscription */}
            {isLogin ? (
              /* Formulaire de Connexion */
              <>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-black/50 font-bold mb-1.5" htmlFor="loginPhone">
                    Numéro de téléphone *
                  </label>
                  <input
                    id="loginPhone"
                    type="tel"
                    required
                    placeholder="ex: 77 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-sm bg-[#FAF9F6] border border-black/5 p-3 outline-none focus:border-[#9A8C73] transition-colors font-mono"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] uppercase tracking-widest text-black/50 font-bold" htmlFor="loginPassword">
                      Mot de passe *
                    </label>
                    <span className="text-[9px] text-[#9A8C73] cursor-not-allowed hover:underline">
                      Mot de passe oublié ?
                    </span>
                  </div>
                  <input
                    id="loginPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-sm bg-[#FAF9F6] border border-black/5 p-3 outline-none focus:border-[#9A8C73] transition-colors"
                  />
                </div>
              </>
            ) : (
              /* Formulaire d'Inscription */
              <>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-black/50 font-bold mb-1.5" htmlFor="signupFullName">
                    Nom complet *
                  </label>
                  <input
                    id="signupFullName"
                    type="text"
                    required
                    placeholder="Ex: Fatima Sylla"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-sm bg-[#FAF9F6] border border-black/5 p-3 outline-none focus:border-[#9A8C73] transition-colors font-serif italic"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-black/50 font-bold mb-1.5" htmlFor="signupPhone">
                    Numéro de téléphone *
                  </label>
                  <input
                    id="signupPhone"
                    type="tel"
                    required
                    placeholder="ex: 77 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-sm bg-[#FAF9F6] border border-black/5 p-3 outline-none focus:border-[#9A8C73] transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-black/50 font-bold mb-1.5" htmlFor="signupEmail">
                    Adresse email (optionnel)
                  </label>
                  <input
                    id="signupEmail"
                    type="email"
                    placeholder="votre.email@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm bg-[#FAF9F6] border border-black/5 p-3 outline-none focus:border-[#9A8C73] transition-colors font-serif italic"
                  />
                  <p className="text-[9px] text-black/40 mt-1 leading-normal">
                    Recommandé pour sécuriser et récupérer votre compte
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-black/50 font-bold mb-1.5" htmlFor="signupPassword">
                    Mot de passe *
                  </label>
                  <input
                    id="signupPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-sm bg-[#FAF9F6] border border-black/5 p-3 outline-none focus:border-[#9A8C73] transition-colors"
                  />
                  <p className="text-[9px] text-black/40 mt-1 leading-normal">
                    Minimum 6 caractères pour garantir la sécurité de votre compte 2M.
                  </p>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loadingLocal}
              className="w-full py-4 bg-[#1A1A1A] hover:bg-[#9A8C73] text-[#FAF9F6] hover:text-[#1A1A1A] text-[11px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loadingLocal ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLogin ? 'Se Connecter' : 'Rejoindre le club 2M'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Toggle option */}
        <div className="mt-8 text-center border-t border-black/5 pt-6 text-xs">
          {isLogin ? (
            <p className="text-black/60">
              Nouveau chez 2M Cosmetics ?{' '}
              <button
                onClick={handleToggle}
                className="text-[#9A8C73] hover:underline font-bold focus:outline-none cursor-pointer"
              >
                Créer un compte
              </button>
            </p>
          ) : (
            <p className="text-black/60">
              Vous possédez déjà un compte ?{' '}
              <button
                onClick={handleToggle}
                className="text-[#9A8C73] hover:underline font-bold focus:outline-none cursor-pointer"
              >
                Se connecter
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
