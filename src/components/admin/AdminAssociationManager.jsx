import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import {
  getUnassignedLearners,
  assignTrainerToLearner,
  unassignTrainerFromLearner,
  getAllUsersByRole,
  getLearnersByTrainer,
} from '@/data/users';
import { Link, Users2, UserCheck, UserX, RefreshCw, Loader2 } from 'lucide-react';

const AdminAssociationManager = () => {
  const [trainers, setTrainers] = useState([]);
  const [unassignedLearners, setUnassignedLearners] = useState([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState(null);
  const [assignedLearners, setAssignedLearners] = useState([]);
  const [selectedLearnerToAssign, setSelectedLearnerToAssign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const { toast } = useToast();

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [trainersData, unassignedLearnersData] = await Promise.all([
        getAllUsersByRole('formateur'),
        getUnassignedLearners(),
      ]);
      setTrainers(trainersData);
      setUnassignedLearners(unassignedLearnersData);
      if (trainersData.length > 0) {
        const initialTrainerId = trainersData[0].id;
        setSelectedTrainerId(initialTrainerId);
      }
    } catch (error) {
      toast({
        title: 'Erreur de chargement',
        description: 'Impossible de charger les données.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchAssignedLearners = useCallback(
    async (trainerId) => {
      if (!trainerId) return;
      setIsLoading(true);
      try {
        const learners = await getLearnersByTrainer(trainerId);
        setAssignedLearners(learners);
      } catch (error) {
        toast({
          title: 'Erreur',
          description: `Impossible de charger les apprenants pour ce formateur.`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (selectedTrainerId) {
      fetchAssignedLearners(selectedTrainerId);
    } else {
      setAssignedLearners([]);
    }
  }, [selectedTrainerId, fetchAssignedLearners]);

  const handleAssign = async () => {
    if (!selectedTrainerId || !selectedLearnerToAssign) {
      toast({
        title: 'Sélection requise',
        description: 'Veuillez sélectionner un formateur et un apprenant.',
        variant: 'destructive',
      });
      return;
    }
    setIsAssigning(true);
    try {
      await assignTrainerToLearner(selectedLearnerToAssign, selectedTrainerId);
      toast({
        title: 'Association réussie !',
        description: "L'apprenant a été assigné au formateur.",
      });
      setSelectedLearnerToAssign(null);
      // Refresh data
      const unassigned = await getUnassignedLearners();
      setUnassignedLearners(unassigned);
      await fetchAssignedLearners(selectedTrainerId);
    } catch (error) {
      toast({ title: "Erreur d'assignation", description: error.message, variant: 'destructive' });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassign = async (learnerId) => {
    try {
      await unassignTrainerFromLearner(learnerId);
      toast({
        title: 'Dissociation réussie !',
        description: "L'apprenant n'est plus assigné à ce formateur.",
      });
      // Refresh data
      const unassigned = await getUnassignedLearners();
      setUnassignedLearners(unassigned);
      await fetchAssignedLearners(selectedTrainerId);
    } catch (error) {
      toast({
        title: 'Erreur de dissociation',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Link className="mr-2 h-5 w-5" />
            Associer un Apprenant
          </CardTitle>
          <CardDescription>
            Sélectionnez un formateur, puis un apprenant à lui assigner.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Formateur</label>
            <Select onValueChange={setSelectedTrainerId} value={selectedTrainerId || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un formateur" />
              </SelectTrigger>
              <SelectContent>
                {trainers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.first_name} ({t.pseudo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Apprenant non assigné</label>
            <Select
              onValueChange={setSelectedLearnerToAssign}
              value={selectedLearnerToAssign || ''}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un apprenant" />
              </SelectTrigger>
              <SelectContent>
                {unassignedLearners.length > 0 ? (
                  unassignedLearners.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.first_name} ({l.learner_code})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    Aucun apprenant disponible
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleAssign}
            disabled={!selectedTrainerId || !selectedLearnerToAssign || isAssigning}
          >
            {isAssigning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserCheck className="mr-2 h-4 w-4" />
            )}
            Assigner l'apprenant
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users2 className="mr-2 h-5 w-5" />
              Apprenants Assignés
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (selectedTrainerId) fetchAssignedLearners(selectedTrainerId);
              }}
              disabled={!selectedTrainerId || isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
          <CardDescription>
            {selectedTrainerId
              ? `Liste des apprenants assignés à ${
                  trainers.find((t) => t.id === selectedTrainerId)?.first_name || ''
                }`
              : 'Sélectionnez un formateur pour voir ses apprenants.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg h-[300px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom de l'apprenant</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : selectedTrainerId && assignedLearners.length > 0 ? (
                  assignedLearners.map((learner) => (
                    <TableRow key={learner.id}>
                      <TableCell className="font-medium">{learner.first_name}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleUnassign(learner.id)}
                        >
                          <UserX className="mr-2 h-4 w-4" /> Dissocier
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      {selectedTrainerId
                        ? 'Aucun apprenant assigné.'
                        : 'Veuillez sélectionner un formateur.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAssociationManager;
