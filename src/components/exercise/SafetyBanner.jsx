import React from 'react';
import { Lock, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SafetyBanner - Banneau qui rassure l'apprenant sur la nature sécurisée de SARASSURE
 * 
 * À AFFICHER:
 *   - /taches (liste des exercices)
 *   - /tache/:taskId (détails d'un exercice avant de le faire)
 * 
 * À NE PAS AFFICHER:
 *   - /tache/:taskId/version/:versionId (pendant l'exécution)
 */
export default function SafetyBanner({ className = '' }) {
  return (
    <div className={cn(
      "bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg shadow-sm",
      className
    )}>
      <div className="flex items-start gap-3">
        {/* Icône cadenas */}
        <div className="flex-shrink-0 mt-0.5">
          <Lock className="w-5 h-5 text-green-600" />
        </div>
        
        {/* Contenu texte */}
        <div className="flex-grow">
          <h3 className="font-bold text-green-900 mb-1 text-sm sm:text-base">
            ✓ Simulation Sécurisée
          </h3>
          <p className="text-green-800 text-xs sm:text-sm leading-relaxed">
            Aucune vraie action ne se fera sur votre téléphone. Vous pouvez pratiquer autant que vous voulez, en toute confiance, sans risque de le casser.
          </p>
        </div>
        
        {/* Icône ampoule (optionnelle) */}
        <div className="flex-shrink-0 hidden sm:block">
          <Lightbulb className="w-5 h-5 text-amber-500 opacity-60" />
        </div>
      </div>
    </div>
  );
}
