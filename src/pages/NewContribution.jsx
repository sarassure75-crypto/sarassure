import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { searchImages } from "../data/imagesMetadata";
import { actionTypes } from "../data/tasks";
import { linkExerciseToRequest } from "../data/exerciseRequests";
import CGUWarningBanner from "../components/CGUWarningBanner";
import { 
  Save, 
  Send, 
  X, 
  Plus, 
  Trash2, 
  Edit,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import StepAreaEditor from '../components/admin/StepAreaEditor';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function NewContribution() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // État du formulaire principal
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [difficulty, setDifficulty] = useState('facile');
  
  // Liaison avec une demande d'exercice
  const [linkedRequestCode, setLinkedRequestCode] = useState('');
  const [hasRequestLink, setHasRequestLink] = useState(false);
  
  // États des versions
  const [versions, setVersions] = useState([]);
  const [editingVersionId, setEditingVersionId] = useState(null);
  const [editingVersion, setEditingVersion] = useState(null);
  
  // États UI
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [images, setImages] = useState([]);
  const [deleteAlert, setDeleteAlert] = useState({ isOpen: false, versionId: null });
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [draftId, setDraftId] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showCGUBanner, setShowCGUBanner] = useState(true);
  
  // État pour la gestion des corrections
  const [isEditingCorrection, setIsEditingCorrection] = useState(false);
  const [originalSubmissionId, setOriginalSubmissionId] = useState(null);
  const [adminComments, setAdminComments] = useState('');
  const [modificationCount, setModificationCount] = useState(0);

  // Charger les images au montage et restaurer les brouillons
  useEffect(() => {
    loadImages();
    loadDraft();
  }, []);

  // Auto-sauvegarder les brouillons toutes les 30 secondes
  useEffect(() => {
    if (!title.trim() && versions.length === 0) return; // Ne pas auto-sauvegarder si vide
    
    const autoSaveTimer = setInterval(() => {
      saveDraftToLocalStorage();
    }, 30000); // 30 secondes
    
    return () => clearInterval(autoSaveTimer);
  }, [title, description, category, subcategory, difficulty, versions]);

  const loadImages = async () => {
    try {
      const result = await searchImages({ moderationStatus: 'approved' });
      if (result.success) {
        setImages(result.data || []);
      }
    } catch (err) {
      console.error('Erreur chargement images:', err);
    }
  };

  const saveDraftToLocalStorage = async () => {
    try {
      const draftData = {
        id: draftId || uuidv4(),
        title,
        description,
        category,
        subcategory,
        difficulty,
        versions,
        savedAt: new Date().toISOString(),
        userId: currentUser?.id
      };

      // Sauvegarder dans localStorage
      const drafts = JSON.parse(localStorage.getItem('contributionDrafts') || '[]');
      const existingIndex = drafts.findIndex(d => d.id === draftData.id);
      
      if (existingIndex >= 0) {
        drafts[existingIndex] = draftData;
      } else {
        drafts.push(draftData);
      }
      
      localStorage.setItem('contributionDrafts', JSON.stringify(drafts));
      
      if (!draftId) {
        setDraftId(draftData.id);
      }
      
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000); // Afficher le message 3 secondes
    } catch (err) {
      console.error('Erreur sauvegarde brouillon:', err);
    }
  };

  const loadDraft = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const draftIdParam = urlParams.get('draft');
      const editParam = urlParams.get('edit'); // Task ID pour édition
      const correctionParam = urlParams.get('correction'); // Version ID pour correction
      
      // Cas 1: Charger un brouillon depuis localStorage
      if (draftIdParam) {
        const drafts = JSON.parse(localStorage.getItem('contributionDrafts') || '[]');
        const draft = drafts.find(d => d.id === draftIdParam);
        
        if (draft) {
          setTitle(draft.title);
          setDescription(draft.description);
          setCategory(draft.category);
          setSubcategory(draft.subcategory);
          setDifficulty(draft.difficulty);
          setVersions(draft.versions || []);
          setDraftId(draft.id);
        }
      }
      
      // Cas 2: Charger une version à corriger depuis la base de données
      else if (correctionParam) {
        const { data: versionData, error: versionError } = await supabase
          .from('versions')
          .select(`
            *,
            task:task_id (
              id,
              title,
              description,
              category
            ),
            steps (
              id,
              step_order,
              instruction,
              action_type,
              target_area,
              text_input_area,
              start_area,
              expected_input,
              app_image_id,
              app_images:app_image_id (
                id,
                file_path,
                name
              )
            )
          `)
          .eq('id', correctionParam)
          .eq('creation_status', 'needs_changes')
          .single();

        if (versionError) {
          console.error('Erreur chargement version:', versionError);
          alert('Impossible de charger cette version.');
          navigate('/contributeur/mes-contributions');
          return;
        }

        if (versionData) {
          // Remplir le formulaire avec les données de la version à corriger
          setTitle(versionData.task?.title || '');
          setDescription(versionData.task?.description || '');
          setCategory(versionData.task?.category || '');
          setIsEditingCorrection(true);
          setOriginalSubmissionId(versionData.original_submission_id || versionData.id);
          setAdminComments(versionData.admin_comments || '');
          setModificationCount(versionData.modification_count || 0);
          
          // Construire la version pour l'édition
          const editVersion = {
            id: versionData.id,
            task_id: versionData.task_id,
            name: versionData.name,
            icon_name: versionData.icon_name,
            pictogram_app_image_id: versionData.pictogram_app_image_id,
            video_url: versionData.video_url,
            steps: versionData.steps?.map(step => ({
              id: step.id,
              instruction: step.instruction,
              action_type: step.action_type,
              target_area: step.target_area,
              text_input_area: step.text_input_area,
              start_area: step.start_area,
              expected_input: step.expected_input,
              app_image_id: step.app_image_id,
              image_url: step.app_images?.file_path ? 
                supabase.storage.from('images').getPublicUrl(step.app_images.file_path).data?.publicUrl : null
            })).sort((a, b) => (a.step_order || 0) - (b.step_order || 0)) || []
          };
          
          setVersions([editVersion]);
        }
      }
      
      // Cas 3: Édition normale d'un exercice existant (editParam)
      else if (editParam) {
        // Logique existante d'édition...
        // À implémenter si nécessaire
      }
      
    } catch (err) {
      console.error('Erreur chargement:', err);
    }
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    await saveDraftToLocalStorage();
    setSavingDraft(false);
    setShowSaveDialog(false);
  };

  const handleDiscardDraft = () => {
    if (window.confirm('Êtes-vous sûr ? Le brouillon sera supprimé définitivement.')) {
      if (draftId) {
        const drafts = JSON.parse(localStorage.getItem('contributionDrafts') || '[]');
        const filtered = drafts.filter(d => d.id !== draftId);
        localStorage.setItem('contributionDrafts', JSON.stringify(filtered));
      }
      setTitle('');
      setDescription('');
      setCategory('');
      setSubcategory('');
      setDifficulty('facile');
      setVersions([]);
      setDraftId(null);
      navigate('/contributeur/nouvelle-contribution');
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    const errors = [];
    if (!title.trim()) errors.push('Le titre est requis');
    if (!description.trim()) errors.push('La description est requise');
    if (!category) errors.push('La catégorie est requise');
    if (versions.length === 0) errors.push('Au moins une version est requise');
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Ajouter une version
  const handleAddVersion = () => {
    const newVersion = {
      id: uuidv4(),
      name: `Version ${versions.length + 1}`,
      icon_name: 'ListChecks',
      pictogram_app_image_id: null,
      video_url: '',
      creation_status: 'to_create',
      steps: [],
      isNew: true
    };
    setEditingVersionId(newVersion.id);
    setEditingVersion(newVersion);
  };

  // Sauvegarder une version
  const handleSaveVersion = (updatedVersion) => {
    if (editingVersion && editingVersionId) {
      const index = versions.findIndex(v => v.id === editingVersionId);
      if (index >= 0) {
        const newVersions = [...versions];
        newVersions[index] = updatedVersion;
        setVersions(newVersions);
      } else {
        setVersions([...versions, updatedVersion]);
      }
    } else {
      setVersions([...versions, updatedVersion]);
    }
    setEditingVersionId(null);
    setEditingVersion(null);
  };

  // Supprimer une version
  const handleDeleteVersion = () => {
    if (deleteAlert.versionId) {
      setVersions(versions.filter(v => v.id !== deleteAlert.versionId));
    }
    setDeleteAlert({ isOpen: false, versionId: null });
  };

  // Éditer une version
  const handleEditVersion = (versionId) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      setEditingVersionId(versionId);
      setEditingVersion({ ...version });
    }
  };

  // Soumettre la contribution
  const handleSubmit = async () => {
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    try {
      // Cas spécial: Resoumission après correction
      if (isEditingCorrection && versions.length > 0) {
        return await handleCorrectionResubmission();
      }
      
      // Cas normal: Nouvelle contribution
      return await handleNewSubmission();
    } catch (error) {
      console.error('Erreur soumission:', error);
      alert('❌ Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Nouvelle soumission normale
  const handleNewSubmission = async () => {
    // Créer la tâche (exercice) dans la table tasks
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert([{
        title,
        description,
        category,
        icon_name: 'help-circle',
        owner_id: currentUser.id,
        is_public: false,
        creation_status: {
          status: 'pending',
          difficulty,
          created_at: new Date().toISOString()
        }
      }])
      .select()
      .single();

    if (taskError) throw taskError;

    // Lier à la demande d'exercice si un code est fourni
    if (hasRequestLink && linkedRequestCode.trim()) {
      try {
        await linkExerciseToRequest(linkedRequestCode.trim(), task.id);
        console.log(`✓ Exercice lié à la demande ${linkedRequestCode}`);
      } catch (linkError) {
        console.warn('Impossible de lier à la demande:', linkError);
        // Ne pas bloquer la soumission si le lien échoue
      }
    }

    // Créer les versions
    if (versions.length > 0) {
      const versionsData = versions.map((v, idx) => ({
        id: uuidv4(),
        task_id: task.id,
        name: v.name,
        icon_name: v.icon_name,
        pictogram_app_image_id: v.pictogram_app_image_id,
        creation_status: 'pending',
        version_int: idx + 1
      }));

      const { error: versionsError } = await supabase
        .from('versions')
        .insert(versionsData);

      if (versionsError) throw versionsError;

      // Créer les étapes pour chaque version
      for (let i = 0; i < versions.length; i++) {
        const versionData = versionsData[i];
        const versionSteps = versions[i].steps || [];
        
        if (versionSteps.length > 0) {
          const stepsData = versionSteps.map((step, stepIdx) => {
            // Déterminer la clé de zone basée sur le type d'action
            const zoneKey = ['text_input', 'number_input'].includes(step.action_type) 
              ? 'text_input_area'
              : step.action_type?.startsWith('swipe') || step.action_type === 'scroll'
              ? 'start_area'
              : 'target_area';

            return {
              id: uuidv4(),
              version_id: versionData.id,
              instruction: step.instruction,
              action_type: step.action_type || 'tap',
              app_image_id: step.image_id,
              [zoneKey]: step[zoneKey] || step.area || null,
              step_order: stepIdx,
              created_at: new Date().toISOString()
            };
          });

          const { error: stepsError } = await supabase
            .from('steps')
            .insert(stepsData);

          if (stepsError) throw stepsError;
        }
      }
    }

    alert('✅ Contribution soumise avec succès ! Elle sera validée par un administrateur.');
    navigate('/contributeur/mes-contributions');
  };

  // Resoumission après correction
  const handleCorrectionResubmission = async () => {
    const version = versions[0]; // Une seule version en mode correction
    
    if (!version || !version.id) {
      throw new Error('Version introuvable pour la correction');
    }
    
    // Préparer les données avec vérification des UUIDs
    const updateData = {
      name: version.name || 'Version corrigée',
      icon_name: version.icon_name || null,
      creation_status: 'pending', // Remet en attente de validation
      modification_count: (modificationCount || 0) + 1,
      updated_at: new Date().toISOString()
    };

    // Ajouter pictogram_app_image_id seulement s'il est valide
    if (version.pictogram_app_image_id && version.pictogram_app_image_id !== 'undefined') {
      updateData.pictogram_app_image_id = version.pictogram_app_image_id;
    }

    // Ajouter original_submission_id seulement s'il est valide
    if (originalSubmissionId && originalSubmissionId !== 'undefined') {
      updateData.original_submission_id = originalSubmissionId;
    }
    
    // Mettre à jour la version existante
    const { error: versionError } = await supabase
      .from('versions')
      .update(updateData)
      .eq('id', version.id);

    if (versionError) throw versionError;

    // Mettre à jour la tâche
    const taskId = version.task_id || version.taskId;
    if (!taskId || taskId === 'undefined') {
      throw new Error('ID de la tâche introuvable');
    }
    
    const { error: taskError } = await supabase
      .from('tasks')
      .update({
        title,
        description,
        category,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (taskError) throw taskError;

    // Supprimer les anciennes étapes
    const { error: deleteStepsError } = await supabase
      .from('steps')
      .delete()
      .eq('version_id', version.id);

    if (deleteStepsError) throw deleteStepsError;

    // Recréer les étapes mises à jour
    if (version.steps && version.steps.length > 0) {
      const stepsData = version.steps.map((step, stepIdx) => {
        const zoneKey = ['text_input', 'number_input'].includes(step.action_type) 
          ? 'text_input_area'
          : step.action_type?.startsWith('swipe') || step.action_type === 'scroll'
          ? 'start_area'
          : 'target_area';

        const stepData = {
          id: uuidv4(),
          version_id: version.id,
          instruction: step.instruction || '',
          action_type: step.action_type || 'tap',
          step_order: stepIdx,
          created_at: new Date().toISOString()
        };
        
        // Ajouter app_image_id seulement s'il est valide
        if (step.app_image_id && step.app_image_id !== 'undefined') {
          stepData.app_image_id = step.app_image_id;
        }
        
        // Ajouter la zone d'action
        const zoneData = step[zoneKey] || step.area;
        if (zoneData) {
          stepData[zoneKey] = zoneData;
        }
        
        return stepData;
      });

      const { error: stepsError } = await supabase
        .from('steps')
        .insert(stepsData);

      if (stepsError) throw stepsError;
    }

    alert('✅ Exercice corrigé et resoumis avec succès ! Il sera re-validé par un administrateur.');
    navigate('/contributeur/mes-contributions');
  };

  // Si en édition de version
  if (editingVersionId && editingVersion) {
    return (
      <VersionForm
        version={editingVersion}
        images={images}
        onSave={handleSaveVersion}
        onCancel={() => setEditingVersionId(null)}
        onDelete={() => {
          setDeleteAlert({ isOpen: true, versionId: editingVersionId });
          setEditingVersionId(null);
        }}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 py-8">
      {/* CGU Warning Banner */}
      {showCGUBanner && (
        <CGUWarningBanner 
          onClose={() => setShowCGUBanner(false)}
          onReadMore={() => navigate('/contributeur/cgu')}
        />
      )}

      {/* Header avec status brouillon */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nouvelle Contribution</h1>
        <p className="text-gray-600 mt-1">Créez un exercice pour enrichir la plateforme</p>
        
        {/* Status brouillon */}
        {draftSaved && (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded-lg w-fit">
            <CheckCircle className="w-4 h-4" />
            <span>Brouillon sauvegardé automatiquement</span>
          </div>
        )}
        
        {draftId && (
          <div className="mt-3 text-sm text-gray-600 flex items-center gap-2">
            <span>💾 Brouillon #{draftId.slice(0, 8)}..</span>
          </div>
        )}
      </div>

      {/* Banner mode correction */}
      {isEditingCorrection && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Edit className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900 mb-2">
                🔧 Mode correction - Exercice à réviser
              </h3>
              <p className="text-sm text-orange-800 mb-3">
                Cet exercice a été renvoyé par l'administrateur avec des commentaires. 
                Apportez les corrections demandées puis resoumettez.
              </p>
              
              {adminComments && (
                <div className="bg-orange-100 border border-orange-300 rounded p-3 mt-3">
                  <p className="text-sm font-medium text-orange-900 mb-1">
                    Commentaires de l'administrateur :
                  </p>
                  <p className="text-sm text-orange-800 whitespace-pre-wrap">
                    {adminComments}
                  </p>
                </div>
              )}
              
              {modificationCount > 0 && (
                <p className="text-xs text-orange-600 mt-2">
                  Nombre de modifications : {modificationCount}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Erreurs */}
      {validationErrors.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-2">Erreurs de validation</h3>
              <ul className="space-y-1 text-sm text-red-700">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Avertissement */}
      <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">⚠️ Interdiction stricte de données personnelles</p>
            <p>Utilisez uniquement les contacts fictifs fournis et les fonds d'écran recommandés.</p>
          </div>
        </div>
      </div>

      {/* Formulaire principal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 space-y-6">
          {/* Informations générales */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Informations générales</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de l'exercice *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Envoyer un message WhatsApp"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Liaison avec une demande d'exercice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="hasRequestLink"
                    checked={hasRequestLink}
                    onChange={(e) => setHasRequestLink(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="hasRequestLink" className="text-sm font-medium text-gray-900 cursor-pointer">
                    Cet exercice correspond à une demande de la liste
                  </label>
                </div>
                
                {hasRequestLink && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code de la demande
                    </label>
                    <input
                      type="text"
                      value={linkedRequestCode}
                      onChange={(e) => setLinkedRequestCode(e.target.value.toUpperCase())}
                      placeholder="Ex: EX-2025-001"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    />
                    <p className="text-xs text-blue-700 mt-1">
                      💡 Consultez la liste des exercices à créer pour trouver le code
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez l'objectif pédagogique..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <option value="Communication">Communication</option>
                    <option value="Réseaux sociaux">Réseaux sociaux</option>
                    <option value="Paramètres">Paramètres</option>
                    <option value="Applications">Applications</option>
                    <option value="Sécurité">Sécurité</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sous-catégorie
                  </label>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="Ex: WhatsApp"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulté
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="facile">Facile</option>
                    <option value="moyen">Moyen</option>
                    <option value="difficile">Difficile</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Versions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Versions ({versions.length})</h2>
              <p className="text-sm text-gray-600">Créez des variantes de votre exercice</p>
            </div>
            <button
              onClick={handleAddVersion}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une version</span>
            </button>
          </div>

          {versions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucune version. Cliquez sur "Ajouter une version" pour commencer.
            </p>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{version.name}</p>
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                        <span className="inline-block px-2 py-1 bg-gray-200 rounded text-xs">
                          {version.creation_status || 'to_create'}
                        </span>
                        <span>{version.steps?.length || 0} étape(s)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditVersion(version.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteAlert({ isOpen: true, versionId: version.id })}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/contributeur')}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          
          {draftId && (
            <button
              onClick={handleDiscardDraft}
              className="px-6 py-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm"
            >
              Supprimer brouillon
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSaveDraft}
            disabled={savingDraft || (!title.trim() && versions.length === 0)}
            className="flex items-center space-x-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingDraft ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sauvegarde...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Sauvegarder en brouillon</span>
              </>
            )}
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || versions.length === 0}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Soumission...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Soumettre pour validation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dialog suppression */}
      {deleteAlert.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Êtes-vous sûr ?</h3>
            <p className="text-gray-600 mb-6">
              Cette action est irréversible. La version sera supprimée définitivement.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteAlert({ isOpen: false, versionId: null })}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteVersion}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant VersionForm
function VersionForm({ version, images, onSave, onCancel, onDelete }) {
  const [formVersion, setFormVersion] = useState(version);
  const [editingStep, setEditingStep] = useState(null);

  const handleVersionChange = (field, value) => {
    setFormVersion({ ...formVersion, [field]: value });
  };

  const handleAddStep = () => {
    const newStep = {
      id: uuidv4(),
      instruction: '',
      action_type: 'tap',
      image_id: null,
      step_order: (formVersion.steps || []).length,
      isNew: true
    };
    setEditingStep(newStep);
  };

  const handleSaveStep = (updatedStep) => {
    const steps = formVersion.steps || [];
    const index = steps.findIndex(s => s.id === updatedStep.id);
    
    let newSteps;
    if (index >= 0) {
      newSteps = [...steps];
      newSteps[index] = updatedStep;
    } else {
      newSteps = [...steps, updatedStep];
    }
    
    setFormVersion({ ...formVersion, steps: newSteps });
    setEditingStep(null);
  };

  const handleDeleteStep = (stepId) => {
    setFormVersion({
      ...formVersion,
      steps: (formVersion.steps || []).filter(s => s.id !== stepId)
    });
  };

  if (editingStep) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <StepForm
          step={editingStep}
          images={images}
          onSave={handleSaveStep}
          onCancel={() => setEditingStep(null)}
          onDelete={() => {
            handleDeleteStep(editingStep.id);
            setEditingStep(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        onClick={onCancel}
        className="mb-6 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        ← Retour
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Éditer la Version</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la version
              </label>
              <input
                type="text"
                value={formVersion.name}
                onChange={(e) => handleVersionChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icône (Lucide Icon)
                </label>
                <input
                  type="text"
                  value={formVersion.icon_name}
                  onChange={(e) => handleVersionChange('icon_name', e.target.value)}
                  placeholder="Ex: ListChecks"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pictogramme
                </label>
                <select
                  value={formVersion.pictogram_app_image_id || ''}
                  onChange={(val) => handleVersionChange('pictogram_app_image_id', val || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Aucun</option>
                  {images.filter(img => img.source === 'admin').map(img => (
                    <option key={img.id} value={img.id}>{img.name || img.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Vidéo
              </label>
              <input
                type="text"
                value={formVersion.video_url || ''}
                onChange={(e) => handleVersionChange('video_url', e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Étapes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Étapes ({(formVersion.steps || []).length})</h2>
            <button
              onClick={handleAddStep}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une étape</span>
            </button>
          </div>

          {(formVersion.steps || []).length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune étape</p>
          ) : (
            <div className="space-y-2">
              {(formVersion.steps || []).map((step, idx) => (
                <div
                  key={step.id}
                  className="p-3 bg-gray-50 rounded-lg flex items-center justify-between border border-gray-200"
                >
                  <span className="font-medium text-sm">
                    Étape {idx + 1}: {step.instruction.substring(0, 50)}
                    {step.instruction.length > 50 ? '...' : ''}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingStep(step)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStep(step.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Annuler
        </button>

        <div className="flex gap-2">
          <button
            onClick={onDelete}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Supprimer</span>
          </button>
          <button
            onClick={() => onSave(formVersion)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Sauvegarder</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Composant StepForm avec éditeur de zones
function StepForm({ step, images, onSave, onCancel, onDelete }) {
  const [formStep, setFormStep] = useState(step);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editorImageDimensions, setEditorImageDimensions] = useState({ width: 0, height: 0 });

  // Charger l'image sélectionnée au montage
  useEffect(() => {
    if (formStep.image_id) {
      const img = images.find(i => i.id === formStep.image_id);
      setSelectedImage(img);
    }
  }, [formStep.image_id, images]);

  const handleActionTypeChange = (value) => {
    setFormStep({ ...formStep, action_type: value });
  };

  const handleImageChange = (imageId) => {
    setFormStep({ ...formStep, image_id: imageId || null });
    if (imageId) {
      const img = images.find(i => i.id === imageId);
      setSelectedImage(img);
    } else {
      setSelectedImage(null);
    }
  };

  const handleAreaChange = (area) => {
    // Déterminer la clé de zone en fonction du type d'action (même logique que dans handleSubmit)
    const zoneKey = ['text_input', 'number_input'].includes(formStep.action_type) 
      ? 'text_input_area'
      : formStep.action_type?.startsWith('swipe') || formStep.action_type === 'scroll'
      ? 'start_area'
      : 'target_area';
    
    setFormStep({ 
      ...formStep, 
      [zoneKey]: area 
    });
  };

  const handleImageLoad = (dimensions) => {
    setEditorImageDimensions(dimensions);
  };

  const getZoneKey = () => {
    return ['text_input', 'number_input'].includes(formStep.action_type) 
      ? 'text_input_area'
      : formStep.action_type?.startsWith('swipe') || formStep.action_type === 'scroll'
      ? 'start_area'
      : 'target_area';
  };

  const currentArea = formStep[getZoneKey()];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Éditer l'étape</h2>
      </div>

      {/* Contenu principal en deux colonnes */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        
        {/* COLONNE GAUCHE: Formulaire */}
        <div className="lg:col-span-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instruction *
            </label>
            <textarea
              value={formStep.instruction}
              onChange={(e) => setFormStep({ ...formStep, instruction: e.target.value })}
              placeholder="Ex: Appuyez sur l'icône WhatsApp"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'action *
            </label>
            <select
              value={formStep.action_type || ''}
              onChange={(e) => handleActionTypeChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Sélectionner un type</option>
              {actionTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Champ pour saisie de texte */}
          {formStep.action_type === 'text_input' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texte à saisir
              </label>
              <input
                type="text"
                value={formStep.text_value || ''}
                onChange={(e) => setFormStep({ ...formStep, text_value: e.target.value })}
                placeholder="Ex: Bonjour"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Le texte exact à saisir dans le clavier</p>
            </div>
          )}

          {/* Champ pour saisie de numéro */}
          {formStep.action_type === 'number_input' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro à saisir
              </label>
              <input
                type="text"
                value={formStep.number_value || ''}
                onChange={(e) => setFormStep({ ...formStep, number_value: e.target.value })}
                placeholder="Ex: 123456789"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Le numéro exact à saisir sur le clavier numérique</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image de capture *
            </label>
            <select
              value={formStep.image_id || ''}
              onChange={(e) => handleImageChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Sélectionner une image</option>
              {images.map(img => (
                <option key={img.id} value={img.id}>
                  {img.title || img.name}
                </option>
              ))}
            </select>
          </div>

          {formStep.action_type && formStep.action_type !== 'bravo' && selectedImage && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <p className="font-medium mb-1">💡 Zone d'action</p>
              <p className="text-xs">
                {['tap', 'double_tap', 'long_press'].includes(formStep.action_type) && 
                  'Tracez le bouton à cliquer'}
                {['swipe_left', 'swipe_right', 'swipe_up', 'swipe_down', 'scroll'].includes(formStep.action_type) && 
                  'Tracez la direction'}
                {formStep.action_type === 'drag_and_drop' && 
                  'Tracez le glisser'}
                {['text_input', 'number_input'].includes(formStep.action_type) && 
                  'Tracez le champ'}
              </p>
            </div>
          )}

          {formStep.action_type === 'bravo' && selectedImage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
              <p className="font-medium mb-1">🎉 Bravo</p>
              <p className="text-xs">
                Cette étape affichera uniquement la capture d'écran de félicitations sans zone d'action à cliquer.
              </p>
            </div>
          )}
        </div>

        {/* COLONNE DROITE: Image + Éditeur */}
        <div className="lg:col-span-2">
          {selectedImage && formStep.action_type && formStep.action_type !== 'bravo' ? (
            <div className="space-y-4">
              <div className="border border-gray-300 rounded-lg bg-gray-100 overflow-auto" style={{ maxHeight: '600px' }}>
                <StepAreaEditor
                  imageUrl={selectedImage.public_url}
                  area={currentArea}
                  onAreaChange={handleAreaChange}
                  onImageLoad={handleImageLoad}
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                Cliquez et glissez sur l'image pour dessiner la zone d'action
              </p>
            </div>
          ) : selectedImage && formStep.action_type === 'bravo' ? (
            <div className="border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
              <img 
                src={selectedImage.public_url} 
                alt="Capture finale" 
                className="w-full h-auto"
              />
              <div className="p-4 text-center bg-green-50">
                <p className="text-sm text-green-800">
                  🎉 Capture d'écran de félicitations (aucune zone d'action requise)
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 flex items-center justify-center min-h-96">
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">
                  {!selectedImage ? '👆 Sélectionnez une image' : '⚙️ Sélectionnez un type d\'action'}
                </p>
                <p className="text-xs text-gray-400">
                  {!selectedImage ? 'pour voir l\'aperçu' : 'pour pouvoir éditer la zone'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer avec boutons */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center rounded-b-lg">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Annuler
        </button>
        <div className="flex gap-2">
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Supprimer</span>
          </button>
          <button
            onClick={() => onSave(formStep)}
            disabled={!formStep.instruction.trim() || !formStep.action_type || !formStep.image_id}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>Sauvegarder</span>
          </button>
        </div>
      </div>
    </div>
  );
}
