import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  ListChecks, 
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUp,
  ArrowRight,
  ArrowDown
} from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import {
  fetchExerciseRequests,
  createExerciseRequest,
  updateExerciseRequest,
  deleteExerciseRequest,
  getExerciseRequestsStats
} from '@/data/exerciseRequests';

const priorityConfig = {
  high: { label: 'Prioritaire', icon: ArrowUp, color: 'text-red-600 bg-red-50' },
  normal: { label: 'Normal', icon: ArrowRight, color: 'text-blue-600 bg-blue-50' },
  low: { label: 'Optionnel', icon: ArrowDown, color: 'text-gray-600 bg-gray-50' }
};

const statusConfig = {
  pending: { label: 'À faire', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
  in_progress: { label: 'En cours', icon: AlertCircle, color: 'text-blue-600 bg-blue-50' },
  completed: { label: 'Terminé', icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
  cancelled: { label: 'Annulé', icon: XCircle, color: 'text-gray-600 bg-gray-50' }
};

function CreateEditDialog({ open, onOpenChange, request, categories, onSuccess }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = Boolean(request);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target);
      const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        category_name: formData.get('category_name'),
        priority: formData.get('priority'),
        notes: formData.get('notes')
      };

      if (isEdit) {
        data.status = formData.get('status');
        await updateExerciseRequest(request.id, data);
        toast({ title: 'Demande mise à jour' });
      } else {
        await createExerciseRequest(data);
        toast({ title: 'Demande créée', description: 'Un code unique a été généré automatiquement.' });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving exercise request:', error);
      toast({ 
        title: 'Erreur', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier' : 'Créer'} une demande d'exercice</DialogTitle>
          <DialogDescription>
            {isEdit 
              ? 'Modifier les informations de cette demande d\'exercice.'
              : 'Créer une nouvelle demande d\'exercice. Un code unique sera généré automatiquement.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isEdit && (
            <div>
              <Label>Code de référence</Label>
              <Input value={request.code} disabled className="font-mono font-bold" />
            </div>
          )}

          <div>
            <Label htmlFor="title">Titre de l'exercice *</Label>
            <Input
              id="title"
              name="title"
              defaultValue={request?.title}
              placeholder="Ex: Paramétrer le Wi-Fi"
              required
            />
          </div>

          <div>
            <Label htmlFor="category_name">Catégorie</Label>
            <Input
              id="category_name"
              name="category_name"
              defaultValue={request?.category_name}
              placeholder="Ex: Communication, Paramètres..."
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={request?.description}
              placeholder="Description détaillée de l'exercice à créer..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priorité *</Label>
              <select
                id="priority"
                name="priority"
                defaultValue={request?.priority || 'normal'}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="high">Prioritaire</option>
                <option value="normal">Normal</option>
                <option value="low">Optionnel</option>
              </select>
            </div>

            {isEdit && (
              <div>
                <Label htmlFor="status">Statut</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={request?.status}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="pending">À faire</option>
                  <option value="in_progress">En cours</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notes / Commentaires</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={request?.notes}
              placeholder="Notes internes, consignes spécifiques..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ExerciseRequestsManager() {
  const { categories } = useAdmin();
  const { toast } = useToast();

  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [deletingRequest, setDeletingRequest] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [requestsData, statsData] = await Promise.all([
        fetchExerciseRequests(),
        getExerciseRequestsStats()
      ]);
      setRequests(requestsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading exercise requests:', error);
      toast({
        title: 'Erreur de chargement',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesSearch = 
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || req.priority === filterPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [requests, searchTerm, filterStatus, filterPriority]);

  const handleDelete = async () => {
    if (!deletingRequest) return;

    try {
      await deleteExerciseRequest(deletingRequest.id);
      toast({ title: 'Demande supprimée' });
      setDeletingRequest(null);
      loadData();
    } catch (error) {
      console.error('Error deleting request:', error);
      toast({
        title: 'Erreur de suppression',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des demandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header avec statistiques */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <ListChecks className="h-8 w-8 text-primary" />
            Demandes d'exercices
          </h2>
          <p className="text-muted-foreground mt-1">
            Gérer les exercices à créer en coordination avec les contributeurs
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle demande
        </Button>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>À faire</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{stats.by_status.pending}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>En cours</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{stats.by_status.in_progress}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Prioritaires</CardDescription>
              <CardTitle className="text-3xl text-red-600">{stats.by_priority.high}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre, code ou description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">Tous les statuts</option>
          {Object.entries(statusConfig).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">Toutes les priorités</option>
          {Object.entries(priorityConfig).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* Liste des demandes */}
      <ScrollArea className="h-[calc(100vh-450px)]">
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ListChecks className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Aucune demande trouvée</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                    ? 'Essayez de modifier vos filtres'
                    : 'Créez votre première demande d\'exercice'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map(request => {
              const StatusIcon = statusConfig[request.status].icon;
              const PriorityIcon = priorityConfig[request.priority].icon;

              return (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-sm font-mono font-bold bg-muted px-2 py-1 rounded">
                            {request.code}
                          </code>
                          <Badge className={priorityConfig[request.priority].color}>
                            <PriorityIcon className="h-3 w-3 mr-1" />
                            {priorityConfig[request.priority].label}
                          </Badge>
                          <Badge className={statusConfig[request.status].color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[request.status].label}
                          </Badge>
                          {request.category_name && (
                            <Badge variant="outline">
                              {request.category_name}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl">{request.title}</CardTitle>
                        {request.description && (
                          <CardDescription>{request.description}</CardDescription>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingRequest(request)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeletingRequest(request)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium text-green-600">
                          {request.validated_versions_count || 0}
                        </span> version(s) validée(s)
                      </div>
                      <div>
                        <span className="font-medium text-yellow-600">
                          {request.pending_versions_count || 0}
                        </span> en attente
                      </div>
                      <div>
                        <span className="font-medium">
                          {request.linked_task_ids?.length || 0}
                        </span> exercice(s) lié(s)
                      </div>
                      {request.creator && (
                        <div className="ml-auto">
                          Par <span className="font-medium">{request.creator.username}</span>
                        </div>
                      )}
                    </div>
                    {request.notes && (
                      <div className="mt-3 p-3 bg-muted rounded-md text-sm">
                        <p className="font-medium mb-1">Notes :</p>
                        <p className="text-muted-foreground">{request.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Dialogs */}
      <CreateEditDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        categories={categories}
        onSuccess={loadData}
      />

      <CreateEditDialog
        open={!!editingRequest}
        onOpenChange={(open) => !open && setEditingRequest(null)}
        request={editingRequest}
        categories={categories}
        onSuccess={loadData}
      />

      <AlertDialog open={!!deletingRequest} onOpenChange={(open) => !open && setDeletingRequest(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette demande ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La demande "{deletingRequest?.title}" sera définitivement supprimée.
              Les exercices déjà créés ne seront pas affectés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
