import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Edit, PlusCircle, Trash2, GripVertical, Save, X, Loader2, HelpCircle } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/components/ui/use-toast';
import AdminStepForm from './AdminStepForm';
import { v4 as uuidv4 } from 'uuid';
import * as LucideIcons from 'lucide-react';
import * as FontAwesome6 from 'react-icons/fa6';
import * as BootstrapIcons from 'react-icons/bs';
import * as MaterialIcons from 'react-icons/md';
import * as FeatherIcons from 'react-icons/fi';
import * as HeroiconsIcons from 'react-icons/hi2';
import * as AntIcons from 'react-icons/ai';
import { Icon as IconifyIcon } from '@iconify/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const IconLibraryMap = {
  lucide: { module: LucideIcons, prefix: '', color: '#181818', label: 'Lucide' },
  fa6: { module: FontAwesome6, prefix: 'fa', color: '#0184BC', label: 'Font Awesome 6' },
  bs: { module: BootstrapIcons, prefix: 'bs', color: '#7952B3', label: 'Bootstrap Icons' },
  md: { module: MaterialIcons, prefix: 'md', color: '#00BCD4', label: 'Material Design' },
  fi: { module: FeatherIcons, prefix: 'fi', color: '#000000', label: 'Feather' },
  hi2: { module: HeroiconsIcons, prefix: 'hi', color: '#6366F1', label: 'Heroicons' },
  ai: { module: AntIcons, prefix: 'ai', color: '#1890FF', label: 'Ant Design' },
};

const getIconComponent = (iconString) => {
  if (!iconString) return null;

  // Support pour les icônes Iconify colorées (logos, skill-icons, devicon)
  if (
    iconString.includes(':') &&
    (iconString.startsWith('logos:') ||
      iconString.startsWith('skill-icons:') ||
      iconString.startsWith('devicon:'))
  ) {
    return (props) => <IconifyIcon icon={iconString} {...props} />;
  }

  const [library, name] = iconString.split(':');
  const libraryData = IconLibraryMap[library];
  if (!libraryData) return null;

  const module = libraryData.module;
  return module[name] || null;
};

const toPascalCase = (str) => {
  if (!str) return null;
  return str
    .split(/[\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

// Composant pour un élément d'étape déplaçable
const SortableStepItem = ({ step, index, imageArray, onEdit, onDelete, onInsertAfter }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const pictogramInfo = step.pictogram_app_image_id
    ? imageArray.find((img) => img.id === step.pictogram_app_image_id)
    : null;
  const IconComponent = getIconComponent(step.icon_name);

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors group border-b border-gray-100"
    >
      <div className="flex items-center flex-1 truncate pr-4">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-muted-foreground mr-2" />
        </div>
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-2">
          {IconComponent ? (
            <IconComponent className="h-5 w-5 text-primary" />
          ) : pictogramInfo ? (
            <img
              src={pictogramInfo.publicUrl}
              alt={pictogramInfo.name}
              className="h-6 w-6 object-contain"
            />
          ) : (
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <span className="flex-1 truncate" title={step.instruction}>
          {index + 1}. {step.instruction}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onInsertAfter(index)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2"
          title="Insérer une étape après"
        >
          <PlusCircle className="h-3 w-3 mr-1" />
          Insérer
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onEdit(step)}>
          <Edit className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(step.id)}>
          <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-destructive" />
        </Button>
      </div>
    </li>
  );
};

const AdminStepList = ({ version }) => {
  const { upsertManySteps, deleteStep, isLoading, images } = useAdmin();
  const imageArray = images instanceof Map ? Array.from(images.values()) : [];
  const { toast } = useToast();
  const [steps, setSteps] = useState(version.steps || []);
  const [editingStep, setEditingStep] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const reorderedSteps = arrayMove(items, oldIndex, newIndex);
        return reorderedSteps.map((s, i) => ({ ...s, step_order: i }));
      });
    }

    setActiveId(null);
  };

  const handleAddStep = () => {
    const newStep = {
      id: uuidv4(),
      version_id: version.id,
      step_order: steps.length,
      instruction: '',
      action_type: 'tap',
      isNew: true,
    };
    setEditingStep(newStep);
  };

  const handleInsertStepAfter = (index) => {
    const newStep = {
      id: uuidv4(),
      version_id: version.id,
      step_order: index + 1,
      instruction: '',
      action_type: 'tap',
      isNew: true,
    };
    setEditingStep(newStep);
  };

  const handleEditStep = (step) => {
    setEditingStep(step);
  };

  const handleSaveStep = (stepData) => {
    let updatedSteps;
    if (stepData.isNew) {
      // Si l'étape a un step_order spécifique, l'insérer à cette position
      if (stepData.step_order < steps.length) {
        updatedSteps = [
          ...steps.slice(0, stepData.step_order),
          { ...stepData, isNew: false },
          ...steps.slice(stepData.step_order),
        ];
      } else {
        // Sinon l'ajouter à la fin
        updatedSteps = [...steps, { ...stepData, isNew: false }];
      }
    } else {
      updatedSteps = steps.map((s) => (s.id === stepData.id ? stepData : s));
    }
    setSteps(updatedSteps.map((s, i) => ({ ...s, step_order: i })));
    setEditingStep(null);
  };

  const handleDeleteStep = async (stepId) => {
    try {
      // Get the step to check if it exists in DB
      const stepToDelete = steps.find((s) => s.id === stepId);

      // Only call deleteStep if it's not a new step (has been saved to DB)
      if (stepToDelete && !stepToDelete.isNew) {
        await deleteStep(stepId);
      }

      // Update local state
      setSteps(steps.filter((s) => s.id !== stepId).map((s, i) => ({ ...s, step_order: i })));
      if (editingStep?.id === stepId) {
        setEditingStep(null);
      }
      toast({ title: 'Étape supprimée', description: "L'étape a été supprimée." });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible de supprimer l'étape.",
        variant: 'destructive',
      });
    }
  };

  const handleSaveAllSteps = async () => {
    try {
      await upsertManySteps(steps);
      toast({
        title: 'Étapes enregistrées',
        description: 'Toutes les modifications ont été enregistrées.',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible d'enregistrer les étapes.",
        variant: 'destructive',
      });
    }
  };

  if (editingStep) {
    return (
      <AdminStepForm
        step={editingStep}
        onSave={handleSaveStep}
        onCancel={() => setEditingStep(null)}
        onDelete={() => handleDeleteStep(editingStep.id)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Étapes</CardTitle>
        <CardDescription>
          Gérez les étapes pour cette version. Glissez-déposez pour réorganiser.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-1">
              {steps && steps.length > 0 ? (
                steps.map((step, index) => (
                  <SortableStepItem
                    key={step.id}
                    step={step}
                    index={index}
                    imageArray={imageArray}
                    onEdit={handleEditStep}
                    onDelete={handleDeleteStep}
                    onInsertAfter={handleInsertStepAfter}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Aucune étape pour cette version.
                </p>
              )}
            </ul>
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <div className="bg-white rounded-md shadow-lg p-2 border-2 border-blue-500">
                <span className="font-medium">
                  {steps.find((s) => s.id === activeId)?.instruction}
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
        <div className="flex justify-between mt-4">
          <Button onClick={handleAddStep} variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une Étape
          </Button>
          <Button onClick={handleSaveAllSteps} size="sm" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Enregistrer les Étapes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminStepList;
