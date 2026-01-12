import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase, getImageUrl } from '@/lib/supabaseClient';
import IconSelector from '@/components/IconSelector';
import { 
  Plus, Trash2, X, Image as ImageIcon, HelpCircle,
  AlertCircle, CheckCircle, XCircle, Info, Home, Settings,
  User, Users, Lock, Unlock, Eye, EyeOff, Download, Upload,
  Trash, Edit, Copy, Share2, Heart, Star, Flag, MessageSquare,
  Clock, Calendar, MapPin, Phone, Mail, Link, Globe, Zap,
  // Contact icons
  PhoneCall, PhoneOff, PhoneMissed, Smartphone, MessageCircle, MessageSquare as Message,
  // Actions with variants
  Check, Plus as PlusIcon, Minus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  // More utilities
  Search, Filter, Sliders, Settings2, MoreVertical, MoreHorizontal,
  // Status indicators
  Circle, CheckCircle2, AlertTriangle, ActivitySquare,
  // Navigation
  Home as HomeIcon, Navigation, Compass, Map, Waypoints,
  // Communication
  Send, Reply, Forward, Share, Share2 as ShareIcon, AtSign,
  // File & Document
  FileText, File, Folder, FolderOpen, Archive,
  // Media
  Image, ImageOff, Music, Volume2, Volume, Mic, Mic2,
  // Misc
  Package, Gift, Lightbulb, Target, Trophy, Award, Zap as ZapIcon
} from 'lucide-react';
import * as FA from 'react-icons/fa6';
import { v4 as uuidv4 } from 'uuid';
import { validateQuestionnaire, sanitizeHTML } from '@/lib/validation';
import { EMOTION_ICONS, COMMUNICATION_ICONS, MEDICAL_ICONS, TRANSPORT_ICONS, COMMERCE_ICONS, EDUCATION_ICONS } from '@/lib/iconConfigs';

/**
 * QUESTIONNAIRE CREATION - Mixed Mode Only
 * 
 * All QCM questions now use unified MIXED mode:
 * - Question: TEXTE + IMAGE OPTIONNELLE
 * - Réponses: Chaque réponse peut avoir IMAGE OU TEXTE OU LES DEUX
 * - Utilisateur peut sélectionner plusieurs réponses (checkbox mode)
 * - Validation: au moins une réponse avec image OU texte
 */

// Icônes Lucide disponibles comme options pour les QCM - Groupées par catégorie
const LUCIDE_ICONS = [
  // === STATUT & VALIDATION ===
  { id: 'lucide-check-circle', name: '✓ Correct', component: CheckCircle, category: 'Statut' },
  { id: 'lucide-check', name: '✓ Check', component: Check, category: 'Statut' },
  { id: 'lucide-x-circle', name: '✗ Incorrect', component: XCircle, category: 'Statut' },
  { id: 'lucide-alert-circle', name: '⚠ Alerte', component: AlertCircle, category: 'Statut' },
  { id: 'lucide-alert-triangle', name: '⚠ Attention', component: AlertTriangle, category: 'Statut' },
  { id: 'lucide-info', name: 'ⓘ Info', component: Info, category: 'Statut' },
  { id: 'lucide-circle', name: '● Point', component: Circle, category: 'Statut' },
  
  // === CONTACT & COMMUNICATION ===
  { id: 'lucide-phone', name: '☎ Téléphone', component: Phone, category: 'Contact' },
  { id: 'lucide-phone-call', name: '📞 Appel', component: PhoneCall, category: 'Contact' },
  { id: 'lucide-phone-off', name: '🚫 Appel Off', component: PhoneOff, category: 'Contact' },
  { id: 'lucide-phone-missed', name: '❌ Appel Manqué', component: PhoneMissed, category: 'Contact' },
  { id: 'lucide-smartphone', name: '📱 Smartphone', component: Smartphone, category: 'Contact' },
  { id: 'lucide-mail', name: '✉ Email', component: Mail, category: 'Contact' },
  { id: 'lucide-message', name: '💬 Message', component: MessageSquare, category: 'Contact' },
  { id: 'lucide-message-circle', name: '💭 Chat', component: MessageCircle, category: 'Contact' },
  { id: 'lucide-send', name: '📤 Envoyer', component: Send, category: 'Contact' },
  { id: 'lucide-reply', name: '↩ Répondre', component: Reply, category: 'Contact' },
  { id: 'lucide-forward', name: '⤳ Transférer', component: Forward, category: 'Contact' },
  { id: 'lucide-at-sign', name: '@ Mention', component: AtSign, category: 'Contact' },
  
  // === ACTIONS AVEC VARIANTES ===
  { id: 'lucide-plus', name: '➕ Ajouter', component: PlusIcon, category: 'Actions' },
  { id: 'lucide-minus', name: '➖ Retirer', component: Minus, category: 'Actions' },
  { id: 'lucide-edit', name: '✏ Éditer', component: Edit, category: 'Actions' },
  { id: 'lucide-copy', name: '📋 Copier', component: Copy, category: 'Actions' },
  { id: 'lucide-trash', name: '🗑 Supprimer', component: Trash, category: 'Actions' },
  { id: 'lucide-download', name: '⬇ Télécharger', component: Download, category: 'Actions' },
  { id: 'lucide-upload', name: '⬆ Uploader', component: Upload, category: 'Actions' },
  { id: 'lucide-search', name: '🔍 Chercher', component: Search, category: 'Actions' },
  { id: 'lucide-filter', name: '⧉ Filtrer', component: Filter, category: 'Actions' },
  { id: 'lucide-share', name: '↗ Partager', component: ShareIcon, category: 'Actions' },
  
  // === NAVIGATION ===
  { id: 'lucide-chevron-up', name: '⬆ Haut', component: ChevronUp, category: 'Navigation' },
  { id: 'lucide-chevron-down', name: '⬇ Bas', component: ChevronDown, category: 'Navigation' },
  { id: 'lucide-chevron-left', name: '◀ Gauche', component: ChevronLeft, category: 'Navigation' },
  { id: 'lucide-chevron-right', name: '▶ Droite', component: ChevronRight, category: 'Navigation' },
  { id: 'lucide-home', name: '🏠 Accueil', component: HomeIcon, category: 'Navigation' },
  { id: 'lucide-map', name: '🗺 Carte', component: Map, category: 'Navigation' },
  { id: 'lucide-compass', name: '🧭 Boussole', component: Compass, category: 'Navigation' },
  { id: 'lucide-navigation', name: '🧭 Navigation', component: Navigation, category: 'Navigation' },
  
  // === UTILISATEURS ===
  { id: 'lucide-user', name: '👤 Utilisateur', component: User, category: 'Utilisateurs' },
  { id: 'lucide-users', name: '👥 Groupe', component: Users, category: 'Utilisateurs' },
  { id: 'lucide-lock', name: '🔒 Verrouillé', component: Lock, category: 'Utilisateurs' },
  { id: 'lucide-unlock', name: '🔓 Déverrouillé', component: Unlock, category: 'Utilisateurs' },
  { id: 'lucide-eye', name: '👁 Visible', component: Eye, category: 'Utilisateurs' },
  { id: 'lucide-eye-off', name: '👁‍🗨 Masqué', component: EyeOff, category: 'Utilisateurs' },
  
  // === TEMPS & DATE ===
  { id: 'lucide-clock', name: '🕐 Heure', component: Clock, category: 'Temps' },
  { id: 'lucide-calendar', name: '📅 Calendrier', component: Calendar, category: 'Temps' },
  
  // === FICHIERS & DOSSIERS ===
  { id: 'lucide-file', name: '📄 Fichier', component: File, category: 'Fichiers' },
  { id: 'lucide-file-text', name: '📃 Texte', component: FileText, category: 'Fichiers' },
  { id: 'lucide-folder', name: '📁 Dossier', component: Folder, category: 'Fichiers' },
  { id: 'lucide-folder-open', name: '📂 Ouvert', component: FolderOpen, category: 'Fichiers' },
  { id: 'lucide-archive', name: '📦 Archive', component: Archive, category: 'Fichiers' },
  
  // === MÉDIA ===
  { id: 'lucide-image', name: '🖼 Image', component: Image, category: 'Média' },
  { id: 'lucide-music', name: '🎵 Musique', component: Music, category: 'Média' },
  { id: 'lucide-volume', name: '🔊 Son', component: Volume2, category: 'Média' },
  { id: 'lucide-mic', name: '🎤 Micro', component: Mic, category: 'Média' },
  
  // === PARAMÈTRES & OUTILS ===
  { id: 'lucide-settings', name: '⚙ Paramètres', component: Settings, category: 'Outils' },
  { id: 'lucide-settings2', name: '⚙ Réglages', component: Settings2, category: 'Outils' },
  { id: 'lucide-sliders', name: '≡ Curseurs', component: Sliders, category: 'Outils' },
  { id: 'lucide-more-vertical', name: '⋮ Plus (V)', component: MoreVertical, category: 'Outils' },
  { id: 'lucide-more-horizontal', name: '⋯ Plus (H)', component: MoreHorizontal, category: 'Outils' },
  
  // === FAVORIS & ÉVALUATIONS ===
  { id: 'lucide-heart', name: '❤ J\'aime', component: Heart, category: 'Évaluation' },
  { id: 'lucide-star', name: '⭐ Favori', component: Star, category: 'Évaluation' },
  { id: 'lucide-flag', name: '🚩 Signaler', component: Flag, category: 'Évaluation' },
  { id: 'lucide-trophy', name: '🏆 Trophée', component: Trophy, category: 'Évaluation' },
  { id: 'lucide-award', name: '🎖 Récompense', component: Award, category: 'Évaluation' },
  
  // === LIENS & RÉSEAU ===
  { id: 'lucide-link', name: '🔗 Lien', component: Link, category: 'Réseau' },
  { id: 'lucide-globe', name: '🌐 Monde', component: Globe, category: 'Réseau' },
  { id: 'lucide-map-pin', name: '📍 Localisation', component: MapPin, category: 'Réseau' },
  { id: 'lucide-waypoints', name: '◆ Points', component: Waypoints, category: 'Réseau' },
  
  // === DIVERS ===
  { id: 'lucide-zap', name: '⚡ Électrique', component: ZapIcon, category: 'Divers' },
  { id: 'lucide-lightbulb', name: '💡 Idée', component: Lightbulb, category: 'Divers' },
  { id: 'lucide-target', name: '🎯 Cible', component: Target, category: 'Divers' },
  { id: 'lucide-package', name: '📦 Paquet', component: Package, category: 'Divers' },
  { id: 'lucide-gift', name: '🎁 Cadeau', component: Gift, category: 'Divers' },
  { id: 'lucide-help-circle', name: '❓ Aide', component: HelpCircle, category: 'Divers' },
];

// Intégration des icônes Font Awesome 6
const emotionIconsWithComponent = EMOTION_ICONS.map(icon => ({
  ...icon,
  component: FA[icon.id.split('-')[1]]
}));

const communicationIconsWithComponent = COMMUNICATION_ICONS.map(icon => ({
  ...icon,
  component: FA[icon.id.split('-')[1]]
}));

const medicalIconsWithComponent = MEDICAL_ICONS.map(icon => ({
  ...icon,
  component: FA[icon.id.split('-')[1]]
}));

const transportIconsWithComponent = TRANSPORT_ICONS.map(icon => ({
  ...icon,
  component: FA[icon.id.split('-')[1]]
}));

const commerceIconsWithComponent = COMMERCE_ICONS.map(icon => ({
  ...icon,
  component: FA[icon.id.split('-')[1]]
}));

const educationIconsWithComponent = EDUCATION_ICONS.map(icon => ({
  ...icon,
  component: FA[icon.id.split('-')[1]]
}));

// Array combiné de toutes les icônes disponibles
const ALL_ICONS = [
  ...LUCIDE_ICONS,
  ...emotionIconsWithComponent,
  ...communicationIconsWithComponent,
  ...medicalIconsWithComponent,
  ...transportIconsWithComponent,
  ...commerceIconsWithComponent,
  ...educationIconsWithComponent
];

const QuestionnaireCreation = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // État du formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [questions, setQuestions] = useState([]);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [expandedImageChoices, setExpandedImageChoices] = useState({}); // Track which choices are showing image picker
  const [expandedQuestionImage, setExpandedQuestionImage] = useState(null); // Track which question is showing image picker for its image
  const [imagePickerTab, setImagePickerTab] = useState({}); // Track which tab is active for each choice picker ('images' or 'icons')
  const [selectedIcons, setSelectedIcons] = useState({}); // Map of choiceId -> { library, name, displayName, component }

  // Charger les images et catégories disponibles
  useEffect(() => {
    loadImages();
    loadCategories();
  }, []);

  const loadImages = async () => {
    try {
      // Charger uniquement les images de catégorie 'QCM', avec fallback à toutes les images
      let { data, error } = await supabase
        .from('app_images')
        .select('id, name, file_path, description, category')
        .eq('category', 'QCM')
        .order('name');

      if (error) throw error;
      
      // If no QCM images found, load all images as fallback
      if (!data || data.length === 0) {
        console.warn('⚠️ Aucune image avec category="QCM". Chargement de TOUTES les images...');
        const { data: allImages, error: allError } = await supabase
          .from('app_images')
          .select('id, name, file_path, description, category')
          .order('name');

        if (allError) throw allError;
        data = allImages;
      }
      
      // Ajouter la publicUrl pour chaque image
      const imagesWithUrls = (data || []).map(img => {
        const publicUrl = getImageUrl(img.file_path);
        console.log(`📸 Image: ${img.name}, file_path: "${img.file_path}", publicUrl: ${publicUrl ? '✅ Generated' : '❌ NULL'}`);
        return {
          ...img,
          publicUrl: publicUrl
        };
      });
      
      console.log(`📊 QuestionnaireCreation: Chargé ${imagesWithUrls.length} images, ${imagesWithUrls.filter(i => i.publicUrl).length} avec URL valide`);
      setImages(imagesWithUrls);
    } catch (error) {
      console.error('Erreur chargement images QCM:', error);
      // Continuer même si aucune image disponible
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('category')
        .neq('category', null);

      if (error) throw error;
      
      // Extraire les catégories uniques
      const uniqueCategories = [...new Set(data?.map(t => t.category) || [])];
      setCategories(uniqueCategories.filter(Boolean).sort());
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  // Ajouter une question
  const handleAddQuestion = () => {
    const newQuestion = {
      id: uuidv4(),
      text: '',
      helpText: '',
      questionType: 'mixed', // Only mixed mode: images OU icons OU text
      imageId: null, // Question image (optional)
      imageName: '', // Question image name
      choices: Array(3).fill(null).map(() => ({ 
        id: uuidv4(), 
        imageId: null, 
        imageName: '', 
        text: '', 
        icon: null,
        isCorrect: false 
      }))
    };
    setQuestions([...questions, newQuestion]);
  };

  // Supprimer une question
  const handleDeleteQuestion = (questionId) => {
    setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== questionId));
  };

  // Mettre à jour le texte de la question
  const handleUpdateQuestionText = (questionId, field, value) => {
    setQuestions(prevQuestions => prevQuestions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  // Ajouter une réponse supplémentaire
  const handleAddChoice = (questionId) => {
    setQuestions(prevQuestions => prevQuestions.map(q => {
      if (q.id !== questionId) return q;
      if (q.choices.length >= 6) return q;
      return {
        ...q,
        choices: [...q.choices, { id: uuidv4(), imageId: null, imageName: '', text: '', icon: null, isCorrect: false }]
      };
    }));
  };

  // Supprimer une réponse
  const handleDeleteChoice = (questionId, choiceId) => {
    setQuestions(prevQuestions => prevQuestions.map(q => {
      if (q.id !== questionId) return q;
      if (q.choices.length <= 2) return q;
      return {
        ...q,
        choices: q.choices.filter(c => c.id !== choiceId)
      };
    }));
  };

  // Mettre à jour un champ d'une réponse (text, imageId, imageName, etc.)
  const handleUpdateChoiceText = (questionId, choiceId, field, value) => {
    setQuestions(prevQuestions => prevQuestions.map(q => {
      if (q.id !== questionId) return q;
      return {
        ...q,
        choices: q.choices.map(c =>
          c.id === choiceId ? { ...c, [field]: value } : c
        )
      };
    }));
  };

  // Marquer/Demarquer la réponse correcte (plusieurs possibles)
  const handleToggleCorrect = (questionId, choiceId) => {
    setQuestions(prevQuestions => prevQuestions.map(q => {
      if (q.id !== questionId) return q;
      return {
        ...q,
        choices: q.choices.map(c =>
          c.id === choiceId ? { ...c, isCorrect: !c.isCorrect } : c
        )
      };
    }));
  };

  // Mettre à jour l'icône sélectionnée pour une réponse
  const handleUpdateChoiceIcon = (choiceId, icon) => {
    setSelectedIcons(prev => ({
      ...prev,
      [choiceId]: icon
    }));
  };

  // Supprimer l'icône sélectionnée pour une réponse
  const handleRemoveChoiceIcon = (choiceId) => {
    setSelectedIcons(prev => {
      const newIcons = { ...prev };
      delete newIcons[choiceId];
      return newIcons;
    });
  };

  // Sélectionner l'image pour la question (mixed mode)
  const handleSelectImageForQuestion = (questionId, imageId, imageName) => {
    setQuestions(prevQuestions => prevQuestions.map(q =>
      q.id === questionId ? { ...q, imageId, imageName } : q
    ));
  };

  // Toggle image picker visibility for a question
  const toggleQuestionImagePicker = (questionId) => {
    setExpandedQuestionImage(prev => prev === questionId ? null : questionId);
  };

  // Valider le formulaire
  const validateForm = (questionsToValidate = questions) => {
    const errors = [];
    if (!title.trim()) errors.push('Le titre est requis');
    if (!category) errors.push('La catégorie est requise');
    if (questionsToValidate.length === 0) errors.push('Au moins une question est requise');
    
    questionsToValidate.forEach((q, idx) => {
      if (!q.text.trim()) errors.push(`Question ${idx + 1}: le texte de la question est requis`);
      
      // Mixed mode only: each response must have image OR text
      const choicesWithAtLeastOne = q.choices.filter(c => c.imageId || c.text.trim());
      if (choicesWithAtLeastOne.length === 0) {
        errors.push(`Question ${idx + 1}: chaque réponse doit avoir au moins une image OU un label texte`);
      } else {
        const correctAnswers = choicesWithAtLeastOne.filter(c => c.isCorrect);
        if (correctAnswers.length === 0) {
          errors.push(`Question ${idx + 1}: au moins une réponse doit être marquée correcte`);
        }
      }
    });

    return errors;
  };

  // Sauvegarder en tant que brouillon
  const handleSaveDraft = () => {
    const draft = {
      id: uuidv4(),
      type: 'questionnaire',
      title,
      description,
      category,
      questions
    };
    
    const drafts = JSON.parse(localStorage.getItem('questionnaireDrafts') || '[]');
    const existingIndex = drafts.findIndex(d => d.id === draft.id);
    
    if (existingIndex >= 0) {
      drafts[existingIndex] = draft;
    } else {
      drafts.push(draft);
    }
    
    localStorage.setItem('questionnaireDrafts', JSON.stringify(drafts));
    setDraftSaved(true);
    
    toast({
      title: 'Brouillon sauvegardé',
      description: 'Votre questionnaire a été sauvegardé localement'
    });
    
    setTimeout(() => setDraftSaved(false), 3000);
  };

  // Soumettre le questionnaire
  const handleSubmit = async () => {
    // Validation stricte du questionnaire
    try {
      validateQuestionnaire({
        title: title.trim(),
        description: description.trim(),
        questions: questions.map(q => ({
          question_text: q.text,
          question_type: q.questionType,
          choices: q.choices,
          is_correct: q.choices.some(c => c.isCorrect)
        }))
      });
    } catch (validationError) {
      toast({
        title: 'Erreurs de validation',
        description: validationError.message,
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Erreur',
          description: 'Utilisateur non authentifié',
          variant: 'destructive'
        });
        return;
      }

      // Créer la tâche questionnaire
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert([{
          title,
          description: description.trim() || null,
          category,
          owner_id: user.id,
          task_type: 'questionnaire'  // Distinguer des exercices normaux
        }])
        .select()
        .single();

      if (taskError) throw taskError;

      console.log('Task créée:', task.id);

      // Insérer les questions dans la table questionnaire_questions
      const questionsDataForDB = questions.map((q, idx) => {
        // All questions are now mixed mode
        return {
          task_id: task.id,
          instruction: q.text,
          question_order: idx + 1,
          question_type: 'mixed',
          image_id: q.imageId || null,
          image_name: q.imageName || ''
        };
      });

      const { data: insertedQuestions, error: questionsError } = await supabase
        .from('questionnaire_questions')
        .insert(questionsDataForDB)
        .select();

      if (questionsError) {
        console.error('Erreur création questions:', questionsError);
        throw questionsError;
      }

      console.log('Questions créées:', insertedQuestions.length);

      // Insérer les réponses (choices) pour chaque question
      const allChoices = [];
      
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const insertedQuestion = insertedQuestions[i];

        // All questions now use mixed mode: keep choices with IMAGE OR TEXT
        const filledChoices = q.choices.filter(c => c.imageId || c.text.trim());

        // Créer les enregistrements de choix
        const choicesForQuestion = filledChoices.map((choice, choiceIdx) => {
          // Vérifier si c'est une icône (commence par fa-, md-, bs-, etc.) ou une vraie image UUID
          const isIcon = typeof choice.imageId === 'string' && (
            choice.imageId.startsWith('fa6-') || // Correction pour Font Awesome 6
            choice.imageId.startsWith('fa-') || 
            choice.imageId.startsWith('lucide-') ||
            choice.imageId.startsWith('bs-') || 
            choice.imageId.startsWith('md-') || 
            choice.imageId.startsWith('fi-') || 
            choice.imageId.startsWith('hi2-') || 
            choice.imageId.startsWith('ai-')
          );
          
          return {
            question_id: insertedQuestion.id,
            text: (choice.text && choice.text.trim()) || '',
            choice_order: choiceIdx + 1,
            is_correct: choice.isCorrect,
            // Si c'est une icône, image_id est null et image_name contient l'ID de l'icône.
            // Sinon, c'est une image de la BDD, on utilise son UUID.
            image_id: isIcon ? null : (choice.imageId || null),
            image_name: isIcon ? choice.imageId : (choice.imageName || '')
          };
        });

        allChoices.push(...choicesForQuestion);
      }

      if (allChoices.length > 0) {
        const { error: choicesError } = await supabase
          .from('questionnaire_choices')
          .insert(allChoices);

        if (choicesError) {
          console.error('Erreur création réponses:', choicesError);
          throw choicesError;
        }

        console.log('Réponses créées:', allChoices.length);
      }

      toast({
        title: 'Succès!',
        description: 'Votre questionnaire a été créé et soumis pour validation'
      });

      navigate('/contributeur');  // Redirect to contributor dashboard instead of exercises list
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Créer un Questionnaire</h1>
          <p className="text-gray-600 mt-2">
            Créez un exercice d'apprentissage basé sur la sélection d'images
          </p>
        </div>

        {/* Informations générales */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du questionnaire *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Identifier les paramètres Wi-Fi"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez l'objectif de ce questionnaire (optionnel)..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Questions ({questions.length})</h2>
            <Button onClick={handleAddQuestion} className="gap-2">
              <Plus className="w-4 h-4" />
              Ajouter une question
            </Button>
          </div>

          {questions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                <HelpCircle className="w-12 h-12 mb-4 text-gray-300" />
                <p>Aucune question ajoutée</p>
                <p className="text-sm">Cliquez sur "Ajouter une question" pour commencer</p>
              </CardContent>
            </Card>
          ) : (
            questions.map((question, qIdx) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Question {qIdx + 1}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Texte de la question */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texte de la question *
                    </label>
                    <input
                      type="text"
                      value={question.text}
                      onChange={(e) => handleUpdateQuestionText(question.id, 'text', e.target.value)}
                      placeholder="Ex: Quelle capture montre le menu des paramètres Wi-Fi?"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Texte d'aide */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texte d'aide (optionnel)
                    </label>
                    <input
                      type="text"
                      value={question.helpText}
                      onChange={(e) => handleUpdateQuestionText(question.id, 'helpText', e.target.value)}
                      placeholder="Ex: Cherchez l'engrenage et Wi-Fi"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>



                  {/* RÉPONSES UNIFIÉES: Support 6 slots pour tous les types */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Réponses possibles (2-6 propositions) *
                    </label>





                    {/* Pour mixed: Image + Text labels */}
                    {question.questionType === 'mixed' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-900">
                            💡 <strong>Mode Mixte:</strong> La question peut avoir une image optionnelle. Chaque réponse doit avoir une image OU un label texte (ou les deux).
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Image de la question (optionnelle)
                          </label>
                          {question.imageId ? (
                            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">{question.imageName}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleQuestionImagePicker(question.id)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                Changer
                              </Button>
                            </div>
                          ) : null}
                          
                          {!question.imageId || expandedQuestionImage === question.id ? (
                            <div className="max-h-60 overflow-y-auto border rounded-lg bg-gray-50">
                              <div className="grid grid-cols-3 gap-2 p-2">
                                {images.map(img => (
                                  <button
                                    key={img.id}
                                    disabled={!img || !img.id}
                                    onClick={() => {
                                      if (img && img.id) {
                                        console.log(`✅ Image de question sélectionnée: ${img.name} (ID: ${img.id})`);
                                        handleUpdateQuestionText(question.id, 'imageId', img.id);
                                        handleUpdateQuestionText(question.id, 'imageName', img.name || img.id);
                                        toggleQuestionImagePicker(question.id); // Close picker after selection
                                      } else {
                                        console.error('❌ Image invalide - pas d\'ID:', img);
                                      }
                                    }}
                                    className="p-2 text-center rounded hover:bg-blue-100 border border-gray-200 hover:border-blue-400 transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <img 
                                      src={img.publicUrl} 
                                      alt={img.name}
                                      className="w-full h-20 object-contain bg-gray-100 rounded mb-1"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                    <p className="text-xs text-gray-700 line-clamp-2">{img.name}</p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Réponses (image ou label) *
                          </label>
                          <div className="space-y-3">
                            {question.choices.map((choice, cIdx) => (
                              <div key={choice.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-medium text-gray-700">
                                    Réponse {cIdx + 1}
                                  </span>
                                  <div className="flex gap-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={choice.isCorrect}
                                        onChange={() => handleToggleCorrect(question.id, choice.id)}
                                        className="w-4 h-4 rounded"
                                      />
                                      <span className="text-xs text-gray-600">Correcte</span>
                                    </label>
                                    {question.choices.length > 2 && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteChoice(question.id, choice.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="mb-3">
                                  <label className="block text-xs font-medium text-gray-600 mb-2">
                                    Réponse (sélectionnez texte OU image OU icône):
                                  </label>
                                  {choice.imageName ? (
                                    <div className="mb-2 p-2 bg-blue-50 rounded border border-blue-200 flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        {choice.imageId?.startsWith('fa-') || choice.imageId?.startsWith('bs-') || choice.imageId?.startsWith('md-') || choice.imageId?.startsWith('fi-') || choice.imageId?.startsWith('hi2-') || choice.imageId?.startsWith('ai-') ? (
                                          (() => {
                                            const icon = ALL_ICONS.find(i => i.id === choice.imageId);
                                            if (icon) {
                                              let IconComponent = icon.component;
                                              
                                              if (!IconComponent && choice.imageId.startsWith('fa-')) {
                                                const iconName = choice.imageId.split('-')[1];
                                                IconComponent = FA[iconName];
                                              }
                                              
                                              if (IconComponent) {
                                                return <IconComponent className="w-4 h-4 text-blue-600" />;
                                              }
                                            }
                                            return <ImageIcon className="w-4 h-4 text-blue-600" />;
                                          })()
                                        ) : (
                                          <img 
                                            src={images.find(img => img.id === choice.imageId)?.publicUrl} 
                                            alt={choice.imageName}
                                            className="w-6 h-6 object-contain rounded"
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                            }}
                                          />
                                        )}
                                        <span className="text-xs text-blue-900">{choice.imageName}</span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          handleUpdateChoiceText(question.id, choice.id, 'imageId', null);
                                          handleUpdateChoiceText(question.id, choice.id, 'imageName', '');
                                        }}
                                        className="text-blue-600 hover:text-blue-700 p-0 h-6"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ) : null}
                                  
                                  {/* Sélecteur d'images du système */}
                                  <div className="mb-3 p-2 border rounded-lg bg-gray-50">
                                    <label className="block text-xs font-medium text-gray-600 mb-2">
                                      📸 Images système:
                                    </label>
                                    <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                                      {images.map(img => (
                                        <button
                                          key={img.id}
                                          onClick={() => {
                                            handleUpdateChoiceText(question.id, choice.id, 'imageId', img.id);
                                            handleUpdateChoiceText(question.id, choice.id, 'imageName', img.name);
                                          }}
                                          className="p-1 rounded border border-gray-300 hover:border-blue-400 hover:bg-blue-100 transition-colors bg-white flex flex-col items-center gap-1"
                                          title={img.name}
                                        >
                                          <img 
                                            src={img.publicUrl} 
                                            alt={img.name}
                                            className="w-8 h-8 object-contain rounded"
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                            }}
                                          />
                                          <p className="text-xs text-gray-600 line-clamp-1">{img.name}</p>
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Sélecteur d'icônes */}
                                  <div className="mb-3">
                                    <label className="block text-xs font-medium text-gray-600 mb-2">
                                      ⭐ Icônes:
                                    </label>
                                    <IconSelector
                                      selectedIcon={choice.imageId?.startsWith('fa-') || choice.imageId?.startsWith('bs-') || choice.imageId?.startsWith('md-') || choice.imageId?.startsWith('fi-') || choice.imageId?.startsWith('hi2-') || choice.imageId?.startsWith('ai-') ? {
                                        id: choice.imageId,
                                        name: choice.imageName,
                                        displayName: choice.imageName
                                      } : null}
                                      onSelect={(icon) => {
                                        handleUpdateChoiceText(question.id, choice.id, 'imageId', icon.id);
                                        handleUpdateChoiceText(question.id, choice.id, 'imageName', icon.displayName || icon.name);
                                      }}
                                      onRemove={() => {
                                        handleUpdateChoiceText(question.id, choice.id, 'imageId', null);
                                        handleUpdateChoiceText(question.id, choice.id, 'imageName', '');
                                      }}
                                      libraries={['fa6', 'bs', 'md', 'fi', 'hi2', 'ai']}
                                      showSearch={true}
                                      showLibraryTabs={true}
                                    />
                                  </div>
                                </div>

                                <label className="block text-xs font-medium text-gray-600 mb-2">
                                  📝 Texte (optionnel):
                                </label>
                                <input
                                  type="text"
                                  value={choice.text}
                                  onChange={(e) => handleUpdateChoiceText(question.id, choice.id, 'text', e.target.value)}
                                  placeholder="Ex: Mode poche, Notifications..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                              </div>
                            ))}
                            {question.choices.length < 6 && (
                              <Button
                                onClick={() => handleAddChoice(question.id)}
                                variant="outline"
                                className="w-full gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                Ajouter une réponse
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={handleSaveDraft}
            variant="outline"
            className="flex-1"
          >
            {draftSaved ? '✓ Brouillon sauvegardé' : 'Sauvegarder comme brouillon'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Création en cours...' : 'Créer et soumettre'}
          </Button>
          <Button
            onClick={() => navigate('/contributeur')}
            variant="outline"
            className="flex-1"
          >
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireCreation;
