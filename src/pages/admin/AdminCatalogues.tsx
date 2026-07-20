import React from 'react';
import { BookOpen } from 'lucide-react';

export default function AdminCatalogues() {
  return (
    <div className="space-y-6">
      <header className="border-b border-black/5 pb-5">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#9A8C73] font-bold block mb-2">
          Console d'Administration
        </span>
        <h1 className="text-3xl font-serif italic text-black/90">Gestion des Catalogues</h1>
        <p className="text-xs text-black/50 font-light mt-1">
          Organisez les catalogues thématiques et collections saisonnières (ex: Nouveautés, Sélection Botanique, routines de l'Aïd).
        </p>
      </header>

      <div className="border border-dashed border-black/10 rounded-sm bg-white p-12 text-center shadow-xs">
        <BookOpen className="w-12 h-12 text-[#9A8C73]/30 mx-auto mb-4" />
        <h3 className="text-lg font-serif italic text-black/80 mb-2">Aucun catalogue configuré</h3>
        <p className="text-xs text-black/50 font-light max-w-md mx-auto leading-relaxed">
          La base de données des catalogues thématiques sera disponible et éditable dans cette section sous peu.
        </p>
      </div>
    </div>
  );
}
