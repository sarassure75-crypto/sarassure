/**
 * INTÉGRATION DE TRADUCTION DANS QUESTIONNAIRE
 *
 * Ce fichier montre comment ajouter la traduction multilingue
 * aux pages de questionnaire (QCM) et à leurs questions
 */

// ============ EXEMPLE: Modification de QuestionnairePlayerPage.jsx ============

export function QuestionnairePlayerPageWithTranslation() {
  const code = `
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { translateInstruction, getGlossaryTranslations } from '@/data/translation';
import { LanguageSwitcher } from '@/components/TranslationComponents';

const QuestionnairePlayerPage = () => {
  // États existants
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [responses, setResponses] = useState({});
  
  // NOUVEAUX: États de traduction
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatedQuestions, setTranslatedQuestions] = useState({});
  const [glossaryTerms, setGlossaryTerms] = useState([]);
  
  const { taskId } = useParams();
  const navigate = useNavigate();

  // Charger la préférence de langue sauvegardée
  useEffect(() => {
    const savedLanguage = localStorage.getItem('userLanguagePreference');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Charger les traductions du lexique pour la langue sélectionnée
  useEffect(() => {
    const loadGlossaryTerms = async () => {
      if (currentLanguage !== 'fr') {
        try {
          const terms = await getGlossaryTranslations(currentLanguage);
          setGlossaryTerms(terms);
        } catch (error) {
          console.error('Erreur chargement lexique:', error);
        }
      }
    };

    loadGlossaryTerms();
  }, [currentLanguage]);

  // Traduire le titre du questionnaire
  useEffect(() => {
    const translateTitle = async () => {
      if (!questionnaire?.title) return;

      if (currentLanguage === 'fr') {
        setTranslatedTitle(questionnaire.title);
      } else {
        try {
          const translated = await translateInstruction(
            questionnaire.title,
            currentLanguage,
            glossaryTerms
          );
          setTranslatedTitle(translated);
        } catch (error) {
          console.error('Erreur traduction titre:', error);
          setTranslatedTitle(questionnaire.title);
        }
      }
    };

    translateTitle();
  }, [questionnaire?.title, currentLanguage, glossaryTerms]);

  // Traduire les questions
  useEffect(() => {
    const translateQuestions = async () => {
      if (!questions || questions.length === 0) return;

      const translations = {};

      for (const question of questions) {
        if (currentLanguage === 'fr') {
          translations[question.id] = {
            text: question.question_text,
            options: question.options.map(opt => opt.text)
          };
        } else {
          try {
            const translatedText = await translateInstruction(
              question.question_text,
              currentLanguage,
              glossaryTerms
            );

            const translatedOptions = await Promise.all(
              question.options.map(opt =>
                translateInstruction(opt.text, currentLanguage, glossaryTerms)
              )
            );

            translations[question.id] = {
              text: translatedText,
              options: translatedOptions
            };
          } catch (error) {
            console.error(\`Erreur traduction question \${question.id}:\`, error);
            translations[question.id] = {
              text: question.question_text,
              options: question.options.map(opt => opt.text)
            };
          }
        }
      }

      setTranslatedQuestions(translations);
    };

    translateQuestions();
  }, [questions, currentLanguage, glossaryTerms]);

  // Gérer le changement de langue
  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem('userLanguagePreference', newLanguage);
  };

  // Lire une question à voix haute
  const playAudio = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage === 'fr' ? 'fr-FR' : currentLanguage;
    utterance.pitch = 1.2;
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Barre de langue et audio */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <h1 className="text-2xl font-bold">{translatedTitle}</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => playAudio(translatedTitle)}
            className="p-2 hover:bg-gray-100 rounded"
            title="Lire le titre"
          >
            🔊
          </button>
          <LanguageSwitcher 
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question, idx) => {
          const translated = translatedQuestions[question.id];
          
          return (
            <div key={question.id} className="bg-white p-6 rounded-lg shadow">
              {/* Numéro et titre de la question */}
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Question {idx + 1}: {translated?.text || question.question_text}
                </h2>
                <button
                  onClick={() => playAudio(translated?.text || question.question_text)}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Lire la question"
                >
                  🔊
                </button>
              </div>

              {/* Options de réponse */}
              <div className="space-y-2">
                {question.options.map((option, optIdx) => (
                  <label
                    key={option.id}
                    className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={\`question_\${question.id}\`}
                      value={option.id}
                      checked={responses[question.id] === option.id}
                      onChange={(e) => {
                        setResponses(prev => ({
                          ...prev,
                          [question.id]: option.id
                        }));
                      }}
                      className="mr-3"
                    />
                    <span className="flex-1">
                      {translated?.options[optIdx] || option.text}
                    </span>
                    <button
                      onClick={() => playAudio(translated?.options[optIdx] || option.text)}
                      className="p-1 ml-2 hover:bg-gray-100 rounded text-sm"
                      title="Lire l'option"
                    >
                      🔊
                    </button>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionnairePlayerPage;
  `;

  return <pre className="bg-gray-100 p-4 rounded overflow-auto">{code}</pre>;
}

// ============ EXEMPLE: QuestionnairePlayer (composant interne) ============

export function QuestionnairePlayerWithTranslation() {
  const code = `
const QuestionnairePlayer = ({ 
  questions, 
  onSubmit,
  currentLanguage = 'fr',
  onLanguageChange 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [translatedQuestion, setTranslatedQuestion] = useState('');
  const [translatedOptions, setTranslatedOptions] = useState([]);
  const [glossaryTerms, setGlossaryTerms] = useState([]);

  // Charger lexique
  useEffect(() => {
    const loadTerms = async () => {
      if (currentLanguage !== 'fr') {
        const terms = await getGlossaryTranslations(currentLanguage);
        setGlossaryTerms(terms);
      }
    };
    loadTerms();
  }, [currentLanguage]);

  // Traduire la question actuelle
  useEffect(() => {
    const translate = async () => {
      const question = questions[currentIndex];
      if (!question) return;

      if (currentLanguage === 'fr') {
        setTranslatedQuestion(question.question_text);
        setTranslatedOptions(question.options.map(o => o.text));
      } else {
        const qTranslated = await translateInstruction(
          question.question_text,
          currentLanguage,
          glossaryTerms
        );
        
        const oTranslated = await Promise.all(
          question.options.map(o =>
            translateInstruction(o.text, currentLanguage, glossaryTerms)
          )
        );

        setTranslatedQuestion(qTranslated);
        setTranslatedOptions(oTranslated);
      }
    };

    translate();
  }, [currentIndex, currentLanguage, questions, glossaryTerms]);

  return (
    <div className="space-y-6">
      {/* Barre de langue */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          Question {currentIndex + 1} sur {questions.length}
        </h2>
        <LanguageSwitcher 
          currentLanguage={currentLanguage}
          onLanguageChange={onLanguageChange}
        />
      </div>

      {/* Question et options traduites */}
      <div>
        <p className="text-xl mb-4">{translatedQuestion}</p>
        <div className="space-y-2">
          {translatedOptions.map((option, idx) => (
            <label key={idx}>
              <input
                type="radio"
                name="answer"
                value={questions[currentIndex].options[idx].id}
                onChange={(e) => {
                  setResponses(prev => ({
                    ...prev,
                    [questions[currentIndex].id]: e.target.value
                  }));
                }}
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          Précédent
        </button>
        <button
          onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
          disabled={currentIndex === questions.length - 1}
        >
          Suivant
        </button>
      </div>
    </div>
  );
};
  `;

  return <pre className="bg-gray-100 p-4 rounded overflow-auto">{code}</pre>;
}

// ============ EXEMPLE: Traduction des réponses ============

export function TranslatingAnswerResults() {
  const code = `
// Fonction pour traduire les résultats du questionnaire
async function translateQuestionnaireResults(results, language, glossaryTerms) {
  const translated = {
    ...results,
    questions: await Promise.all(
      results.questions.map(async (q) => ({
        ...q,
        question: await translateInstruction(q.question, language, glossaryTerms),
        userAnswer: q.userAnswer ? await translateInstruction(q.userAnswer, language, glossaryTerms) : null,
        correctAnswer: q.correctAnswer ? await translateInstruction(q.correctAnswer, language, glossaryTerms) : null
      }))
    )
  };
  return translated;
}

// Utilisation dans la page de résultats
useEffect(() => {
  if (results && currentLanguage !== 'fr') {
    const translateResults = async () => {
      const translated = await translateQuestionnaireResults(
        results,
        currentLanguage,
        glossaryTerms
      );
      setTranslatedResults(translated);
    };
    translateResults();
  } else {
    setTranslatedResults(results);
  }
}, [results, currentLanguage, glossaryTerms]);
  `;

  return <pre className="bg-gray-100 p-4 rounded overflow-auto">{code}</pre>;
}

// ============ COMPOSANT D'INTÉGRATION ============

export function QuestionnaireTranslationIntegration() {
  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Intégration traduction - Questionnaires</h1>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">1️⃣ QuestionnairePlayerPage</h2>
        <p className="text-gray-700">Page standalone pour les QCM</p>
        <QuestionnairePlayerPageWithTranslation />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">2️⃣ QuestionnairePlayer (composant)</h2>
        <p className="text-gray-700">Composant utilisé dans ExercisePage</p>
        <QuestionnairePlayerWithTranslation />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">3️⃣ Traduction des résultats</h2>
        <p className="text-gray-700">Traduction de la page de correction</p>
        <TranslatingAnswerResults />
      </section>

      <section className="bg-blue-50 p-6 rounded-lg space-y-4">
        <h2 className="text-2xl font-bold">📋 Checklist d'intégration</h2>
        <ul className="space-y-2 text-sm">
          <li>✅ Ajouter état `currentLanguage` à QuestionnairePlayerPage</li>
          <li>✅ Charger glossaryTerms au changement de langue</li>
          <li>✅ Traduire titre du questionnaire</li>
          <li>✅ Traduire chaque question et ses options</li>
          <li>✅ Ajouter boutons audio pour questions et options</li>
          <li>✅ Sauvegarder préférence de langue dans localStorage</li>
          <li>✅ Traduire les résultats/corrections</li>
          <li>✅ Gérer les erreurs de traduction avec fallback</li>
        </ul>
      </section>

      <section className="bg-green-50 p-6 rounded-lg space-y-4">
        <h2 className="text-2xl font-bold">💡 Bonnes pratiques</h2>
        <ul className="space-y-3 text-sm">
          <li>
            <strong>Cache des traductions:</strong> Éviter de re-traduire la même question en
            changeant de langue et revenant
            <code className="block bg-white p-2 rounded mt-1">
              const [translationCache, setTranslationCache] = useState({});
            </code>
          </li>
          <li>
            <strong>Traduction progressive:</strong> Traduire une question à la fois pour meilleure
            performance
            <code className="block bg-white p-2 rounded mt-1">
              // Traduire seulement la question affichée, pas toutes
            </code>
          </li>
          <li>
            <strong>Synchronisation du vocabulaire:</strong> Assurer que glossaire est chargé avant
            traduction
            <code className="block bg-white p-2 rounded mt-1">
              // Attendre glossaryTerms avant de traduire
            </code>
          </li>
        </ul>
      </section>
    </div>
  );
}

export default QuestionnaireTranslationIntegration;
