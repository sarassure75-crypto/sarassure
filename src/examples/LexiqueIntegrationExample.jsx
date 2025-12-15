/**
 * Exemple d'intégration du lexique dans les exercices
 * Montre comment utiliser HighlightGlossaryTerms pour mettre en avant les termes du lexique
 */

import React, { useState, useEffect } from 'react';
import { getAllGlossaryTerms } from '@/data/glossary';
import { HighlightGlossaryTerms } from '@/components/GlossaryComponents';

/**
 * Exemple 1: Simple - Utiliser HighlightGlossaryTerms dans le texte d'une instruction
 */
export function ExerciseInstructionExample() {
  const [glossaryTerms, setGlossaryTerms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllGlossaryTerms().then(terms => {
      setGlossaryTerms(terms);
      setLoading(false);
    });
  }, []);

  const instruction = "Pour scroll vers le bas, appuyez sur le Bouton Power ou utilisez les paramètres pour ajuster le Volume.";

  return (
    <div className="instruction-panel p-4 bg-blue-50 rounded-lg">
      <h3 className="text-lg font-bold mb-2">Instruction</h3>
      {loading ? (
        <p className="text-gray-600">Chargement...</p>
      ) : (
        <HighlightGlossaryTerms
          text={instruction}
          glossaryTerms={glossaryTerms}
          className="text-gray-800 leading-relaxed"
        />
      )}
    </div>
  );
}

/**
 * Exemple 2: Intégration dans StepDisplay (exercice)
 */
export function StepDisplayWithGlossary({ currentStep, glossaryTerms }) {
  if (!currentStep || !glossaryTerms) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Titre avec termes surlignable */}
      <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
        <h2 className="text-xl font-bold text-green-700 mb-2">Étape {currentStep.order}</h2>
        <HighlightGlossaryTerms
          text={currentStep.instruction}
          glossaryTerms={glossaryTerms}
          className="text-gray-800"
        />
      </div>

      {/* Description avec termes */}
      {currentStep.description && (
        <div className="bg-white border border-gray-200 p-4 rounded">
          <h3 className="font-semibold text-gray-700 mb-2">Détails</h3>
          <HighlightGlossaryTerms
            text={currentStep.description}
            glossaryTerms={glossaryTerms}
            className="text-gray-600"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Exemple 3: Intégration dans QuestionnairePlayer (QCM)
 */
export function QuestionCardWithGlossary({ currentQuestion, glossaryTerms }) {
  return (
    <div className="card border-2 border-blue-500 rounded-lg p-6">
      <div className="header mb-4">
        <h3 className="text-xl font-bold text-blue-700">
          <HighlightGlossaryTerms
            text={currentQuestion.instruction}
            glossaryTerms={glossaryTerms}
          />
        </h3>
      </div>

      <div className="choices space-y-3">
        {currentQuestion.choices?.map((choice, idx) => (
          <div key={idx} className="choice-item">
            <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:border-blue-400">
              <input type="radio" name="choice" className="cursor-pointer" />
              <span>
                <HighlightGlossaryTerms
                  text={choice.text}
                  glossaryTerms={glossaryTerms}
                  className="text-gray-800"
                />
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Exemple 4: Composant réutilisable avec gestion interne du chargement
 */
export function InstructionWithGlossary({ text, className = '' }) {
  const [glossaryTerms, setGlossaryTerms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const terms = await getAllGlossaryTerms();
        setGlossaryTerms(terms);
      } catch (error) {
        console.error('Error loading glossary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, []);

  return (
    <div className={className}>
      {loading ? (
        <span className="text-gray-400">Chargement du lexique...</span>
      ) : (
        <HighlightGlossaryTerms
          text={text}
          glossaryTerms={glossaryTerms}
        />
      )}
    </div>
  );
}

/**
 * Exemple 5: Hook personnalisé pour utiliser le lexique
 */
export function useGlossary() {
  const [glossaryTerms, setGlossaryTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const terms = await getAllGlossaryTerms();
        setGlossaryTerms(terms);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, []);

  return { glossaryTerms, loading, error };
}

/**
 * Exemple d'utilisation du hook
 */
export function MyExerciseComponent() {
  const { glossaryTerms, loading } = useGlossary();

  return (
    <div>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <HighlightGlossaryTerms
          text="Pour scroll, appuyez sur le bouton Power"
          glossaryTerms={glossaryTerms}
        />
      )}
    </div>
  );
}

/**
 * Exemple d'intégration dans ExercisePage
 * Ajouter au composant principal:
 * 
 * const { glossaryTerms, loading: glossaryLoading } = useGlossary();
 * 
 * Puis dans le rendu:
 * <HighlightGlossaryTerms
 *   text={currentStep.instruction}
 *   glossaryTerms={glossaryTerms}
 * />
 */

export default ExerciseInstructionExample;
