import React from 'react';
import { CreditCard } from 'lucide-react';

export default function AdminPaymentMethods() {
  return (
    <div className="space-y-6">
      <header className="border-b border-black/5 pb-5">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#9A8C73] font-bold block mb-2">
          Console d'Administration
        </span>
        <h1 className="text-3xl font-serif italic text-black/90">Modes de paiement</h1>
        <p className="text-xs text-black/50 font-light mt-1">
          Configurez les instructions et modes de règlements acceptés sur la boutique de Dakar (Paiement à la livraison, Wave, Orange Money).
        </p>
      </header>

      <div className="border border-dashed border-black/10 rounded-sm bg-white p-12 text-center shadow-xs">
        <CreditCard className="w-12 h-12 text-[#9A8C73]/30 mx-auto mb-4" />
        <h3 className="text-lg font-serif italic text-black/80 mb-2">Aucun mode configuré</h3>
        <p className="text-xs text-black/50 font-light max-w-md mx-auto leading-relaxed">
          La configuration des instructions de paiement et des comptes marchands sera disponible et éditable dans cette section sous peu.
        </p>
      </div>
    </div>
  );
}
