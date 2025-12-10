import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { BarChart3, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { getTrainerLicenses } from '@/data/licenses';

export default function TrainerLicensesOverview({ trainerId }) {
  const [licenses, setLicenses] = useState({});
  const [learnerLicenses, setLearnerLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (trainerId) {
      loadLicensesData();
    }
  }, [trainerId]);

  const loadLicensesData = async () => {
    try {
      setLoading(true);

      // Récupérer les licences du formateur avec les catégories
      const licensesData = await getTrainerLicenses(trainerId);

      if (!licensesData || licensesData.length === 0) {
        setLicenses({});
        setLearnerLicenses([]);
        return;
      }

      // Transformer les données
      const licensesMap = {};
      licensesData.forEach(license => {
        const categoryId = license.category_id;
        const categoryName = license.category?.name || `Catégorie ${categoryId}`;
        
        licensesMap[categoryId] = {
          name: categoryName,
          is_active: license.is_active,
          expires_at: license.expires_at,
          created_at: license.created_at
        };
      });

      setLicenses(licensesMap);
      setLearnerLicenses([]);
    } catch (error) {
      console.error('Erreur lors du chargement des licences:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de charger les données',
        variant: 'destructive'
      });
      setLicenses({});
      setLearnerLicenses([]);
    } finally {
      setLoading(false);
    }
  };

  // Compter les licences attribuées par catégorie
  const attributedLicenses = {};
  learnerLicenses.forEach(learner => {
    learner.categories?.forEach(cat => {
      attributedLicenses[cat.categoryId] = (attributedLicenses[cat.categoryId] || 0) + 1;
    });
  });

  return (
    <div className="space-y-6">
      {/* Résumé des licences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Résumé des Licences
          </CardTitle>
          <CardDescription>
            Aperçu des licences achetées et attribuées par catégorie
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Chargement...</p>
          ) : Object.keys(licenses).length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vous n'avez pas encore de licences. Rendez-vous dans l'onglet "Acheter des licences" pour en acquérir.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(licenses).map(([categoryId, licenseInfo]) => {
                const isExpired = licenseInfo.expires_at && new Date(licenseInfo.expires_at) < new Date();
                const isActive = licenseInfo.is_active && !isExpired;
                
                return (
                  <div
                    key={categoryId}
                    className={`p-4 border rounded-lg space-y-3 ${
                      isActive 
                        ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
                        : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">{licenseInfo.name}</h3>
                      <Badge
                        className={isActive ? 'bg-green-600' : 'bg-red-600'}
                        variant="default"
                      >
                        {isActive ? 'Active' : isExpired ? 'Expirée' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Statut</span>
                        <span className="font-medium">
                          {isActive ? '✓ Active' : '✗ Inactive'}
                        </span>
                      </div>
                      
                      {licenseInfo.expires_at && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expire le
                          </span>
                          <span className="font-medium">
                            {new Date(licenseInfo.expires_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Créée le</span>
                        <span className="font-medium">
                          {new Date(licenseInfo.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Détail par apprenant */}
      {learnerLicenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Licences par Apprenant
            </CardTitle>
            <CardDescription>
              Liste détaillée des licences attribuées à chaque apprenant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {learnerLicenses.map(learner => (
                  <div
                    key={learner.id}
                    className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{learner.first_name || 'Apprenant sans nom'}</h4>
                      <Badge variant="outline" className="text-xs">
                        {learner.learner_code}
                      </Badge>
                    </div>

                    {learner.categories && learner.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {learner.categories.map((cat, idx) => (
                          <Badge
                            key={idx}
                            className="text-xs bg-green-600/80"
                          >
                            {cat.categoryName}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Aucune licence attribuée
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
