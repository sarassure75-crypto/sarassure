import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { getCategoriesWithLicenseStatus, activateLicense, deactivateLicense } from '@/data/licenses';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Clock, Infinity } from 'lucide-react';

export default function AdminLicenseManager({ trainers }) {
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedTrainer) {
      loadCategories();
    }
  }, [selectedTrainer]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategoriesWithLicenseStatus(selectedTrainer);
      setCategories(data);
      if (data.length === 0) {
        toast({
          title: 'Attention',
          description: 'Aucune catégorie trouvée. Vérifier que la migration SQL a été exécutée et les catégories ajoutées en base.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erreur détaillée:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de charger les catégories. Vérifier la base de données.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLicense = async (categoryId, currentStatus) => {
    try {
      if (currentStatus) {
        await deactivateLicense(selectedTrainer, categoryId);
        toast({
          title: 'Licence désactivée',
          description: 'La licence a été retirée avec succès'
        });
      } else {
        await activateLicense(selectedTrainer, categoryId, null); // null = à vie
        toast({
          title: 'Licence activée',
          description: 'La licence a été accordée avec succès'
        });
      }
      await loadCategories();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier la licence',
        variant: 'destructive'
      });
    }
  };

  const trainer = trainers.find(t => t.id === selectedTrainer);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Gestion des Licences par Catégorie
        </CardTitle>
        <CardDescription>
          Gérez les licences des formateurs. La catégorie "Tactile" reste gratuite pour tous.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sélection du formateur */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Sélectionner un formateur</label>
          <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un formateur..." />
            </SelectTrigger>
            <SelectContent>
              {trainers.map(trainer => (
                <SelectItem key={trainer.id} value={trainer.id}>
                  {trainer.first_name} ({trainer.pseudo}) - Code: {trainer.trainer_code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Liste des catégories */}
        {selectedTrainer && (
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Chargement...</p>
            ) : (
              <>
                {trainer && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium">
                      Formateur: {trainer.first_name} ({trainer.pseudo})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Code: {trainer.trainer_code}
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  {categories.map(category => {
                    const isTactile = category.name?.toLowerCase() === 'tactile';
                    
                    return (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{category.name}</h4>
                            {isTactile && (
                              <Badge variant="secondary" className="text-xs">
                                Gratuit
                              </Badge>
                            )}
                            {category.hasLicense && (
                              <Badge className="text-xs bg-green-600">
                                <Shield className="w-3 h-3 mr-1" />
                                Actif
                              </Badge>
                            )}
                          </div>
                          {category.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {category.description}
                            </p>
                          )}
                          {category.expiresAt ? (
                            <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              Expire le: {new Date(category.expiresAt).toLocaleDateString('fr-FR')}
                            </p>
                          ) : category.hasLicense ? (
                            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                              <Infinity className="w-3 h-3" />
                              Licence à vie
                            </p>
                          ) : null}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {isTactile ? (
                            <Badge variant="outline" className="text-xs">
                              Toujours accessible
                            </Badge>
                          ) : (
                            <Switch
                              checked={category.hasLicense}
                              onCheckedChange={() => handleToggleLicense(category.id, category.hasLicense)}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
