import React, { useState, useEffect } from 'react';
import { getRelatedTerms, getAllGlossaryTerms } from '@/data/glossary';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

/**
 * GlossaryPopover
 * Affiche une définition de terme du lexique au clic
 */
export const GlossaryPopover = ({ 
  term, 
  definition, 
  example = null,
  relatedTerms = [],
  isOpen,
  onClose
}) => {
  const [relatedTermsData, setRelatedTermsData] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    if (isOpen && relatedTerms && relatedTerms.length > 0) {
      setLoadingRelated(true);
      getRelatedTerms(relatedTerms)
        .then(data => {
          setRelatedTermsData(data);
        })
        .catch(err => {
          console.error('Error loading related terms:', err);
        })
        .finally(() => {
          setLoadingRelated(false);
        });
    }
  }, [isOpen, relatedTerms]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay semi-transparent */}
      <div 
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Popover */}
      <div 
        className="fixed bg-white rounded-lg shadow-2xl z-50 max-w-md p-6 border-2 border-blue-400 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec titre et bouton fermer */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-2xl font-bold text-blue-700">{term}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Définition */}
        <div className="mb-4">
          <p className="text-gray-800 leading-relaxed">{definition}</p>
        </div>

        {/* Exemple */}
        {example && (
          <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
            <p className="text-sm font-semibold text-blue-600 mb-1">Exemple :</p>
            <p className="text-sm text-gray-700 italic">"{example}"</p>
          </div>
        )}

        {/* Termes connexes */}
        {relatedTermsData && relatedTermsData.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-gray-600 mb-3">Termes connexes :</p>
            <div className="space-y-2">
              {relatedTermsData.map((relatedTerm, idx) => (
                <div key={idx} className="bg-gray-50 p-2 rounded">
                  <p className="text-sm font-medium text-gray-800">{relatedTerm.term}</p>
                  <p className="text-xs text-gray-600">{relatedTerm.definition}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {loadingRelated && (
          <div className="text-center text-sm text-gray-500 mt-2">
            Chargement des termes connexes...
          </div>
        )}
      </div>
    </>
  );
};

/**
 * GlossaryWord
 * Mot du lexique avec action au clic pour afficher la définition
 */
export const GlossaryWord = ({ 
  term, 
  definition, 
  example = null,
  relatedTerms = [],
  children,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <span
        onClick={() => setIsOpen(true)}
        className={cn(
          'cursor-help underline decoration-blue-400 decoration-dotted hover:decoration-solid hover:bg-blue-50 transition-all rounded px-1',
          className
        )}
        role="button"
        tabIndex={0}
        title={`Cliquez pour la définition de "${term}"`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
      >
        {children || term}
      </span>

      <GlossaryPopover
        term={term}
        definition={definition}
        example={example}
        relatedTerms={relatedTerms}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

/**
 * Normalisation de variantes de mots
 * Permet de reconnaître glisse/glisser/glissement comme la même entrée
 */
const normalizeWord = (word) => {
  // Retirer suffixes courants: -er, -ment, -tion, -ement, etc.
  let normalized = word.toLowerCase();
  
  // Suffixes français à retirer pour la normalisation
  const suffixes = [
    'ement', 'ment', 'tion', 'sion', 'er', 'é', 'ée', 'és', 'ées',
    'al', 'aux', 'ite', 'itude', 'ance', 'ence', 'ure', 'age', 'ire'
  ];
  
  for (const suffix of suffixes) {
    if (normalized.endsWith(suffix) && normalized.length > suffix.length + 2) {
      const potential = normalized.slice(0, -suffix.length);
      if (potential.length > 2) {
        // On teste si la base sans suffix existe
        return { base: potential, original: word };
      }
    }
  }
  
  return { base: normalized, original: word };
};

/**
 * Trouvé correspondance de terme même si variante
 */
const findMatchingTerm = (word, glossaryTerms) => {
  const wordLower = word.toLowerCase();
  
  // 1. Recherche exacte par terme principal
  const exactMatch = glossaryTerms.find(
    t => t.term.toLowerCase() === wordLower
  );
  if (exactMatch) return exactMatch;
  
  // 2. Recherche par variante dans la colonne variants
  for (const term of glossaryTerms) {
    if (term.variants && Array.isArray(term.variants)) {
      if (term.variants.some(v => v && v.toLowerCase() === wordLower)) {
        return term;
      }
    }
  }
  
  // 3. Recherche par normalisation de suffixes
  const wordNorm = normalizeWord(word);
  for (const glossaryTerm of glossaryTerms) {
    const termNorm = normalizeWord(glossaryTerm.term);
    if (termNorm.base === wordNorm.base && termNorm.base.length > 2) {
      return glossaryTerm;
    }
  }
  
  return null;
};

/**
 * HighlightGlossaryTerms
 * Composant qui remplace automatiquement les termes du lexique par des mots cliquables
 * Charge automatiquement les termes si non fournis
 */
export const HighlightGlossaryTerms = ({ 
  text, 
  glossaryTerms = null,
  className = ''
}) => {
  const [terms, setTerms] = useState(glossaryTerms || []);
  const [loading, setLoading] = useState(!glossaryTerms);

  // Charger les termes si pas fournis
  useEffect(() => {
    if (!glossaryTerms) {
      const loadTerms = async () => {
        try {
          const allTerms = await getAllGlossaryTerms();
          setTerms(allTerms || []);
        } catch (err) {
          console.error('Error loading glossary terms:', err);
          setTerms([]);
        } finally {
          setLoading(false);
        }
      };
      
      loadTerms();
    }
  }, [glossaryTerms]);

  if (!text) {
    return <span className={className}>{text}</span>;
  }

  if (loading) {
    return <span className={className}>{text}</span>;
  }

  if (!terms || terms.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Trier les termes par longueur (les plus longs d'abord) pour éviter les doublons
  const sortedTerms = [...terms].sort((a, b) => b.term.length - a.term.length);

  // Créer une regex qui correspond à tous les termes ET les variantes
  const allPatterns = [];
  
  // Ajouter les termes principaux
  sortedTerms.forEach(t => {
    allPatterns.push(t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  });
  
  // Ajouter les variantes stockées dans glossary_variants
  sortedTerms.forEach(t => {
    if (t.variants && Array.isArray(t.variants)) {
      t.variants.forEach(v => {
        if (v) {
          allPatterns.push(v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        }
      });
    }
  });

  // Supprimer les doublons et trier par longueur
  const uniquePatterns = [...new Set(allPatterns)].sort((a, b) => b.length - a.length);
  const pattern = uniquePatterns.join('|');

  // DEBUG
  console.log('Patterns pour regex:', uniquePatterns.slice(0, 20));
  console.log('Inclut "glisse"?', uniquePatterns.includes('glisse'));

  if (!pattern) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, idx) => {
        if (!part) return null;
        
        // Chercher un terme exact ou une variante
        const glossaryTerm = findMatchingTerm(part, sortedTerms);

        if (glossaryTerm) {
          return (
            <GlossaryWord
              key={idx}
              term={glossaryTerm.term}
              definition={glossaryTerm.definition}
              example={glossaryTerm.example}
              relatedTerms={glossaryTerm.related_terms}
            >
              {part}
            </GlossaryWord>
          );
        }

        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
};

export default GlossaryWord;
