import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Award, 
  DollarSign, 
  TrendingUp, 
  Gift, 
  Users, 
  Zap, 
  CheckCircle, 
  HelpCircle,
  ArrowRight,
  Target,
  Sparkles,
  Shield,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ContributorInfoPage = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: DollarSign,
      title: "Système de points équitable",
      description: "Gagnez des points selon la complexité et la qualité de vos contributions"
    },
    {
      icon: TrendingUp,
      title: "Paliers de distribution",
      description: "20% du CA réparti entre contributeurs à chaque palier de 1000€ atteint"
    },
    {
      icon: Award,
      title: "Badges et récompenses",
      description: "Gagnez des badges de reconnaissance pour vos contributions"
    },
    {
      icon: Users,
      title: "Communauté active",
      description: "Rejoignez une communauté de créateurs passionnés"
    },
    {
      icon: Zap,
      title: "Outils professionnels",
      description: "Accédez à des outils de création d'exercices performants"
    },
    {
      icon: Shield,
      title: "Contenu protégé",
      description: "Vos créations sont protégées et attribuées à votre nom"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Créez du contenu",
      description: "Créez des exercices pédagogiques et téléchargez des images de qualité"
    },
    {
      step: "2",
      title: "Validez votre contenu",
      description: "Votre contenu est vérifié pour garantir la qualité de la plateforme"
    },
    {
      step: "3",
      title: "Gagnez des points",
      description: "Accumulez des points selon la complexité et la qualité de vos contributions"
    },
    {
      step: "4",
      title: "Recevez votre part",
      description: "À chaque palier de 1000€ de CA, 20% sont distribués proportionnellement aux points"
    }
  ];

  const faqItems = [
    {
      question: "Comment fonctionne le système de points ?",
      answer: "Vous gagnez des points selon la complexité de vos contributions : 1 point par image, 5 points par exercice de base, avec un bonus si plus de 5 tâches ou versions supplémentaires. Votre rémunération est proportionnelle à vos points par rapport au total de la communauté."
    },
    {
      question: "C'est quoi ce modèle d'économie solidaire ?",
      answer: "C'est un modèle où 20% des revenus totaux de la plateforme sont répartis entre tous les contributeurs proportionnellement à leurs points. Vous ne vendez pas individuellement : vous participez aux dividendes collectifs. Le succès de la plateforme bénéficie à tous les contributeurs équitablement."
    },
    {
      question: "Qu'est-ce qu'un palier de distribution ?",
      answer: "Un palier de 1000€ correspond au chiffre d'affaires généré par la plateforme. Quand un palier est atteint, 20% (200€) sont distribués entre tous les contributeurs proportionnellement à leurs points. Important : aucune rémunération n'est versée avant que le premier palier de 1000€ ne soit atteint."
    },
    {
      question: "Quand puis-je retirer mes gains ?",
      answer: "Les rémunérations sont versées 15 jours après l'atteinte d'un palier de 1000€ de CA, avec un minimum de 10€ par contributeur. Les montants inférieurs à 10€ sont reportés au palier suivant. Paiement uniquement via PayPal."
    },
    {
      question: "Qui valide mes contributions ?",
      answer: "L'équipe d'administration vérifie la qualité, la pertinence pédagogique et l'originalité de chaque contribution avant publication."
    },
    {
      question: "Puis-je modifier mes contenus après publication ?",
      answer: "Oui, vous pouvez modifier vos exercices et images à tout moment depuis votre espace contributeur. Les modifications sont soumises à validation."
    },
    {
      question: "Comment sont calculés les points ?",
      answer: "Images : 1 point par nouvelle capture. Exercices : 5 points de base + 2 points si plus de 5 tâches + 3 points par version additionnelle significative. Pas de bonus de qualité (images compressées) ni bonus d'engagement."
    },
    {
      question: "Y a-t-il des pénalités ?",
      answer: "Oui : -2 points pour contribution rejetée, -5 points pour inclusion de données personnelles, -3 points par erreur signalée au-delà de 2 erreurs. Un taux d'erreur élevé peut entraîner une suspension du statut contributeur."
    },
    {
      question: "Comment est calculée ma rémunération ?",
      answer: "Formule : (Vos Points / Total Points Communauté) × (CA atteint × 20%). Exemple : Si vous avez 150 points sur 500 points totaux et que le palier de 1000€ est atteint, vous recevez (150/500) × 200€ = 60€."
    },
    {
      question: "Mes contenus sont-ils protégés ?",
      answer: "Oui, chaque contenu est lié à votre compte contributeur. Votre nom apparaît comme auteur et vous conservez vos droits d'auteur."
    },
    {
      question: "Comment devenir contributeur ?",
      answer: "Contactez l'équipe via le formulaire de contact en indiquant votre motivation. Après validation de votre profil, vous recevrez vos accès contributeur."
    },
    {
      question: "Mes contenus sont-ils protégés ?",
      answer: "Oui, vos droits de propriété intellectuelle sont cédés à la plateforme qui les protège. Cependant, aucun nom ou auteur n'est affiché sur les exercices ou images dans l'application pédagogique pour garantir une utilisation objective et impartiale du contenu. Seul votre pseudonyme apparaît dans le classement des contributeurs."
    },
    {
      question: "Y a-t-il un quota minimum de contributions ?",
      answer: "Non, vous contribuez à votre rythme. Plus vous créez de contenu de qualité, plus vous avez de chances de générer des revenus."
    }
  ];

  const stats = [
    { label: "Contributeurs actifs", value: "50+", icon: Users },
    { label: "Exercices créés", value: "200+", icon: Award },
    { label: "Images disponibles", value: "500+", icon: Sparkles },
    { label: "Formateurs satisfaits", value: "100+", icon: Heart }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Devenez contributeur</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Créez, Partagez, Gagnez
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-2xl mx-auto">
              Rejoignez notre communauté de contributeurs et monétisez vos contenus pédagogiques
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-green-700 hover:bg-green-50 font-semibold text-lg px-8"
                onClick={() => navigate('/contact')}
              >
                Devenir contributeur
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-white text-white hover:bg-white/10 text-lg px-8"
                onClick={() => navigate('/login')}
              >
                Se connecter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center shadow-lg">
              <CardContent className="pt-6">
                <stat.icon className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi devenir contributeur ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Profitez de nombreux avantages en rejoignant notre plateforme
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  <CardDescription className="text-base">
                    {benefit.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-green-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Comment ça fonctionne ?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Quatre étapes simples pour commencer à gagner
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto shadow-lg">
                      {item.step}
                    </div>
                    {index < howItWorks.length - 1 && (
                      <ArrowRight className="hidden lg:block absolute top-1/2 -right-12 transform -translate-y-1/2 text-green-300 w-8 h-8" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue System Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Target className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Système de points et rémunération
            </h2>
            <p className="text-xl text-gray-600">
              Comprenez exactement comment fonctionne le système de distribution
            </p>
          </div>

          <div className="space-y-6">
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  Système de points
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Vous gagnez des <span className="font-bold text-green-600">points selon la valeur</span> de chaque contribution.
                </p>
                <div className="space-y-3">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="font-medium mb-2">📸 Images</div>
                    <div className="text-sm space-y-1">
                      <div>• 1 point par nouvelle capture</div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="font-medium mb-2">📝 Exercices</div>
                    <div className="text-sm space-y-1">
                      <div>• 5 points de base</div>
                      <div>• +2 points si plus de 5 tâches</div>
                      <div>• +3 points par version supplémentaire</div>
                    </div>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <div className="font-medium mb-2 text-amber-900">ℹ️ Modèle solidaire</div>
                    <div className="text-sm text-amber-800">
                      Les points ne représentent pas des ventes individuelles. Vous participez à une économie collective où 20% des revenus totaux sont distribués proportionnellement à vos points, indépendamment de qui utilise votre contenu.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  Économie solidaire et distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Vous participez à un modèle d'<span className="font-bold text-green-600">économie solidaire</span> où 20% des revenus de la plateforme sont partagés entre contributeurs.
                </p>
                <div className="bg-green-50 p-4 rounded-lg mb-4 border-l-4 border-green-600">
                  <p className="text-sm text-gray-700">
                    <strong>Pas de vente individuelle :</strong> Vous ne vendez pas votre contenu directement. Les formateurs achètent des licences à la plateforme, et 20% du CA total sont répartis entre tous les contributeurs au prorata de leurs points.
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <div className="font-medium mb-3">Formule de calcul :</div>
                  <div className="bg-white p-3 rounded border-2 border-green-200 text-sm font-mono">
                    (Vos Points / Total Points) × (CA × 20%)
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                    <div>
                      <div className="font-medium">Palier 1 - 1000€ CA</div>
                      <div className="text-sm text-gray-600">200€ partagés entre tous les contributeurs</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                    <div>
                      <div className="font-medium">Palier 2 - 2000€ CA</div>
                      <div className="text-sm text-gray-600">200€ supplémentaires (total 400€ distribués)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                    <div>
                      <div className="font-medium">Tous bénéficient ensemble</div>
                      <div className="text-sm text-gray-600">Le succès de la plateforme profite à toute la communauté</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                  <p className="text-sm text-gray-700">
                    <strong>Exemple :</strong> Plateforme atteint 1000€ CA, vous avez 150 points sur 500 au total.
                    <br />Votre part : (150/500) × 200€ = <strong className="text-green-600">60€ de dividendes</strong>
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    Minimum de versement : 10€. Montants inférieurs reportés au palier suivant.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <HelpCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Questions fréquentes
              </h2>
              <p className="text-xl text-gray-600">
                Trouvez les réponses à vos questions
              </p>
            </div>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                      {item.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0 shadow-xl">
            <CardContent className="p-8 md:p-12 text-center">
              <Gift className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Prêt à commencer ?
              </h2>
              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                Rejoignez notre communauté de contributeurs et commencez à monétiser votre créativité dès aujourd'hui
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-green-700 hover:bg-green-50 font-semibold text-lg px-8"
                  onClick={() => navigate('/contact')}
                >
                  Devenir contributeur
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-transparent border-white text-white hover:bg-white/10 text-lg px-8"
                  onClick={() => navigate('/login')}
                >
                  Se connecter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContributorInfoPage;
