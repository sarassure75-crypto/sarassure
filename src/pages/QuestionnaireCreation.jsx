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

const isIconId = (id) => {
  if (typeof id !== 'string') return false;
  // Format lucide: lucide-check
  // Format react-icons: fa-star, bs-telephone, etc.
  // Format iconify: logos:react, skill-icons:javascript
  return id.includes('-') || id.includes(':')
}

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

/**
 * QuestionnaireCreation Component
 * Page for creating questionnaires
 */
export default function QuestionnaireCreation() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!currentUser) {
    return (
      <div className="container mx-auto p-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Accès refusé</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Veuillez vous connecter pour créer un questionnaire.</p>
            <Button onClick={() => navigate('/login')} className="mt-4">Se connecter</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Créer un Questionnaire</CardTitle>
          <CardDescription>Feature en développement</CardDescription>
        </CardHeader>
        <CardContent>
          <p>L'outil de création de questionnaire sera bientôt disponible.</p>
        </CardContent>
      </Card>
    </div>
  );
}
