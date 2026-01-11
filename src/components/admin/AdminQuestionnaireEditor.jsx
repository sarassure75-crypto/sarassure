import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Save, Trash2, XCircle, Plus, HelpCircle, Image as ImageIcon, X,
  // Lucide icons for QCM responses
  CheckCircle, AlertCircle, Info, Home, Settings, User, Users, Lock, Unlock, Eye, EyeOff,
  Download, Upload, Trash, Edit, Copy, Share2, Heart, Star, Flag, MessageSquare,
  Clock, Calendar, MapPin, Phone, Mail, Link, Globe, Zap,
  // Contact icons
  PhoneCall, PhoneOff, PhoneMissed, Smartphone, MessageCircle,
  // Actions with variants
  Check, PlusIcon, Minus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  // More utilities
  Search, Filter, Sliders, Settings2, MoreVertical, MoreHorizontal,
  // Status indicators
  Circle, CheckCircle2, AlertTriangle, ActivitySquare,
  // Navigation
  Navigation, Compass, Map, Waypoints,
  // Communication
  Send, Reply, Forward, Share,
  // File & Document
  FileText, File, Folder, FolderOpen, Archive,
  // Media
  Image, ImageOff, Music, Volume2, Volume, Mic, Mic2,
  // Misc
  Package, Gift, Lightbulb, Target, Trophy, Award, ZapOff
} from 'lucide-react';
import * as FA from 'react-icons/fa6';
import { useAdmin } from '@/contexts/AdminContext';
import { creationStatuses } from '@/data/tasks';
import { useToast } from '@/components/ui/use-toast';
import { supabase, getImageUrl } from '@/lib/supabaseClient';
import { EMOTION_ICONS, COMMUNICATION_ICONS, MEDICAL_ICONS, TRANSPORT_ICONS, COMMERCE_ICONS, EDUCATION_ICONS } from '@/lib/iconConfigs';

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
  { id: 'lucide-share', name: '↗ Partager', component: Share, category: 'Actions' },
  
  // === NAVIGATION ===
  { id: 'lucide-chevron-up', name: '⬆ Haut', component: ChevronUp, category: 'Navigation' },
  { id: 'lucide-chevron-down', name: '⬇ Bas', component: ChevronDown, category: 'Navigation' },
  { id: 'lucide-chevron-left', name: '◀ Gauche', component: ChevronLeft, category: 'Navigation' },
  { id: 'lucide-chevron-right', name: '▶ Droite', component: ChevronRight, category: 'Navigation' },
  { id: 'lucide-home', name: '🏠 Accueil', component: Home, category: 'Navigation' },
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
  
  // === DIVERS ===
  { id: 'lucide-zap', name: '⚡ Électrique', component: Zap, category: 'Divers' },
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
})).filter(icon => icon.component);

const communicationIconsWithComponent = COMMUNICATION_ICONS.map(icon => ({
  ...icon,
  component: FA[icon.id.split('-')[1]]
})).filter(icon => icon.component);

const medicalIconsWithComponent = MEDICAL_ICONS.map(icon => ({
  ...icon,
  component: FA[icon.id.split('-')[1]]
})).filter(icon => icon.component);

const transportIconsWithComponent = TRANSPORT_ICONS.map(icon => ({
  ...icon,
  component: FA[icon.id.split('-')[1]]
})).filter(icon => icon.component);

const commerceIconsWithComponent = COMMERCE_ICONS.map(icon => ({
  ...icon,
  component: FA[icon.id.split('-')[1]]
})).filter(icon => icon.component);

const educationIconsWithComponent = EDUCATION_ICONS.map(icon => ({
  ...icon,
  component: FA[icon.id.split('-')[1]]
})).filter(icon => icon.component);

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

/**
 * AdminQuestionnaireEditor
 * Éditeur spécifique pour les questionnaires (QCM) dans l'interface admin
 * Permet de modifier le titre, description, catégorie et les questions du QCM
 */
const AdminQuestionnaireEditor = ({ task: initialTask, onSave, onCancel, onDelete }) => {
  const [task, setTask] = useState(initialTask);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [images, setImages] = useState([]);
  const [expandedImageChoices, setExpandedImageChoices] = useState({});
  const [expandedQuestionImage, setExpandedQuestionImage] = useState(null);
  const [imagePickerTab, setImagePickerTab] = useState({}); // Pour les onglets Images/Icônes
  const { categories, isLoading } = useAdmin();
  const { toast } = useToast();

  useEffect(() => {
    console.log('=== DEBUG AdminQuestionnaireEditor: initialTask reçu ===', initialTask);
    setTask(initialTask);
    
    // Charger les questions directement depuis la table questionnaire_questions
    if (initialTask?.id) {
      loadQuestionsFromDatabase(initialTask.id);
    } else {
      setQuestions([]);
    }
  }, [initialTask]);

  const loadQuestionsFromDatabase = async (taskId) => {
    try {
      console.log('=== DEBUG: Chargement questions depuis la base de données ===');
      
      // D'abord, essayer de récupérer les questions de la nouvelle table questionnaire_questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questionnaire_questions')
        .select('*')
        .eq('task_id', taskId)
        .order('question_order');

      if (questionsError) {
        console.error('Erreur chargement questions (nouvelle table):', questionsError);
        // Continuer avec le fallback sur les versions/steps
      }

      console.log('Questions chargées (nouvelle table):', questionsData);

      // Si on a trouvé des questions dans la nouvelle table
      if (questionsData && questionsData.length > 0) {
        // Récupérer les réponses pour chaque question
        const questionIds = questionsData.map(q => q.id);
        const { data: choicesData, error: choicesError } = await supabase
          .from('questionnaire_choices')
          .select('*')
          .in('question_id', questionIds)
          .order('choice_order');

        if (choicesError) {
          console.error('Erreur chargement réponses:', choicesError);
        }

        console.log('Réponses chargées:', choicesData);

        // Combiner les données
        const loadedQuestions = questionsData.map(q => {
          const questionChoices = (choicesData || []).filter(c => c.question_id === q.id);
          return {
            id: q.id,
            order: q.question_order,
            instruction: q.instruction,
            questionType: q.question_type,
            imageId: q.image_id,
            imageName: q.image_name,
            choices: questionChoices.map(c => ({
              id: c.id,
              text: c.text,
              imageId: c.image_id,
              imageName: c.image_name
            })),
            correctAnswers: questionChoices.filter(c => c.is_correct).map(c => c.id)
          };
        });

        console.log('=== DEBUG: Questions finales chargées (nouvelle table) ===', loadedQuestions);
        setQuestions(loadedQuestions);
        return;
      }

      // FALLBACK: Si aucune question dans la nouvelle table, essayer les versions/steps (ancien système)
      console.log('Aucune question dans la nouvelle table, essai du système versions/steps...');
      
      // Récupérer les versions du task
      const { data: versionsData, error: versionsError } = await supabase
        .from('versions')
        .select('id, steps(*)')
        .eq('task_id', taskId)
        .order('created_at');

      if (versionsError) {
        console.error('Erreur chargement versions:', versionsError);
        setQuestions([]);
        return;
      }

      console.log('Versions chargées (fallback):', versionsData);

      if (!versionsData || versionsData.length === 0) {
        console.log('Aucune version trouvée non plus');
        setQuestions([]);
        return;
      }

      // Utiliser la première version
      const firstVersion = versionsData[0];
      if (!firstVersion.steps || firstVersion.steps.length === 0) {
        console.log('La première version n\'a pas de steps');
        setQuestions([]);
        return;
      }

      // Convertir les steps en questions
      const loadedQuestions = firstVersion.steps.map(step => {
        const expectedInput = step.expected_input || {};
        return {
          id: step.id,
          order: step.step_order,
          instruction: step.instruction,
          questionType: expectedInput.questionType || 'image_choice',
          imageId: expectedInput.imageId,
          imageName: expectedInput.imageName,
          choices: (expectedInput.choices || []).map(c => ({
            id: c.id || `choice-${Date.now()}-${Math.random()}`,
            text: c.text,
            imageId: c.imageId,
            imageName: c.imageName
          })),
          correctAnswers: expectedInput.correctAnswers || []
        };
      });

      console.log('=== DEBUG: Questions finales chargées (fallback versions/steps) ===', loadedQuestions);
      setQuestions(loadedQuestions);
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error);
      setQuestions([]);
    }
  };

  useEffect(() => {
    loadQCMImages();
  }, []);

  const loadQCMImages = async () => {
    try {
      console.log('=== DEBUG: Démarrage loadQCMImages ===');
      // Try to load QCM-specific images first, then fallback to all images if none found
      let { data, error } = await supabase
        .from('app_images')
        .select('*')
        .eq('category', 'QCM')
        .order('name');

      console.log('=== DEBUG: Réponse Supabase (QCM category) ===', { data, error });
      
      if (error) throw error;
      
      // If no QCM images found, load all images as fallback
      if (!data || data.length === 0) {
        console.warn('⚠️ Aucune image avec category="QCM" trouvée. Chargement de TOUTES les images...');
        const { data: allImages, error: allError } = await supabase
          .from('app_images')
          .select('*')
          .order('name');
        
        if (allError) throw allError;
        data = allImages;
        console.log('=== DEBUG: Toutes les images chargées (fallback) ===', data);
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
      
      console.log('=== DEBUG: Images QCM chargées ===', imagesWithUrls);
      console.log(`📊 Total images: ${imagesWithUrls.length}, avec URL valide: ${imagesWithUrls.filter(i => i.publicUrl).length}`);
      setImages(imagesWithUrls);
      
      if (!imagesWithUrls || imagesWithUrls.length === 0) {
        console.warn('⚠️ ATTENTION: Aucune image trouvée en BD!');
      }
    } catch (error) {
      console.error('❌ Erreur chargement images QCM:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setTask(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (categoryId) => {
    const selectedCat = categories.find(c => c.id.toString() === categoryId);
    setTask(prev => ({ 
      ...prev, 
      category_id: categoryId,
      category: selectedCat ? selectedCat.name : null
    }));
  };

  const addQuestion = () => {
    const newQuestion = {
      id: `temp-${Date.now()}`,
      order: questions.length + 1,
      instruction: '',
      questionType: 'image_choice',
      imageId: null,
      imageName: null,
      choices: [],
      correctAnswers: []
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (questionId) => {
    setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== questionId));
  };

  const updateQuestion = (questionId, field, value) => {
    setQuestions(prevQuestions => prevQuestions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  const addChoice = (questionId) => {
    setQuestions(prevQuestions => prevQuestions.map(q => {
      if (q.id === questionId) {
        const newChoice = {
          id: `choice-${Date.now()}`,
          text: '',
          imageId: null,
          imageName: null
        };
        return { ...q, choices: [...q.choices, newChoice] };
      }
      return q;
    }));
  };

  const removeChoice = (questionId, choiceId) => {
    setQuestions(prevQuestions => prevQuestions.map(q => {
      if (q.id === questionId) {
        return { 
          ...q, 
          choices: q.choices.filter(c => c.id !== choiceId),
          correctAnswers: q.correctAnswers.filter(ca => ca !== choiceId)
        };
      }
      return q;
    }));
  };

  const updateChoice = (questionId, choiceId, field, value) => {
    setQuestions(prevQuestions => prevQuestions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          choices: q.choices.map(c => 
            c.id === choiceId ? { ...c, [field]: value } : c
          )
        };
      }
      return q;
    }));
  };

  const toggleCorrectAnswer = (questionId, choiceId) => {
    setQuestions(prevQuestions => prevQuestions.map(q => {
      if (q.id === questionId) {
        const isCorrect = q.correctAnswers.includes(choiceId);
        return {
          ...q,
          correctAnswers: isCorrect
            ? q.correctAnswers.filter(ca => ca !== choiceId)
            : [...q.correctAnswers, choiceId]
        };
      }
      return q;
    }));
  };

  // Toggle image picker visibility for a choice
  const toggleImagePicker = (choiceId) => {
    setExpandedImageChoices(prev => ({
      ...prev,
      [choiceId]: !prev[choiceId]
    }));
  };

  // Toggle image picker visibility for a question
  const toggleQuestionImagePicker = (questionId) => {
    setExpandedQuestionImage(prev => prev === questionId ? null : questionId);
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!task.title?.trim()) {
        toast({ title: 'Erreur', description: 'Le titre est obligatoire', variant: 'destructive' });
        return;
      }

      if (questions.length === 0) {
        toast({ title: 'Erreur', description: 'Ajoutez au moins une question', variant: 'destructive' });
        return;
      }

      // Vérifier que chaque question a au moins une bonne réponse
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        
        if (!q.instruction?.trim()) {
          toast({ title: 'Erreur', description: `Question ${i + 1}: L'énoncé est obligatoire`, variant: 'destructive' });
          return;
        }
        
        if (q.choices.length === 0) {
          toast({ title: 'Erreur', description: `Question "${q.instruction}": Ajoutez au moins une réponse`, variant: 'destructive' });
          return;
        }

        // Vérifier que chaque réponse a un texte
        const choicesWithText = q.choices.filter(c => c.text?.trim());
        if (choicesWithText.length !== q.choices.length) {
          toast({ title: 'Erreur', description: `Question "${q.instruction}": Toutes les réponses doivent avoir un texte`, variant: 'destructive' });
          return;
        }

        if (q.correctAnswers.length === 0) {
          toast({ title: 'Erreur', description: `La question "${q.instruction}" doit avoir au moins une bonne réponse. Cochez au moins une réponse.`, variant: 'destructive' });
          return;
        }
      }

      // Log pour debug
      console.log('=== DEBUG: Questions avant sauvegarde ===');
      questions.forEach((q, i) => {
        console.log(`Question ${i + 1}: "${q.instruction}"`);
        console.log(`  Réponses: ${q.choices.length}`, q.choices);
        console.log(`  Bonnes réponses: ${q.correctAnswers.length}`, q.correctAnswers);
      });

      // Préparer les données de sauvegarde
      const taskData = {
        ...task,
        task_type: 'questionnaire',
        questions: questions // Inclure les questions pour traitement ultérieur
      };

      console.log('=== DEBUG: TaskData à sauvegarder ===', taskData);

      onSave(taskData);
    } catch (error) {
      console.error('Erreur sauvegarde QCM:', error);
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder le QCM', variant: 'destructive' });
    }
  };

  const handleDuplicate = () => {
    const duplicatedTask = {
      ...task,
      id: null, // Nouveau ID sera généré
      title: `${task.title} (Copie)`,
      isNew: true
    };
    onSave(duplicatedTask);
  };

  // Use the global getImageUrl from supabaseClient for consistent image loading
  // This uses the 'images' bucket and handles the publicUrl correctly

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-blue-600" />
            Éditer le Questionnaire (QCM)
          </CardTitle>
          <CardDescription>
            Modifiez les informations et questions de ce QCM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informations générales */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre du QCM *</Label>
              <Input
                id="title"
                name="title"
                value={task.title || ''}
                onChange={handleChange}
                placeholder="Ex: Test de connaissances sur..."
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={task.description || ''}
                onChange={handleChange}
                placeholder="Décrivez brièvement ce QCM"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select 
                  value={task.category_id?.toString() || ''} 
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Statut</Label>
                <Select 
                  value={task.creation_status || 'draft'} 
                  onValueChange={(value) => handleSelectChange('creation_status', value)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {creationStatuses.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg">Questions ({questions.length})</Label>
              <Button onClick={addQuestion} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une question
              </Button>
            </div>

            {questions.map((question, qIndex) => (
              <Card key={question.id} className="border-blue-200">
                <CardHeader className="bg-blue-50 pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base text-blue-900">
                      Question {qIndex + 1}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(question.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {/* Énoncé de la question */}
                  <div>
                    <Label>Énoncé de la question *</Label>
                    <Textarea
                      value={question.instruction}
                      onChange={(e) => updateQuestion(question.id, 'instruction', e.target.value)}
                      placeholder="Posez votre question ici..."
                      rows={2}
                    />
                  </div>

                  {/* Image de la question */}
                  <div>
                    <Label>Image de la question (optionnelle)</Label>
                    <Select
                      value={question.imageId || 'none'}
                      onValueChange={(value) => {
                        updateQuestion(question.id, 'imageId', value === 'none' ? null : value);
                        // imageName is now just for display - we'll get file_path from app_images when needed
                        const img = images.find(i => i.id === value);
                        updateQuestion(question.id, 'imageName', value === 'none' ? null : img?.name || null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Aucune image" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune image</SelectItem>
                        {images.map(img => (
                          <SelectItem key={img.id} value={img.id}>
                            {img.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {question.imageId && (
                      <div className="mt-2 p-2 bg-gray-100 rounded">
                        <img
                          src={images.find(i => i.id === question.imageId)?.publicUrl}
                          alt="Aperçu"
                          className="max-h-32 rounded border"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<p class="text-xs text-gray-500">Image non disponible</p>';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Réponses */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Réponses possibles *</Label>
                      <Button
                        onClick={() => addChoice(question.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Ajouter une réponse
                      </Button>
                    </div>

                    {question.choices.map((choice, cIndex) => (
                      <Card key={choice.id} className="border">
                        <CardContent className="pt-4 space-y-3">
                          {/* Ligne 1: Checkbox + texte + supprimer */}
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={question.correctAnswers.includes(choice.id)}
                              onChange={() => toggleCorrectAnswer(question.id, choice.id)}
                              className="h-4 w-4 accent-green-600"
                              title="Cocher si c'est une bonne réponse"
                            />
                            <div className="flex-1">
                              <Input
                                value={choice.text}
                                onChange={(e) => updateChoice(question.id, choice.id, 'text', e.target.value)}
                                placeholder={`Proposition texte ${cIndex + 1} (optionnelle)`}
                                className="text-sm"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeChoice(question.id, choice.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Image/Icône sélectionnée */}
                          {choice.imageName && (
                            <div className="p-2 bg-blue-50 rounded border border-blue-200 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {choice.imageId?.startsWith('lucide-') || choice.imageId?.startsWith('fa-') ? (
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
                                  <ImageIcon className="w-4 h-4 text-blue-600" />
                                )}
                                <span className="text-sm text-blue-900">{choice.imageName}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  updateChoice(question.id, choice.id, 'imageId', null);
                                  updateChoice(question.id, choice.id, 'imageName', '');
                                }}
                                className="text-blue-600 hover:text-blue-700 p-0 h-6"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          )}

                          {/* Sélecteur avec onglets - Afficher en permanence pour le mode mixed */}
                          <div className="border rounded bg-gray-50">
                            <div className="flex border-b">
                              <button
                                onClick={() => setImagePickerTab(prev => ({ ...prev, [choice.id]: 'images' }))}
                                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                                  (imagePickerTab[choice.id] || 'images') === 'images'
                                    ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                                    : 'border-b-2 border-gray-200 text-gray-600 hover:text-gray-900 bg-gray-50'
                                }`}
                              >
                                📸 Images
                              </button>
                              <button
                                onClick={() => setImagePickerTab(prev => ({ ...prev, [choice.id]: 'icons' }))}
                                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                                  (imagePickerTab[choice.id] || 'images') === 'icons'
                                    ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                                    : 'border-b-2 border-gray-200 text-gray-600 hover:text-gray-900 bg-gray-50'
                                }`}
                              >
                                ⭐ Icônes
                              </button>
                            </div>
                            
                            <div className="max-h-48 overflow-y-auto">
                              {/* Onglet Images */}
                              {(imagePickerTab[choice.id] || 'images') === 'images' && (
                                <div className="grid grid-cols-3 gap-2 p-2">
                                  {images.map(img => (
                                    <button
                                      key={img.id}
                                      onClick={() => {
                                        updateChoice(question.id, choice.id, 'imageId', img.id);
                                        updateChoice(question.id, choice.id, 'imageName', img.name);
                                      }}
                                      className="p-1 text-center rounded hover:bg-blue-100 border border-gray-200 hover:border-blue-400 transition-colors bg-white"
                                    >
                                      <img 
                                        src={img.publicUrl} 
                                        alt={img.name}
                                        className="w-full h-14 object-contain bg-gray-100 rounded mb-1"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                      <p className="text-xs text-gray-600 line-clamp-1">{img.name}</p>
                                    </button>
                                  ))}
                                </div>
                              )}
                              
                              {/* Onglet Icônes */}
                              {(imagePickerTab[choice.id] || 'images') === 'icons' && (
                                <div className="p-2">
                                  {(() => {
                                    const groupedIcons = {};
                                    ALL_ICONS.forEach(icon => {
                                      const cat = icon.category || 'Autre';
                                      if (!groupedIcons[cat]) groupedIcons[cat] = [];
                                      groupedIcons[cat].push(icon);
                                    });
                                    
                                    return Object.entries(groupedIcons).map(([category, icons]) => (
                                      <div key={category} className="mb-3">
                                        <h4 className="text-xs font-bold text-gray-600 uppercase mb-2 px-2">{category}</h4>
                                        <div className="grid grid-cols-4 gap-2">
                                          {icons.map(icon => {
                                            // Charger dynamiquement le composant s'il n'existe pas
                                            let IconComponent = icon.component;
                                            
                                            if (!IconComponent && icon.id.startsWith('fa-')) {
                                              const iconName = icon.id.split('-')[1];
                                              IconComponent = FA[iconName];
                                            }
                                            
                                            if (!IconComponent) {
                                              return null; // Sauter si aucun composant n'est disponible
                                            }
                                            
                                            return (
                                              <button
                                                key={icon.id}
                                                onClick={() => {
                                                  updateChoice(question.id, choice.id, 'imageId', icon.id);
                                                  updateChoice(question.id, choice.id, 'imageName', icon.name);
                                                }}
                                                className="p-2 text-center rounded hover:bg-blue-100 border border-gray-200 hover:border-blue-400 transition-colors bg-white flex flex-col items-center gap-1"
                                                title={icon.name}
                                              >
                                                <IconComponent className="w-5 h-5 text-blue-600" />
                                                <p className="text-xs text-gray-700 line-clamp-1">{icon.name}</p>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    ));
                                  })()}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {question.choices.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">
                        Aucune réponse ajoutée. Cliquez sur "Ajouter une réponse".
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {questions.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                  Aucune question ajoutée. Cliquez sur "Ajouter une question" pour commencer.
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              <XCircle className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            {!task.isNew && (
              <Button variant="secondary" onClick={handleDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Dupliquer
              </Button>
            )}
            {!task.isNew && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            )}
          </div>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer le QCM
          </Button>
        </CardFooter>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce QCM ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteConfirm(false);
                onDelete(task.id);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminQuestionnaireEditor;
