import React, { useState, useEffect } from 'react';
import AdminLearnerManager from './AdminLearnerManager';
import AdminTrainerManager from './AdminTrainerManager';
import AdminAssociationManager from './AdminAssociationManager';
import AdminLicenseManager from './AdminLicenseManager';
import AdminContributorManager from './AdminContributorManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTrainers } from '@/data/users';
import { useToast } from '@/components/ui/use-toast';

const AdminUserManagement = () => {
  const [trainers, setTrainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadTrainers = async () => {
    try {
      setIsLoading(true);
      const data = await getTrainers();
      setTrainers(data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les formateurs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrainers();
  }, []);

  return (
    <Tabs defaultValue="learners" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="learners">Apprenants</TabsTrigger>
        <TabsTrigger value="trainers">Formateurs</TabsTrigger>
        <TabsTrigger value="contributors">Contributeurs</TabsTrigger>
        <TabsTrigger value="associations">Associations</TabsTrigger>
        <TabsTrigger value="licenses">Licences</TabsTrigger>
      </TabsList>
      <TabsContent value="learners">
        <AdminLearnerManager />
      </TabsContent>
      <TabsContent value="trainers">
        <AdminTrainerManager onTrainerCreated={loadTrainers} />
      </TabsContent>
      <TabsContent value="contributors">
        <AdminContributorManager onContributorCreated={() => {}} />
      </TabsContent>
      <TabsContent value="associations">
        <AdminAssociationManager />
      </TabsContent>
      <TabsContent value="licenses">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Chargement...</p>
        ) : (
          <AdminLicenseManager trainers={trainers} />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default AdminUserManagement;
