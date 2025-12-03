import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, ChevronDown, ChevronUp, HelpCircle, Settings2, HelpCircle as QuestionIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { creationStatuses } from '@/data/tasks';
import * as LucideIcons from 'lucide-react';

const toPascalCase = (str) => {
  if (!str) return null;
  return str
    .split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

const TaskItem = ({ task, onSelectTask, onDeleteTask, imagesMap }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusInfo = creationStatuses.find(s => s.id === task.creation_status) || { label: 'Inconnu', color: 'bg-gray-400' };
  const IconComponent = LucideIcons[toPascalCase(task.icon_name)] || null;
  const PictogramInfo = task.pictogram_app_image_id ? imagesMap.get(task.pictogram_app_image_id) : null;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center p-4 bg-card hover:bg-muted/50 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
          {IconComponent ? (
            <IconComponent className="h-6 w-6 text-primary" />
          ) : PictogramInfo ? (
            <img src={PictogramInfo.publicUrl} alt={PictogramInfo.name} className="h-8 w-8 object-contain" />
          ) : (
            <HelpCircle className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-lg">{task.title}</p>
          <p className="text-sm text-muted-foreground">{task.description}</p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Badge variant="outline" className={`${statusInfo.color} text-white`}>{statusInfo.label}</Badge>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onSelectTask(task); }}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t bg-background text-center">
            <Button onClick={(e) => { e.stopPropagation(); onSelectTask(task); }}>
                <Settings2 className="mr-2 h-4 w-4" />
                Gérer les versions et étapes
            </Button>
        </div>
      )}
    </div>
  );
};

const AdminTaskList = ({ tasks, onSelectTask, onAddNewTask, onCreateQuestionnaire, onDeleteTask, imagesMap, categories = [] }) => {
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
          <div className="space-y-6">
            {(() => {
              // When showing 'all', render each category group (avoid rendering a flat "all" list)
              const keysToRender = selectedCategory === 'all'
                ? orderedCategoryKeys.filter(k => k !== 'all')
                : [selectedCategory];

              return keysToRender.map(catName => {
                const items = catName === 'all' ? tasks : (grouped[catName] || []);
                if (!items || items.length === 0) return null;
                return (
                  <div key={catName}>
                    {catName !== 'all' && <h3 className="text-sm font-semibold mb-2">{catName}</h3>}
                    <div className="space-y-4">
                      {items.map(task => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onSelectTask={onSelectTask}
                          onDeleteTask={onDeleteTask}
                          imagesMap={imagesMap}
                        />
                      ))}
                    </div>
                  </div>
                );
              });
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