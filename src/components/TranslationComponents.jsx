import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getAvailableLanguages,
  translateInstruction,
  getGlossaryTranslations,
  createGlossaryTranslation,
  updateGlossaryTranslation,
  deleteGlossaryTranslation,
} from '@/data/translation';
import { getAllGlossaryTerms } from '@/data/glossary';
import { Globe, Loader2, Edit2, Trash2, Plus, Check, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

/**
 * LanguageSwitcher
 * Composant pour changer la langue de l'interface/contenu
 */
export function LanguageSwitcher({ currentLanguage = 'fr', onLanguageChange, showLabel = true }) {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const langs = await getAvailableLanguages();
        setLanguages(langs);
      } catch (error) {
        console.error('Error loading languages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {showLabel && <Globe className="h-4 w-4 text-gray-600" />}
      <select
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {languages.map((lang) => (
          <option key={lang.language_code} value={lang.language_code}>
            {lang.language_name}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * TranslatableText
 * Texte qui peut être traduit au clic
 */
export function TranslatableText({ text, language = 'fr', onTranslate = null, className = '' }) {
  const [translatedText, setTranslatedText] = useState(text);
  const [isTranslating, setIsTranslating] = useState(false);
  const [glossaryTerms, setGlossaryTerms] = useState([]);

  useEffect(() => {
    // Récupérer les traductions du lexique
    const fetchTerms = async () => {
      if (language !== 'fr') {
        try {
          const terms = await getGlossaryTranslations(language);
          setGlossaryTerms(terms);
        } catch (error) {
          console.error('Error loading glossary translations:', error);
        }
      }
    };

    fetchTerms();
  }, [language]);

  useEffect(() => {
    const doTranslation = async () => {
      if (language === 'fr') {
        setTranslatedText(text);
        return;
      }

      setIsTranslating(true);
      try {
        const translated = await translateInstruction(text, language, glossaryTerms);
        setTranslatedText(translated);

        if (onTranslate) {
          onTranslate(translated);
        }
      } catch (error) {
        console.error('Error translating text:', error);
        setTranslatedText(text); // Fallback au texte original
      } finally {
        setIsTranslating(false);
      }
    };

    doTranslation();
  }, [text, language, glossaryTerms, onTranslate]);

  return (
    <div className={cn('relative', className)}>
      {isTranslating && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        </div>
      )}
      <p className={cn('text-gray-800', isTranslating && 'opacity-50')}>{translatedText}</p>
    </div>
  );
}

/**
 * InstructionTranslator
 * Composant pour traduire et afficher une instruction dans la langue choisie
 */
export function InstructionTranslator({
  instruction,
  currentLanguage = 'fr',
  onLanguageChange,
  className = '',
}) {
  const [translating, setTranslating] = useState(false);
  const [translatedInstruction, setTranslatedInstruction] = useState(instruction);
  const [glossaryTerms, setGlossaryTerms] = useState([]);

  useEffect(() => {
    const fetchTerms = async () => {
      if (currentLanguage !== 'fr') {
        try {
          const terms = await getGlossaryTranslations(currentLanguage);
          setGlossaryTerms(terms);
        } catch (error) {
          console.error('Error loading glossary translations:', error);
        }
      }
    };

    fetchTerms();
  }, [currentLanguage]);

  useEffect(() => {
    const performTranslation = async () => {
      if (currentLanguage === 'fr') {
        setTranslatedInstruction(instruction);
        return;
      }

      setTranslating(true);
      try {
        const translated = await translateInstruction(instruction, currentLanguage, glossaryTerms);
        setTranslatedInstruction(translated);
      } catch (error) {
        console.error('Error translating instruction:', error);
        setTranslatedInstruction(instruction);
      } finally {
        setTranslating(false);
      }
    };

    performTranslation();
  }, [instruction, currentLanguage, glossaryTerms]);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-700">Instruction</h3>
        <LanguageSwitcher
          currentLanguage={currentLanguage}
          onLanguageChange={onLanguageChange}
          showLabel={false}
        />
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          {translating ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Traduction en cours...</span>
            </div>
          ) : (
            <p className="text-gray-800 leading-relaxed">{translatedInstruction}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * AdminTranslationManager
 * Outil d'administration pour gérer les traductions du lexique
 */
export function AdminTranslationManager() {
  const { toast } = useToast();
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [glossaryTerms, setGlossaryTerms] = useState([]);
  const [allGlossaryTerms, setAllGlossaryTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [glossarySearchText, setGlossarySearchText] = useState('');
  const [showGlossaryList, setShowGlossaryList] = useState(false);
  const [newTranslation, setNewTranslation] = useState({
    glossary_id: '',
    glossary_term: '',
    translated_term: '',
    translated_definition: '',
    translated_example: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const langs = await getAvailableLanguages();
        setLanguages(langs);

        const glossary = await getAllGlossaryTerms();
        setAllGlossaryTerms(glossary);

        if (langs.length > 0) {
          setSelectedLanguage(langs[0].language_code);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const terms = await getGlossaryTranslations(selectedLanguage);
        setGlossaryTerms(terms);
      } catch (error) {
        console.error('Error loading glossary translations:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les traductions',
          variant: 'destructive',
        });
      }
    };

    fetchTerms();
  }, [selectedLanguage, toast]);

  const handleSelectGlossaryTerm = (term) => {
    setNewTranslation({
      ...newTranslation,
      glossary_id: term.id,
      glossary_term: term.term,
    });
    setGlossarySearchText(term.term);
    setShowGlossaryList(false);
  };

  const filteredGlossaryTerms =
    glossarySearchText.trim() === ''
      ? []
      : allGlossaryTerms.filter(
          (term) =>
            term.term.toLowerCase().includes(glossarySearchText.toLowerCase()) ||
            term.definition.toLowerCase().includes(glossarySearchText.toLowerCase())
        );

  const handleEdit = (term) => {
    setEditingId(term.id);
    setEditingData({
      translated_term: term.translated_term,
      translated_definition: term.translated_definition,
      translated_example: term.translated_example || '',
    });
  };

  const handleSaveEdit = async (translationId) => {
    try {
      await updateGlossaryTranslation(translationId, editingData);
      setGlossaryTerms(
        glossaryTerms.map((t) => (t.id === translationId ? { ...t, ...editingData } : t))
      );
      setEditingId(null);
      toast({
        title: 'Succès',
        description: 'Traduction mise à jour',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error updating translation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la traduction',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (translationId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette traduction ?')) return;

    try {
      await deleteGlossaryTranslation(translationId);
      setGlossaryTerms(glossaryTerms.filter((t) => t.id !== translationId));
      toast({
        title: 'Succès',
        description: 'Traduction supprimée',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error deleting translation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la traduction',
        variant: 'destructive',
      });
    }
  };

  const handleAddTranslation = async () => {
    if (
      !newTranslation.glossary_id ||
      !newTranslation.translated_term ||
      !newTranslation.translated_definition
    ) {
      toast({
        title: 'Erreur',
        description:
          'Veuillez remplir tous les champs obligatoires (y compris sélectionner un terme du lexique)',
        variant: 'destructive',
      });
      return;
    }

    try {
      const created = await createGlossaryTranslation(
        newTranslation.glossary_id,
        selectedLanguage,
        newTranslation.translated_term,
        newTranslation.translated_definition,
        newTranslation.translated_example
      );

      // Recharger les traductions
      const updated = await getGlossaryTranslations(selectedLanguage);
      setGlossaryTerms(updated);
      setNewTranslation({
        glossary_id: '',
        glossary_term: '',
        translated_term: '',
        translated_definition: '',
        translated_example: '',
      });
      setGlossarySearchText('');
      setShowAddForm(false);

      toast({
        title: 'Succès',
        description: 'Traduction créée',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error creating translation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la traduction',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Traductions</h1>
        <p className="text-gray-600">Gérez les traductions du lexique pour différentes langues</p>
      </div>

      {/* Sélecteur de langue */}
      <Card>
        <CardHeader>
          <CardTitle>Sélectionner une langue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {languages.map((lang) => (
              <Button
                key={lang.language_code}
                onClick={() => setSelectedLanguage(lang.language_code)}
                variant={selectedLanguage === lang.language_code ? 'default' : 'outline'}
                className="w-full"
              >
                {lang.language_name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bouton ajouter traduction */}
      <div className="flex justify-end">
        <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une traduction
        </Button>
      </div>

      {/* Formulaire ajout */}
      {showAddForm && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>Nouvelle traduction ({selectedLanguage.toUpperCase()})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terme original du lexique *
              </label>
              <div className="relative">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Commencez à taper pour chercher..."
                    value={glossarySearchText}
                    onChange={(e) => {
                      setGlossarySearchText(e.target.value);
                      setShowGlossaryList(true);
                    }}
                    onFocus={() => setShowGlossaryList(true)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {newTranslation.glossary_id && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                    ✓ Sélectionné: <strong>{newTranslation.glossary_term}</strong>
                  </div>
                )}

                {showGlossaryList && glossarySearchText.trim() !== '' && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredGlossaryTerms.length > 0 ? (
                      filteredGlossaryTerms.map((term) => (
                        <button
                          key={term.id}
                          onClick={() => handleSelectGlossaryTerm(term)}
                          className="w-full text-left p-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="font-medium text-gray-900">{term.term}</div>
                          <div className="text-xs text-gray-600">{term.definition}</div>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-gray-500">Aucun terme trouvé</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terme traduit *
              </label>
              <input
                type="text"
                value={newTranslation.translated_term}
                onChange={(e) =>
                  setNewTranslation({ ...newTranslation, translated_term: e.target.value })
                }
                placeholder="Ex: Settings"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Définition traduite *
              </label>
              <textarea
                value={newTranslation.translated_definition}
                onChange={(e) =>
                  setNewTranslation({ ...newTranslation, translated_definition: e.target.value })
                }
                placeholder="Entrez la définition traduite..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exemple traduit (optionnel)
              </label>
              <input
                type="text"
                value={newTranslation.translated_example}
                onChange={(e) =>
                  setNewTranslation({ ...newTranslation, translated_example: e.target.value })
                }
                placeholder="Ex: Tap Settings to change options"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddTranslation} className="bg-green-600 hover:bg-green-700">
                Créer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des traductions */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold">Traductions ({glossaryTerms.length})</h2>

        {glossaryTerms.length === 0 ? (
          <Card className="bg-gray-50">
            <CardContent className="pt-6 text-center text-gray-600">
              Aucune traduction pour cette langue
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {glossaryTerms.map((term) => (
              <Card
                key={term.id}
                className={editingId === term.id ? 'border-blue-500 bg-blue-50' : ''}
              >
                <CardContent className="pt-6">
                  {editingId === term.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingData.translated_term}
                        onChange={(e) =>
                          setEditingData({ ...editingData, translated_term: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <textarea
                        value={editingData.translated_definition}
                        onChange={(e) =>
                          setEditingData({ ...editingData, translated_definition: e.target.value })
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={editingData.translated_example}
                        onChange={(e) =>
                          setEditingData({ ...editingData, translated_example: e.target.value })
                        }
                        placeholder="Exemple..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-600 italic focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="flex gap-2 justify-end pt-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleSaveEdit(term.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-blue-700">{term.translated_term}</h3>
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {term.glossary.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Terme original: <strong>{term.glossary.term}</strong>
                      </p>
                      <p className="text-gray-700">{term.translated_definition}</p>
                      {term.translated_example && (
                        <p className="text-sm text-gray-600 italic">
                          💡 Exemple: "{term.translated_example}"
                        </p>
                      )}
                      <div className="flex gap-2 justify-end pt-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(term)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(term.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LanguageSwitcher;
