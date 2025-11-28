import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ListChecks, 
  Search, 
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { fetchExerciseRequests } from '@/data/exerciseRequests';

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

export default function ExerciseRequestsList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchExerciseRequests({ 
        // N'afficher que les demandes actives (pas completed ni cancelled)
      });
      setRequests(data.filter(r => r.status !== 'completed' && r.status !== 'cancelled'));
    } catch (error) {
      console.error('Error loading exercise requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    if (!searchTerm) return requests;
    
    return requests.filter(req => 
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [requests, searchTerm]);

  // Grouper par priorité
  const priorityGroups = useMemo(() => {
    const groups = {
      high: filteredRequests.filter(r => r.priority === 'high'),
      normal: filteredRequests.filter(r => r.priority === 'normal'),
      low: filteredRequests.filter(r => r.priority === 'low')
    };
    return groups;
  }, [filteredRequests]);

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
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <ListChecks className="h-8 w-8 text-primary" />
          Liste des exercices à créer
        </h2>
        <p className="text-muted-foreground mt-1">
          Consultez les exercices demandés. Utilisez le code lors de la création.
        </p>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Comment utiliser cette liste ?</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Choisissez un exercice à créer (priorité "Prioritaire" recommandée)</li>
                <li>Notez le <strong>code de référence</strong> (ex: EX-2025-001)</li>
                <li>Lors de la création, indiquez ce code pour lier votre contribution</li>
                <li>Votre exercice sera automatiquement associé à la demande</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par titre, code, catégorie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Listes par priorité */}
      <ScrollArea className="h-[calc(100vh-400px)]">
        <div className="space-y-6">
          {Object.entries(priorityGroups).map(([priority, items]) => {
            if (items.length === 0) return null;

            const PriorityIcon = priorityConfig[priority].icon;

            return (
              <div key={priority}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <PriorityIcon className={`h-5 w-5 ${priorityConfig[priority].color.split(' ')[0]}`} />
                  {priorityConfig[priority].label}
                  <Badge variant="secondary">{items.length}</Badge>
                </h3>

                <div className="grid gap-4">
                  {items.map(request => {
                    const StatusIcon = statusConfig[request.status].icon;

                    return (
                      <Card key={request.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <code className="text-sm font-mono font-bold bg-primary/10 text-primary px-3 py-1 rounded border-2 border-primary/20">
                                  {request.code}
                                </code>
                                <Badge className={statusConfig[request.status].color}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusConfig[request.status].label}
                                </Badge>
                                {request.category && (
                                  <Badge variant="outline">
                                    {request.category.name}
                                  </Badge>
                                )}
                              </div>
                              <CardTitle className="text-lg">{request.title}</CardTitle>
                              {request.description && (
                                <CardDescription className="text-sm">
                                  {request.description}
                                </CardDescription>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-600">
                                {request.validated_versions_count || 0}
                              </span> validée(s)
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-yellow-600" />
                              <span className="font-medium text-yellow-600">
                                {request.pending_versions_count || 0}
                              </span> en attente
                            </div>
                            <div className="flex items-center gap-1">
                              <ListChecks className="h-4 w-4" />
                              <span className="font-medium">
                                {request.linked_task_ids?.length || 0}
                              </span> exercice(s) lié(s)
                            </div>
                          </div>

                          {request.notes && (
                            <div className="mt-3 p-3 bg-muted rounded-md text-sm">
                              <p className="font-medium mb-1">Consignes :</p>
                              <p className="text-muted-foreground">{request.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredRequests.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ListChecks className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Aucun exercice à créer</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm 
                    ? 'Aucun résultat pour cette recherche'
                    : 'Toutes les demandes sont terminées ou annulées'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
