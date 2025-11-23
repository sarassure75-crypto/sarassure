import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { getCategoriesWithLicenseStatusForLearner, assignCategoryToLearner, removeCategoryFromLearner } from '@/data/licenses';
import { Shield, Lock, Unlock } from 'lucide-react';

export default function LearnerLicensesManager({ learnerId, learnerName, trainerId, onUpdate }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLicenses();
  }, [learnerId]);

  const loadLicenses = async () => {
    try {
      setLoading(true);
      const data = await getCategoriesWithLicenseStatusForLearner(learnerId);
      setCategories(data);
    } catch (error) {
      console.error('Erreur détaillée:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de charger les catégories',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLicense = async (categoryId, currentStatus, categoryName) => {
    try {
      if (currentStatus) {
        await removeCategoryFromLearner(learnerId, categoryId);
        toast({
          title: 'Catégorie retirée',
          description: `${categoryName} a été retiré pour ${learnerName}`
        });
      } else {
        await assignCategoryToLearner(learnerId, categoryId, trainerId);
        toast({
          title: 'Catégorie accordée',
          description: `${categoryName} a été accordé à ${learnerName}`
        });
      }
      await loadLicenses();
      if (onUpdate) onUpdate();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier l\'accès',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Accès aux Catégories
        </CardTitle>
        <CardDescription>
          Gérez l'accès aux catégories pour {learnerName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Chargement...</p>
        ) : (
          <div className="space-y-2">
            {categories.map(category => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{category.name}</h4>
                    {category.hasLicense ? (
                      <Badge className="text-xs bg-green-600">
                        <Unlock className="w-3 h-3 mr-1" />
                        Accordé
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        Non accordé
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Switch
                  checked={category.hasLicense}
                  onCheckedChange={() => 
                    handleToggleLicense(category.id, category.hasLicense, category.name)
                  }
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
