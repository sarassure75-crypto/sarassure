import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, Trash2, Mail, RefreshCw, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { fetchErrorReports, deleteErrorReport, updateErrorReport } from '@/data/errorReports';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link } from 'react-router-dom';

const AdminErrorReportViewer = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const loadReports = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      const data = await fetchErrorReports(forceRefresh);
      setReports(data || []);
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de charger les rapports d\'erreurs.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleDelete = async (reportId) => {
    try {
      await deleteErrorReport(reportId);
      toast({ title: 'Rapport supprimé', description: 'Le rapport a été supprimé avec succès.', variant: 'destructive' });
      loadReports(true);
    } catch (error) {
      toast({ title: 'Erreur', description: 'La suppression du rapport a échoué.', variant: 'destructive' });
    }
  };

  const handleMarkAsSent = async (reportId) => {
    try {
      await updateErrorReport(reportId, { is_sent: true, sent_at: new Date().toISOString() });
      toast({ title: 'Marqué comme traité', description: 'Le rapport a été marqué comme traité.', className: 'bg-green-600 text-white' });
      loadReports(true);
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le rapport.', variant: 'destructive' });
    }
  };

  const openReportDetails = (report) => {
    setSelectedReport(report);
    setIsDialogOpen(true);
  };

  const sortedReports = useMemo(() => {
    return reports.sort((a, b) => new Date(b.report_date) - new Date(a.report_date));
  }, [reports]);
  
  const sentReportsCount = useMemo(() => reports.filter(r => r.is_sent).length, [reports]);
  const unsentReportsCount = useMemo(() => reports.filter(r => !r.is_sent).length, [reports]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Visionneuse des Rapports d'Erreurs</span>
           <Button variant="ghost" size="icon" onClick={() => loadReports(true)} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        <CardDescription>
            {unsentReportsCount} rapport(s) non traité(s) et {sentReportsCount} rapport(s) traité(s).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Statut</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Tâche / Version</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="h-24 text-center">Chargement...</TableCell></TableRow>
            ) : sortedReports.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Aucun rapport d'erreur.</TableCell></TableRow>
            ) : sortedReports.map((report) => (
              <TableRow key={report.id} className={!report.is_sent ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}>
                <TableCell>
                  <Badge variant={report.is_sent ? 'default' : 'secondary'} className={report.is_sent ? 'bg-green-600' : ''}>
                    {report.is_sent ? 'Traité' : 'Non traité'}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{report.category || 'N/A'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                    <div>{report.exercise_title || 'Tâche non spécifiée'}</div>
                    <div className="text-xs">{report.version_name ? `${report.version_name} (${report.version_android || 'N/A'})` : ''}</div>
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(report.report_date), { addSuffix: true, locale: fr })}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openReportDetails(report)} title="Voir les détails">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {!report.is_sent && (
                    <Button variant="ghost" size="icon" onClick={() => handleMarkAsSent(report.id)} title="Marquer comme traité">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </Button>
                  )}
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" title="Supprimer">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer ce rapport ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  Cette action est irréversible. Le rapport sera définitivement supprimé.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(report.id)} className="bg-destructive hover:bg-destructive/80">Supprimer</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Détails du Rapport d'Erreur</DialogTitle>
              <DialogDescription>
                Rapport de {selectedReport?.user_first_name || 'Anonyme'} du {selectedReport ? new Date(selectedReport.report_date).toLocaleString('fr-FR') : ''}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-right text-muted-foreground">Catégorie</p>
                <p className="col-span-3 font-semibold">{selectedReport?.category}</p>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <p className="text-right text-muted-foreground pt-1">Description</p>
                <p className="col-span-3 bg-muted p-3 rounded-md">{selectedReport?.description}</p>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-right text-muted-foreground">Tâche</p>
                <p className="col-span-3">{selectedReport?.exercise_title || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-right text-muted-foreground">Version</p>
                <p className="col-span-3">{selectedReport?.version_name ? `${selectedReport.version_name} (Android ${selectedReport.version_android})` : 'N/A'}</p>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-right text-muted-foreground">Étape N°</p>
                <p className="col-span-3">{selectedReport?.step_index || 'N/A'}</p>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-right text-muted-foreground">App Version</p>
                <p className="col-span-3">{selectedReport?.app_version}</p>
              </div>
            </div>
            <DialogFooter>
             {selectedReport?.task_id && selectedReport?.version_id && (
                <Button asChild variant="outline">
                    <Link to={`/admin/preview/tache/${selectedReport.task_id}/version/${selectedReport.version_id}?stepIndex=${(selectedReport.step_index || 1) - 1}`}>Voir l'étape</Link>
                </Button>
              )}
              <DialogClose asChild>
                <Button>Fermer</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminErrorReportViewer;