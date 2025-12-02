import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Zap, Smartphone, Award } from 'lucide-react';
import PwaInstallCard from '@/components/PwaInstallCard';

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className="h-full text-center hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
          {icon}
        </div>
        <CardTitle className="mt-4">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  </motion.div>
);

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 bg-gradient-to-br from-background to-primary/10">
          <div className="container mx-auto text-center px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
                L'autonomie à portée de main.
              </h1>
              <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
                SARASSURE est une application conçue pour guider les utilisateurs pas à pas, en utilisant un langage simple et des pictogrammes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/learner-login">
                    Accès Apprenant <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/login">Espace Formateur</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  <Link to="/devenir-contributeur">
                    <Award className="mr-2 h-5 w-5" />
                    Devenir Contributeur
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Une application pensée pour vous</h2>
              <p className="text-muted-foreground mt-2">Trois piliers pour un apprentissage réussi.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<BookOpen className="h-8 w-8 text-primary" />}
                title="Apprentissage Pas à Pas"
                description="Des guides clairs pour chaque action, avec des images et des instructions simples."
                delay={0.1}
              />
              <FeatureCard
                icon={<Zap className="h-8 w-8 text-primary" />}
                title="Langage Simplifié"
                description="Des explications en Facile à Lire et à Comprendre (FALC) avec des pictogrammes."
                delay={0.2}
              />
              <PwaInstallCard delay={0.3} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;