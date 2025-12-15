/**
 * EXEMPLE D'INTÉGRATION DE TRADUCTION DANS EXERCISEPAGE
 * 
 * Ce fichier montre comment intégrer la traduction automatique
 * des consignes d'exercices en utilisant le système de traduction
 * et du lexique spécialisé en vocabulaire smartphone.
 */

import React, { useState, useEffect } from 'react';
import { InstructionTranslator, LanguageSwitcher, TranslatableText } from '@/components/TranslationComponents';
import { translateInstruction, getGlossaryTranslations } from '@/data/translation';

/**
 * ÉTAPE 1: Ajouter l'état de langue dans ExercisePage
 */
export function Step1_AddLanguageState() {
  const code = `
    // Dans ExercisePage.jsx, ajouter à la section "ALL STATES FIRST":
    const [currentLanguage, setCurrentLanguage] = useState('fr');
    const [translatedInstruction, setTranslatedInstruction] = useState('');
    const [glossaryTerms, setGlossaryTerms] = useState([]);
    
    // Changer la langue
    const handleLanguageChange = (newLanguage) => {
      setCurrentLanguage(newLanguage);
      localStorage.setItem('userLanguagePreference', newLanguage);
    };
    
    // Charger la préférence de langue sauvegardée
    useEffect(() => {
      const savedLanguage = localStorage.getItem('userLanguagePreference');
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
      }
    }, []);
  `;
  
  return <pre>{code}</pre>;
}

/**
 * ÉTAPE 2: Charger les traductions du lexique
 */
export function Step2_LoadGlossaryTranslations() {
  const code = `
    // Ajouter un effet pour charger les traductions du lexique
    useEffect(() => {
      const loadGlossaryTerms = async () => {
        if (currentLanguage !== 'fr') {
          try {
            const terms = await getGlossaryTranslations(currentLanguage);
            setGlossaryTerms(terms);
          } catch (error) {
            console.error('Erreur lors du chargement des termes du lexique:', error);
          }
        }
      };
      
      loadGlossaryTerms();
    }, [currentLanguage]);
  `;
  
  return <pre>{code}</pre>;
}

/**
 * ÉTAPE 3: Traduire les instructions
 */
export function Step3_TranslateInstructions() {
  const code = `
    // Chaque fois que l'instruction change ou que la langue change:
    useEffect(() => {
      const translateInstr = async () => {
        if (currentStep?.instruction) {
          if (currentLanguage === 'fr') {
            setTranslatedInstruction(currentStep.instruction);
          } else {
            try {
              const translated = await translateInstruction(
                currentStep.instruction,
                currentLanguage,
                glossaryTerms
              );
              setTranslatedInstruction(translated);
            } catch (error) {
              console.error('Erreur traduction:', error);
              setTranslatedInstruction(currentStep.instruction);
            }
          }
        }
      };
      
      translateInstr();
    }, [currentStep?.instruction, currentLanguage, glossaryTerms]);
  `;
  
  return <pre>{code}</pre>;
}

/**
 * ÉTAPE 4: Passer la langue au composant VerticalToolbar
 */
export function Step4_PassLanguageToToolbar() {
  const code = `
    // Dans la section du rendu, passer les props:
    <VerticalToolbar
      // ... autres props ...
      currentLanguage={currentLanguage}
      onLanguageChange={handleLanguageChange}
    />
  `;
  
  return <pre>{code}</pre>;
}

/**
 * ÉTAPE 5: Utiliser le texte traduit au lieu du texte original
 */
export function Step5_DisplayTranslatedText() {
  const code = `
    // Dans ExerciseHeader et StepDisplay, utiliser translatedInstruction:
    <p className="text-gray-700 text-base" style={{ fontSize: \`\${100 * textZoom}%\` }}>
      {translatedInstruction || 'Aucune instruction'}
    </p>
  `;
  
  return <pre>{code}</pre>;
}

/**
 * UTILISATION ALTERNATIVE: Composant InstructionTranslator
 * Pour une intégration plus simple sans état supplémentaire
 */
export function AlternativeApproachWithComponent() {
  return (
    <div className="space-y-4 p-4 bg-blue-50 rounded">
      <h3 className="font-bold text-lg">Approche Simplifiée avec InstructionTranslator</h3>
      <p className="text-sm text-gray-700">
        Vous pouvez utiliser directement le composant InstructionTranslator qui gère tout l'état internement:
      </p>
      
      <code>{`
<InstructionTranslator 
  instruction={currentStep.instruction}
  currentLanguage={currentLanguage}
  onLanguageChange={setCurrentLanguage}
/>
      `}</code>
    </div>
  );
}

/**
 * EXEMPLE COMPLET: Intégration dans ExerciseHeader
 */
export function CompleteExample_ExerciseHeaderWithTranslation() {
  const code = `
const ExerciseHeader = ({ 
  taskTitle, 
  currentStep, 
  onPlayAudio, 
  showInstructions, 
  textZoom, 
  isMobileLayout,
  currentLanguage,      // NOUVEAU
  onLanguageChange,     // NOUVEAU
  translatedInstruction // NOUVEAU
}) => {
  return (
    <div className="flex justify-between items-center shrink-0 relative bg-white p-4 rounded-lg shadow">
      {/* Titre à gauche */}
      <div className="flex items-center gap-1 flex-grow min-w-0">
        <h1 className="font-bold text-primary" style={{ fontSize: \`\${100 * textZoom}%\` }}>
          {taskTitle}
        </h1>
      </div>
      
      {/* Sélecteur de langue */}
      <div className="ml-4">
        <LanguageSwitcher 
          currentLanguage={currentLanguage}
          onLanguageChange={onLanguageChange}
          showLabel={true}
        />
      </div>
      
      {/* Instructions à droite */}
      {showInstructions && !isMobileLayout && (
        <div className="flex-grow ml-4">
          <p className="text-gray-700" style={{ fontSize: \`\${100 * textZoom}%\` }}>
            {translatedInstruction || 'Aucune instruction'}
          </p>
        </div>
      )}
    </div>
  );
};
  `;
  
  return <pre>{code}</pre>;
}

/**
 * CONFIGURATION DES CLÉS API
 */
export function APIConfiguration() {
  return (
    <div className="space-y-4 p-4 bg-amber-50 rounded">
      <h3 className="font-bold text-lg">Configuration requise</h3>
      
      <div className="space-y-2 text-sm">
        <p>Pour une meilleure qualité de traduction, configurez les clés API dans votre fichier <code>.env.local</code>:</p>
        
        <code className="block bg-white p-2 rounded border border-gray-300">
          {`# DeepL API (recommandé pour la qualité)
VITE_DEEPL_API_KEY=your_deepl_key_here

# Google Translate API (option de secours)
VITE_GOOGLE_TRANSLATE_API_KEY=your_google_key_here

# LibreTranslate (gratuit, pas de clé nécessaire)`}
        </code>
        
        <p>Sans clé API, le système utilisera LibreTranslate (service public gratuit) comme fallback.</p>
      </div>
    </div>
  );
}

/**
 * LANGUES DISPONIBLES
 */
export function AvailableLanguages() {
  const languages = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English (Anglais)' },
    { code: 'es', name: 'Español (Espagnol)' },
    { code: 'de', name: 'Deutsch (Allemand)' },
    { code: 'it', name: 'Italiano (Italien)' },
    { code: 'pt', name: 'Português (Portugais)' },
    { code: 'nl', name: 'Nederlands (Néerlandais)' },
  ];
  
  return (
    <div className="space-y-2 p-4 bg-green-50 rounded">
      <h3 className="font-bold">Langues supportées:</h3>
      <ul className="text-sm space-y-1">
        {languages.map(lang => (
          <li key={lang.code}>
            <strong>{lang.name}</strong> (code: <code>{lang.code}</code>)
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * VOCABULAIRE SMARTPHONE PRÉSERVÉ
 * 
 * Le système de traduction automatique respecte le lexique défini.
 * Exemples de termes préservés en traduction:
 * 
 * FR → EN (Exemple de termes du lexique):
 * - "Scroll" → "Scroll" (même en anglais)
 * - "Paramètres" → "Settings"
 * - "Icônes" → "Icons"
 * - "Retour" → "Back"
 * - "Accueil" → "Home"
 */
export function ExampleTranslations() {
  const examples = [
    {
      french: "Scroll vers le bas pour voir plus de contenu. Accédez aux Paramètres en cliquant sur l'Icône correspondante.",
      english: "Scroll down to see more content. Access the Settings by clicking on the corresponding Icon.",
      preserved: ['Scroll', 'Paramètres', 'Icônes']
    },
    {
      french: "Appuyez sur le Bouton retour pour revenir à l'Accueil de l'application.",
      english: "Press the Back button to return to the application's Home.",
      preserved: ['Bouton retour', 'Accueil']
    }
  ];
  
  return (
    <div className="space-y-4 p-4 bg-purple-50 rounded">
      <h3 className="font-bold">Exemples de traductions préservant le vocabulaire:</h3>
      {examples.map((example, idx) => (
        <div key={idx} className="space-y-1 text-sm">
          <p><strong>Français:</strong> {example.french}</p>
          <p><strong>English:</strong> {example.english}</p>
          <p><strong>Termes préservés:</strong> {example.preserved.join(', ')}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * COMPOSANT DE DÉMONSTRATION
 */
export default function TranslationIntegrationDemo() {
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const [instruction] = useState(
    "Scroll vers le bas dans la liste pour trouver l'Icône des Paramètres et cliquez dessus."
  );

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Intégration Traduction - Guide Complet</h1>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Étapes d'intégration</h2>
        <Step1_AddLanguageState />
        <Step2_LoadGlossaryTranslations />
        <Step3_TranslateInstructions />
        <Step4_PassLanguageToToolbar />
        <Step5_DisplayTranslatedText />
      </div>

      <AlternativeApproachWithComponent />
      <CompleteExample_ExerciseHeaderWithTranslation />
      <APIConfiguration />
      <AvailableLanguages />
      <ExampleTranslations />

      <div className="space-y-4 p-4 bg-blue-50 rounded">
        <h3 className="font-bold text-lg">Démonstration en direct</h3>
        <InstructionTranslator 
          instruction={instruction}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
        />
      </div>
    </div>
  );
}
