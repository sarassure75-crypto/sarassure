import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Globe, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

/**
 * Component pour sélectionner la langue de traduction préférée dans le profil utilisateur
 * Utilisé dans le profil utilisateur et les paramètres
 */
export const LanguagePreferenceSelector = () => {
  const { currentUser: user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState('fr');
  const [availableLanguages, setAvailableLanguages] = useState([]);

  // Charger les langues disponibles et la langue préférée de l'utilisateur
  useEffect(() => {
    const loadLanguageData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Récupérer les langues disponibles
        const { data: langData } = await supabase
          .from('translation_settings')
          .select('language_code, language_name')
          .order('language_code', { ascending: true });

        if (langData) {
          setAvailableLanguages(langData);
        }

        // Récupérer la langue préférée de l'utilisateur
        const { data: profileData } = await supabase
          .from('profiles')
          .select('preferred_translation_language')
          .eq('id', user.id)
          .single();

        if (profileData?.preferred_translation_language) {
          setPreferredLanguage(profileData.preferred_translation_language);
        }
      } catch (error) {
        console.error('Error loading language preferences:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les langues disponibles',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguageData();
  }, [user?.id, toast]);

  const handleLanguageChange = async (languageCode) => {
    if (languageCode === preferredLanguage) return;

    setIsSaving(true);
    try {
      // Toujours sauvegarder la langue préférée, y compris français
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_translation_language: languageCode })
        .eq('id', user.id);

      if (error) throw error;

      setPreferredLanguage(languageCode);

      // Mettre à jour localStorage aussi
      try {
        localStorage.setItem('preferredLanguage', languageCode);
      } catch (e) {
        console.error('Error updating localStorage:', e);
      }

      toast({
        title: 'Succès',
        description: `Langue de traduction définie à ${
          availableLanguages.find((l) => l.language_code === languageCode)?.language_name ||
          languageCode.toUpperCase()
        }`,
      });
    } catch (error) {
      console.error('Error updating language preference:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la langue préférée',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Langue de traduction</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Sélectionnez votre langue préférée pour les traductions des exercices. Vous pourrez toujours
        basculer vers le français en cours d'exercice.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {availableLanguages.map((lang) => (
          <button
            key={lang.language_code}
            onClick={() => handleLanguageChange(lang.language_code)}
            disabled={isSaving}
            className={`
              relative p-3 rounded-lg border-2 transition-all
              ${
                preferredLanguage === lang.language_code
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">
                {lang.language_name || lang.language_code.toUpperCase()}
              </span>
              {preferredLanguage === lang.language_code && !isSaving && (
                <Check className="w-4 h-4 text-primary" />
              )}
              {preferredLanguage === lang.language_code && isSaving && (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {lang.language_code.toUpperCase()}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          💡 <strong>Astuce :</strong> Dans les exercices, cliquez sur le bouton 🌐 pour basculer
          entre le français et votre langue préférée.
        </p>
      </div>
    </div>
  );
};

export default LanguagePreferenceSelector;
