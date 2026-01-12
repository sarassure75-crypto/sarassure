import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, ListChecks as QuestionIcon, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { creationStatuses } from '@/data/tasks';
import * as LucideIcons from 'lucide-react';
import * as FontAwesome6 from 'react-icons/fa6';
import * as BootstrapIcons from 'react-icons/bs';
import * as MaterialIcons from 'react-icons/md';
import * as FeatherIcons from 'react-icons/fi';
import * as HeroiconsIcons from 'react-icons/hi2';
import * as AntIcons from 'react-icons/ai';
import { Icon as IconifyIcon } from '@iconify/react';

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
  if (iconString.includes(':') && (
    iconString.startsWith('logos:') || 
    iconString.startsWith('skill-icons:') || 
    iconString.startsWith('devicon:')
  )) {
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
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

const TaskItem = ({ task, onSelectTask, onDeleteTask, onDuplicateTask, imagesMap }) => {
  const statusInfo = creationStatuses.find(s => s.id === task.creation_status) || { label: 'Inconnu', color: 'bg-gray-400' };
  const IconComponent = getIconComponent(task.icon_name);
  const PictogramInfo = task.pictogram_app_image_id ? imagesMap.get(task.pictogram_app_image_id) : null;
  const isQuestionnaire = task.task_type === 'questionnaire';

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className={`flex items-center p-4 hover:bg-muted/50 ${isQuestionnaire ? 'bg-blue-50' : 'bg-card'}`}>
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center mr-4 ${isQuestionnaire ? 'bg-blue-100' : 'bg-primary/10'}`}>
          {isQuestionnaire ? (
            <QuestionIcon className="h-6 w-6 text-blue-600" />
          ) : IconComponent ? (
            <IconComponent className="h-6 w-6 text-primary" />
          ) : PictogramInfo ? (
            <img src={PictogramInfo.publicUrl} alt={PictogramInfo.name} className="h-8 w-8 object-contain" />
          ) : (
            <HelpCircle className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-lg">{task.title}</p>
            {isQuestionnaire && (
              <Badge className="bg-blue-600 text-white">QCM</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{task.description}</p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Badge variant="outline" className={`${statusInfo.color} text-white`}>{statusInfo.label}</Badge>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onSelectTask(task); }}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDuplicateTask(task); }}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

    </div>
  );
};

const AdminTaskList = ({ tasks, onSelectTask, onAddNewTask, onCreateQuestionnaire, onDeleteTask, onDuplicateTask, imagesMap, categories = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Group tasks by category name (use task.category or 'Sans catégorie')
  const grouped = tasks.reduce((acc, task) => {
    const cat = task.category || 'Sans catégorie';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(task);
    return acc;
  }, {});

  // Build a list of category names in desired order: provided categories first, then others
  const categoryOrder = ['all', ...categories.map(c => c.name)];
  const otherCats = Object.keys(grouped).filter(k => k !== 'Sans catégorie' && !categoryOrder.includes(k));
  const orderedCategoryKeys = ['all', ...categories.map(c => c.name), ...otherCats, 'Sans catégorie'].filter((v, i, a) => a.indexOf(v) === i);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestion des Tâches</CardTitle>
          <CardDescription>Créez, modifiez et organisez les tâches de l'application.</CardDescription>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded bg-white text-sm"
            aria-label="Filtrer par catégorie"
          >
            <option value="all">Toutes catégories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
            <option value="Sans catégorie">Sans catégorie</option>
          </select>

          <Button onClick={onAddNewTask}>
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une Tâche
          </Button>

          <Button onClick={onCreateQuestionnaire} variant="outline" className="border-purple-300 hover:bg-purple-50">
            <QuestionIcon className="mr-2 h-4 w-4 text-purple-600" />
            <span className="text-purple-600 font-medium">Créer QCM</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {tasks && tasks.length > 0 ? (
          <div className="space-y-8">
            {/* Section Questionnaires */}
            {(() => {
              const questionnaires = tasks.filter(t => t.task_type === 'questionnaire');
              if (questionnaires.length === 0) return null;
              
              // Grouper les QCM par catégorie
              const groupedQCM = questionnaires.reduce((acc, task) => {
                const cat = task.category || 'Sans catégorie';
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(task);
                return acc;
              }, {});

              const categoryOrder = ['all', ...categories.map(c => c.name)];
              const otherCats = Object.keys(groupedQCM).filter(k => k !== 'Sans catégorie' && !categoryOrder.includes(k));
              const orderedQCMKeys = [...categories.map(c => c.name), ...otherCats, 'Sans catégorie'].filter((v, i, a) => a.indexOf(v) === i && groupedQCM[v]);

              const qcmKeysToRender = selectedCategory === 'all'
                ? orderedQCMKeys
                : [selectedCategory].filter(k => groupedQCM[k]);

              return (
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-700">
                    <QuestionIcon className="h-5 w-5" />
                    Questionnaires (QCM)
                  </h3>
                  <div className="space-y-6">
                    {qcmKeysToRender.map(catName => {
                      const items = groupedQCM[catName] || [];
                      if (!items || items.length === 0) return null;
                      return (
                        <div key={catName}>
                          <h4 className="text-sm font-semibold mb-2 text-blue-600">{catName}</h4>
                          <div className="space-y-4">
                            {items.map(task => (
                              <TaskItem
                                key={task.id}
                                task={task}
                                onSelectTask={onSelectTask}
                                onDeleteTask={onDeleteTask}
                                onDuplicateTask={onDuplicateTask}
                                imagesMap={imagesMap}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Section Exercices */}
            {(() => {
              const exercises = tasks.filter(t => t.task_type !== 'questionnaire');
              if (exercises.length === 0) return null;
              
              // Group exercises by category
              const grouped = exercises.reduce((acc, task) => {
                const cat = task.category || 'Sans catégorie';
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(task);
                return acc;
              }, {});

              const categoryOrder = ['all', ...categories.map(c => c.name)];
              const otherCats = Object.keys(grouped).filter(k => k !== 'Sans catégorie' && !categoryOrder.includes(k));
              const orderedCategoryKeys = [...categories.map(c => c.name), ...otherCats, 'Sans catégorie'].filter((v, i, a) => a.indexOf(v) === i);

              const keysToRender = selectedCategory === 'all'
                ? orderedCategoryKeys
                : [selectedCategory].filter(k => grouped[k]);

              return (
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    Exercices
                  </h3>
                  <div className="space-y-6">
                    {keysToRender.map(catName => {
                      const items = grouped[catName] || [];
                      if (!items || items.length === 0) return null;
                      return (
                        <div key={catName}>
                          {catName !== 'all' && <h4 className="text-sm font-semibold mb-2">{catName}</h4>}
                          <div className="space-y-4">
                            {items.map(task => (
                              <TaskItem
                                key={task.id}
                                task={task}
                                onSelectTask={onSelectTask}
                                onDeleteTask={onDeleteTask}
                                onDuplicateTask={onDuplicateTask}
                                imagesMap={imagesMap}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucune tâche trouvée.</p>
            <Button onClick={onAddNewTask} className="mt-4">Commencer par créer une tâche</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminTaskList;