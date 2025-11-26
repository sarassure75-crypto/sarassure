import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { BarChart3, AlertCircle, CheckCircle2 } from 'lucide-react';

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

      // Récupérer les licences achetées par le formateur
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('license_purchases')
        .select('*')
        .eq('trainer_id', trainerId);

      if (purchasesError) throw purchasesError;

      // Compter les licences par catégorie
      const licenseCounts = {};
      purchasesData?.forEach(purchase => {
        const categoryId = purchase.category_id;
        licenseCounts[categoryId] = (licenseCounts[categoryId] || 0) + purchase.quantity;
      });

      setLicenses(licenseCounts);
      setLearnerLicenses([]); // Pas d'apprenants détaillés pour maintenant
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de charger les données',
        variant: 'destructive'
      });
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
                Vous n'avez pas encore acheté de licences. Rendez-vous dans l'onglet "Acheter des licences" pour en acquérir.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(licenses).map(([categoryId, total]) => {
                const attributed = attributedLicenses[categoryId] || 0;
                const remaining = total - attributed;
                const percentage = total > 0 ? Math.round((attributed / total) * 100) : 0;

                return (
                  <div
                    key={categoryId}
                    className="p-4 border rounded-lg space-y-3 bg-gradient-to-br from-muted/50 to-muted/20"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">Catégorie {categoryId}</h3>
                      <Badge
                        variant={remaining > 0 ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {remaining > 0 ? 'Disponibles' : 'Épuisées'}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Achetées</span>
                        <span className="font-bold">{total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Attribuées</span>
                        <span className="font-bold text-green-600">{attributed}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Disponibles</span>
                        <span className="font-bold text-blue-600">{remaining}</span>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-green-600 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">{percentage}% attribuées</p>
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
