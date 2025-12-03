import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  Users, Award, BookOpen, Heart, ArrowRight, Smartphone, Download, 
  TrendingUp, CheckCircle, DollarSign, Sparkles, Zap, Target, Lightbulb
} from 'lucide-react';
import { motion } from 'framer-motion';

const AppPresentationPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('learner');

  const categories = {
    learner: {
      icon: Smartphone,
      title: "Apprenant",
      description: "Apprendre l'autonomie numérique",
      color: "from-blue-600 to-blue-700",
      benefits: [
        "Exercices interactifs pas à pas",
        "Guidance progressive et bienveillante",
        "Suivi de votre progression",
        "Pas besoin d'email",
        "Interface simple et intuitive"
      ],
      usecase: "Vous souhaitez maîtriser les outils numériques de façon progressive et sécurisée."
    },
    family: {
      icon: Heart,
      title: "Proche (Famille/Ami)",
      description: "Aider quelqu'un à progresser",
      color: "from-pink-600 to-pink-700",
      benefits: [
        "Créer un compte pour quelqu'un",
        "Suivre sa progression",
        "Lui donner un code d'accès",
        "Accès aux exercices disponibles",
        "Support simple et efficace"
      ],
      usecase: "Vous aidez une personne à apprendre l'informatique et voulez suivre ses progrès."
    },
    organization: {
      icon: Users,
      title: "Association/Entreprise",
      description: "Former un groupe de bénéficiaires",
      color: "from-green-600 to-green-700",
      benefits: [
        "Créer plusieurs comptes apprenant",
        "Gérer un groupe d'utilisateurs",
        "Tableau de suivi collectif",
        "Organiser des sessions de formation",
        "Rapports de progression détaillés"
      ],
      usecase: "Vous animez des formations ou ateliers numériques pour un groupe."
    },
    contributor: {
      icon: Award,
      title: "Contributeur",
      description: "Créer du contenu et gagner",
      color: "from-green-600 to-green-700",
      benefits: [
        "Créer des exercices pédagogiques",
        "Partager vos contenus de qualité",
        "Générer des revenus",
        "Système de points transparent",
        "Distribution de revenus équitable"
      ],
      usecase: "Vous avez de l'expérience en pédagogie et voulez monétiser votre savoir-faire."
    }
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  const currentCategory = categories[activeCategory];
  const CurrentIcon = currentCategory.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-green-500/20 opacity-30"></div>
        
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                L'autonomie à portée de main.
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8">
                SARASSURE est une application conçue pour guider les utilisateurs pas à pas, 
                en utilisant un langage simple et des pictogrammes.
              </p>
              <div className="flex items-center justify-center gap-2 text-slate-400 mb-6">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span>Choisissez votre rôle pour en savoir plus</span>
              </div>
            </motion.div>
          </div>

          {/* Category Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {Object.entries(categories).map(([key, category]) => {
              const Icon = category.icon;
              const isActive = activeCategory === key;
              return (
                <motion.button
                  key={key}
                  onClick={() => handleCategoryChange(key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 rounded-xl transition-all duration-300 transform ${
                    isActive
                      ? `bg-gradient-to-br ${category.color} text-white shadow-lg scale-105`
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${isActive ? '' : ''}`} />
                  <div className="font-semibold">{category.title}</div>
                  <div className="text-xs opacity-80">{category.description}</div>
                </motion.button>
              );
            })}
          </div>

          {/* Category Details */}
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
              <CardHeader className={`bg-gradient-to-r ${currentCategory.color} text-white rounded-t-lg`}>
                <div className="flex items-center gap-3 mb-3">
                  <CurrentIcon className="w-8 h-8" />
                  <div>
                    <CardTitle className="text-2xl">{currentCategory.title}</CardTitle>
                    <CardDescription className="text-slate-100">
                      {currentCategory.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Cas d'usage</h3>
                  <p className="text-slate-300">{currentCategory.usecase}</p>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Avantages</h3>
                  <ul className="space-y-3">
                    {currentCategory.benefits.map((benefit, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 text-slate-300"
                      >
                        <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          activeCategory === 'learner' ? 'text-blue-400' :
                          activeCategory === 'family' ? 'text-pink-400' :
                          activeCategory === 'organization' ? 'text-green-400' :
                          'text-green-400'
                        }`} />
                        <span>{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-700">
                  {activeCategory === 'learner' && (
                    <>
                      <Button
                        onClick={() => navigate('/learner-login')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        size="lg"
                      >
                        Accès Apprenant <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => navigate('/')}
                        variant="outline"
                        className="flex-1 text-slate-300 border-slate-600"
                        size="lg"
                      >
                        En savoir plus
                      </Button>
                    </>
                  )}
                  {activeCategory === 'family' && (
                    <>
                      <Button
                        onClick={() => navigate('/login')}
                        className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
                        size="lg"
                      >
                        Créer un compte <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => navigate('/learner-login')}
                        variant="outline"
                        className="flex-1 text-slate-300 border-slate-600"
                        size="lg"
                      >
                        Accès Apprenant
                      </Button>
                    </>
                  )}
                  {activeCategory === 'organization' && (
                    <>
                      <Button
                        onClick={() => navigate('/login')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        size="lg"
                      >
                        Espace Formateur <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => navigate('/')}
                        variant="outline"
                        className="flex-1 text-slate-300 border-slate-600"
                        size="lg"
                      >
                        Contact
                      </Button>
                    </>
                  )}
                  {activeCategory === 'contributor' && (
                    <>
                      <Button
                        onClick={() => navigate('/login')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        size="lg"
                      >
                        Connexion <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => setActiveCategory('contributor-details')}
                        variant="outline"
                        className="flex-1 text-slate-300 border-slate-600"
                        size="lg"
                      >
                        En savoir plus
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Contributeur Extended Section */}
      {activeCategory === 'contributor' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative container mx-auto px-4 py-16 md:py-24"
        >
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl overflow-hidden">
            <div className="p-8 md:p-16">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-8 h-8" />
                  <span className="text-sm font-semibold uppercase tracking-wider">Système de Rémunération</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Créez, Partagez, Gagnez
                </h2>
                
                <p className="text-lg text-green-100 mb-8">
                  Rejoignez notre communauté de contributeurs et monétisez vos contenus pédagogiques grâce à un système transparent et équitable.
                </p>

                {/* System Details */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/10 rounded-lg p-6 backdrop-blur">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5" />
                      <h3 className="font-semibold">Système de Points</h3>
                    </div>
                    <p className="text-green-100 text-sm">
                      Gagnez des points pour chaque contribution (images, exercices). Plus vous contribuez, plus vous gagnez de points.
                    </p>
                  </div>

                  <div className="bg-white/10 rounded-lg p-6 backdrop-blur">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5" />
                      <h3 className="font-semibold">Paliers de Distribution</h3>
                    </div>
                    <p className="text-green-100 text-sm">
                      À chaque palier de 1000€ de CA, 20% des revenus sont distribués proportionnellement aux contributeurs.
                    </p>
                  </div>

                  <div className="bg-white/10 rounded-lg p-6 backdrop-blur">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-5 h-5" />
                      <h3 className="font-semibold">Pas de Pénalités</h3>
                    </div>
                    <p className="text-green-100 text-sm">
                      Votre solde de points ne peut qu'augmenter. Nous croyons à l'encouragement plutôt qu'à la punition.
                    </p>
                  </div>

                  <div className="bg-white/10 rounded-lg p-6 backdrop-blur">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5" />
                      <h3 className="font-semibold">Modèle Solidaire</h3>
                    </div>
                    <p className="text-green-100 text-sm">
                      Économie solidaire où le succès de la plateforme bénéficie à tous les contributeurs équitablement.
                    </p>
                  </div>
                </div>

                {/* Scoring System */}
                <div className="bg-white/10 rounded-lg p-6 backdrop-blur mb-8">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Comment Gagner des Points
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-green-300 mb-1">1 pt</div>
                      <p className="text-sm text-green-100">Par image capturée</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-300 mb-1">5 pts</div>
                      <p className="text-sm text-green-100">Par exercice de base</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-300 mb-1">+2 pts</div>
                      <p className="text-sm text-green-100">Si plus de 5 tâches</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => navigate('/devenir-contributeur')}
                  className="bg-white text-green-700 hover:bg-green-50 font-semibold text-lg px-8 py-3"
                  size="lg"
                >
                  Voir les détails complets
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Features Section */}
      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          Pourquoi SARASSURE ?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Smartphone,
              title: "Simple et Intuitif",
              description: "Interface épurée, langage clair, pictogrammes explicites"
            },
            {
              icon: BookOpen,
              title: "Pédagogie Bienveillante",
              description: "Pas à pas progressif, sans jugement, adapté à tous"
            },
            {
              icon: TrendingUp,
              title: "Suivi en Temps Réel",
              description: "Progression tracée, analyses détaillées, motivation constante"
            }
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-slate-800/50 rounded-xl p-8 border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <Icon className="w-12 h-12 text-green-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 md:p-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Choisissez votre rôle et découvrez comment SARASSURE peut transformer votre apprentissage ou vos formations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/learner-login')}
              className="bg-white text-green-700 hover:bg-green-50 font-semibold text-lg px-8"
              size="lg"
            >
              Accès Apprenant
            </Button>
            <Button
              onClick={() => navigate('/login')}
              className="bg-white/20 border border-white text-white hover:bg-white/30 font-semibold text-lg px-8"
              variant="outline"
              size="lg"
            >
              Autres accès
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppPresentationPage;
