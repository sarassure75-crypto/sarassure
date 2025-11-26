import React from 'react';
import { AlertCircle, ExternalLink, X } from 'lucide-react';

export default function CGUWarningBanner({ onClose, onReadMore }) {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg">
      <div className="flex items-start gap-4">
        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">
                Conditions d'utilisation
              </h3>
              <p className="text-sm text-amber-800 mb-3">
                En soumettant votre contenu, vous acceptez nos Conditions Générales d'Utilisation (CGU). 
                Veuillez lire nos conditions concernant la propriété intellectuelle et les droits d'auteur.
              </p>
              <button
                onClick={onReadMore}
                className="text-sm text-amber-700 hover:text-amber-900 font-medium flex items-center gap-1 transition-colors"
              >
                Lire les conditions complètes
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="text-amber-500 hover:text-amber-700 transition-colors flex-shrink-0 mt-1"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
