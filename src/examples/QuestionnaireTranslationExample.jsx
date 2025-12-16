/**
 * QuestionnaireTranslationExample.jsx
 * 
 * Exemple montrant comment utiliser le système de traduction pour les QCM
 * 
 * @example
 * import { QuestionnaireTranslationExample } from '@/examples/QuestionnaireTranslationExample'
 * 
 * export default function App() {
 *   return <QuestionnaireTranslationExample />
 * }
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code } from 'lucide-react';

/**
 * ÉTAPE 1: Importer les fonctions nécessaires
 */
export function Step1_ImportTranslationFunctions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Étape 1 : Imports
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`import {
  getQuestionnaireQuestionTranslations,
  getQuestionnaireChoiceTranslations,
  createQuestionnaireQuestionTranslation,
  createQuestionnaireChoiceTranslation,
  getTranslatedQuestion,
  getQuestionnaireTranslationStats
} from '@/data/translation';`}
        </pre>
      </CardContent>
    </Card>
  );
}

/**
 * ÉTAPE 2: Récupérer les traductions pour une langue
 */
export function Step2_FetchTranslations() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Étape 2 : Récupérer les traductions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`// Récupérer toutes les traductions de questions pour l'anglais
const questionTranslations = await getQuestionnaireQuestionTranslations('en');
console.log(questionTranslations);
// Résultat:
// [
//   {
//     id: 'uuid...',
//     question_id: 'q-uuid...',
//     language_code: 'en',
//     translated_instruction: 'Select the correct answer',
//     created_at: '2025-12-16...',
//     updated_at: '2025-12-16...'
//   }
// ]

// Récupérer les traductions des réponses
const choiceTranslations = await getQuestionnaireChoiceTranslations('en');
console.log(choiceTranslations);
// Résultat:
// [
//   {
//     id: 'uuid...',
//     choice_id: 'c-uuid...',
//     language_code: 'en',
//     translated_choice_text: 'This is the correct answer',
//     translated_feedback: 'Great job!',
//     created_at: '2025-12-16...',
//     updated_at: '2025-12-16...'
//   }
// ]`}
        </pre>
      </CardContent>
    </Card>
  );
}

/**
 * ÉTAPE 3: Récupérer une question complète avec traductions
 */
export function Step3_GetTranslatedQuestion() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Étape 3 : Récupérer une question traduite</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`// Récupérer une question avec TOUTES ses traductions et réponses
const translatedQuestion = await getTranslatedQuestion(
  'question-id-uuid',
  'en' // langue
);

console.log(translatedQuestion);
// Résultat:
// {
//   id: 'question-id-uuid',
//   instruction: 'Select the correct answer', // en anglais
//   type: 'image_choice',
//   imageId: 'image-uuid',
//   choices: [
//     {
//       id: 'choice-uuid-1',
//       text: 'This is correct', // en anglais
//       order: 1,
//       isCorrect: true,
//       feedback: 'Great!', // feedback en anglais
//       imageId: null
//     },
//     {
//       id: 'choice-uuid-2',
//       text: 'This is wrong', // en anglais
//       order: 2,
//       isCorrect: false,
//       feedback: 'Try again', // feedback en anglais
//       imageId: null
//     }
//   ]
// }`}
        </pre>
      </CardContent>
    </Card>
  );
}

/**
 * ÉTAPE 4: Créer une traduction de question (Admin)
 */
export function Step4_CreateQuestionTranslation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Étape 4 : Créer une traduction de question</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`// Créer une traduction pour une question
const newTranslation = await createQuestionnaireQuestionTranslation(
  'question-id-uuid', // ID de la question
  'en',               // langue cible
  'Select the correct answer' // texte traduit
);

console.log(newTranslation);
// {
//   id: 'new-uuid...',
//   question_id: 'question-id-uuid',
//   language_code: 'en',
//   translated_instruction: 'Select the correct answer',
//   created_at: '2025-12-16T...',
//   updated_at: '2025-12-16T...',
//   translated_by: 'user-uuid...'
// }`}
        </pre>
      </CardContent>
    </Card>
  );
}

/**
 * ÉTAPE 5: Créer une traduction de réponse (Admin)
 */
export function Step5_CreateChoiceTranslation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Étape 5 : Créer une traduction de réponse</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`// Créer une traduction pour une réponse
const newTranslation = await createQuestionnaireChoiceTranslation(
  'choice-id-uuid',           // ID de la réponse
  'en',                       // langue cible
  'This is the correct answer', // texte traduit
  'Great job!'                // feedback traduit (optionnel)
);

console.log(newTranslation);
// {
//   id: 'new-uuid...',
//   choice_id: 'choice-id-uuid',
//   language_code: 'en',
//   translated_choice_text: 'This is the correct answer',
//   translated_feedback: 'Great job!',
//   created_at: '2025-12-16T...',
//   updated_at: '2025-12-16T...',
//   translated_by: 'user-uuid...'
// }`}
        </pre>
      </CardContent>
    </Card>
  );
}

/**
 * ÉTAPE 6: Utiliser les traductions dans le composant
 */
export function Step6_UseInComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Étape 6 : Utiliser dans votre composant</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`// Exemple dans QuestionnairePlayer.jsx

const [currentLanguage, setCurrentLanguage] = useState('fr');
const [questionTranslations, setQuestionTranslations] = useState({});
const [choiceTranslations, setChoiceTranslations] = useState({});

// Charger les traductions quand la langue change
useEffect(() => {
  if (currentLanguage !== 'fr') {
    loadTranslations(currentLanguage);
  }
}, [currentLanguage]);

const loadTranslations = async (languageCode) => {
  const [qTrans, cTrans] = await Promise.all([
    getQuestionnaireQuestionTranslations(languageCode),
    getQuestionnaireChoiceTranslations(languageCode)
  ]);

  // Créer des maps pour accès rapide
  const qTransMap = {};
  qTrans.forEach(t => {
    qTransMap[t.question_id] = t.translated_instruction;
  });
  setQuestionTranslations(qTransMap);

  const cTransMap = {};
  cTrans.forEach(t => {
    cTransMap[t.choice_id] = t.translated_choice_text;
  });
  setChoiceTranslations(cTransMap);
};

// Utiliser les traductions
const getQuestionText = (question) => {
  if (currentLanguage !== 'fr' && questionTranslations[question.id]) {
    return questionTranslations[question.id];
  }
  return question.instruction;
};

const getChoiceText = (choice) => {
  if (currentLanguage !== 'fr' && choiceTranslations[choice.id]) {
    return choiceTranslations[choice.id];
  }
  return choice.text;
};

// Affichage
<h2>{getQuestionText(currentQuestion)}</h2>
{currentQuestion.choices.map(choice => (
  <button key={choice.id}>
    {getChoiceText(choice)}
  </button>
))}`}
        </pre>
      </CardContent>
    </Card>
  );
}

/**
 * ÉTAPE 7: Récupérer les statistiques de traduction
 */
export function Step7_GetTranslationStats() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Étape 7 : Statistiques de traduction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`// Récupérer les statistiques de traduction des QCM
const stats = await getQuestionnaireTranslationStats();

console.log(stats);
// Résultat:
// {
//   'en': {
//     name: 'Anglais',
//     questions: 12,      // nombre de questions traduites
//     choices: 48         // nombre de réponses traduites
//   },
//   'es': {
//     name: 'Espagnol',
//     questions: 8,
//     choices: 32
//   },
//   'de': {
//     name: 'Allemand',
//     questions: 0,       // pas de traductions encore
//     choices: 0
//   }
// }`}
        </pre>
      </CardContent>
    </Card>
  );
}

/**
 * PATTERN: Avec mise en cache
 */
export function Pattern_WithCaching() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pattern : Traductions avec mise en cache</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`// Meilleure pratique : mettre en cache les traductions
const translationCache = new Map();

const getOrFetchTranslations = async (languageCode) => {
  // Vérifier le cache
  if (translationCache.has(languageCode)) {
    return translationCache.get(languageCode);
  }

  // Charger depuis Supabase
  const [questions, choices] = await Promise.all([
    getQuestionnaireQuestionTranslations(languageCode),
    getQuestionnaireChoiceTranslations(languageCode)
  ]);

  const translations = { questions, choices };
  
  // Mettre en cache
  translationCache.set(languageCode, translations);
  
  return translations;
};

// Utilisation
const translations = await getOrFetchTranslations('en');`}
        </pre>
      </CardContent>
    </Card>
  );
}

/**
 * PATTERN: Affichage avec fallback
 */
export function Pattern_WithFallback() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pattern : Affichage avec fallback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`// Composant réutilisable pour afficher un texte traduit
export function TranslatedText({ textId, originalText, language, translationMap }) {
  const translatedText = translationMap?.[textId];

  return (
    <span>
      {translatedText || originalText}
      {translatedText && (
        <span className="text-xs text-blue-500 ml-1">({language})</span>
      )}
    </span>
  );
}

// Utilisation
<TranslatedText
  textId={question.id}
  originalText={question.instruction}
  language={currentLanguage}
  translationMap={questionTranslations}
/>`}
        </pre>
      </CardContent>
    </Card>
  );
}

/**
 * Component Principal
 */
export function QuestionnaireTranslationExample() {
  return (
    <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Traductions des QCM - Exemples d'Utilisation
        </h1>
        <p className="text-gray-600">
          Guide complet pour intégrer les traductions dans votre système de QCM
        </p>
      </div>

      <Step1_ImportTranslationFunctions />
      <Step2_FetchTranslations />
      <Step3_GetTranslatedQuestion />
      <Step4_CreateQuestionTranslation />
      <Step5_CreateChoiceTranslation />
      <Step6_UseInComponent />
      <Step7_GetTranslationStats />
      <Pattern_WithCaching />
      <Pattern_WithFallback />

      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-700">✨ Points clés</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-green-800">
          <p>✅ Les traductions suivent le même pattern que le glossaire</p>
          <p>✅ Toujours vérifier si une traduction existe avant l'affichage</p>
          <p>✅ Utiliser le caching pour les performances</p>
          <p>✅ Les traductions sont optionnelles (fallback au texte original)</p>
          <p>✅ Les administrateurs gèrent les traductions via AdminQuestionnaireTranslationManager</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default QuestionnaireTranslationExample;
