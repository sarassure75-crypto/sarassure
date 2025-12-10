import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { motion, useAnimation } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { ArrowRight, BookOpen, Zap, Smartphone, Award, Users, CheckCircle, Star } from 'lucide-react';
import PwaInstallCard from '@/components/PwaInstallCard';

const AnimatedCounter = ({ end, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
};

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -10, transition: { duration: 0.2 } }}
  >
    <Card className="h-full text-center hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 backdrop-blur-sm bg-card/50 group">
      <CardHeader>
        <motion.div 
          className="mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 p-4 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300"
          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
        >
          {icon}
        </motion.div>
        <CardTitle className="mt-4 group-hover:text-primary transition-colors">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="leading-relaxed">{description}</CardDescription>
      </CardContent>
    </Card>
  </motion.div>
);

const HomePage = () => {
  const [exercisesCount, setExercisesCount] = React.useState(null);
  const [learnersCount, setLearnersCount] = React.useState(null);
  const [satisfactionPercent, setSatisfactionPercent] = React.useState(null);
  const { toast } = useToast();

  React.useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        // Exercices disponibles: tasks where is_public = true OR count versions
        const { count: tasks_count, error: tasksError } = await supabase
          .from('tasks')
          .select('id', { count: 'exact', head: true })
          .eq('is_public', true);

        if (tasksError) throw tasksError;
        if (!mounted) return;
        setExercisesCount(tasks_count || 0);

        // Apprenants actifs: profiles where role = 'apprenant'
        const { count: learners_count, error: learnersError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'apprenant');

        if (learnersError) throw learnersError;
        setLearnersCount(learners_count || 0);

        // Satisfaction: average rating from satisfaction_responses
        const { data: aggData, error: aggError } = await supabase
          .rpc('avg_satisfaction_rating');

        if (!aggError && aggData && aggData.length > 0) {
          // Some projects return as [{avg: '4.5'}] or scalar
          const avg = Array.isArray(aggData) ? (aggData[0]?.avg || null) : aggData;
          if (avg) {
            const pct = Math.round(parseFloat(avg) / 5 * 100);
            setSatisfactionPercent(pct);
          }
        } else {
          // Fallback: compute via simple select
          const { data, error } = await supabase
            .from('satisfaction_responses')
            .select('rating');
          if (!error && data) {
            const avg = data.reduce((s, r) => s + (r.rating || 0), 0) / Math.max(data.length, 1);
            setSatisfactionPercent(Math.round((avg/5)*100));
          } else {
            setSatisfactionPercent(null);
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des stats:', err);
        toast({ title: 'Erreur stat', description: 'Impossible de charger les statistiques.', variant: 'destructive' });
        setExercisesCount(null);
        setLearnersCount(null);
        setSatisfactionPercent(null);
      }
    };
    fetchStats();
    return () => { mounted = false; };
  }, [toast]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/10">
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(58, 90, 64, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(88, 129, 87, 0.1) 0%, transparent 50%)',
                backgroundSize: '100% 100%',
              }}
            />
          </div>
          
          <div className="container mx-auto text-center px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-block mb-4"
              >
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border border-primary/20">
                  🚀 Formation numérique innovante
                </div>
              </motion.div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                L'autonomie à portée de main.
              </h1>
              <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
                SARASSURE est une application conçue pour guider les utilisateurs pas à pas, en utilisant un langage simple et des pictogrammes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all">
                    <Link to="/learner-login">
                      Accès Apprenant <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild size="lg" variant="outline" className="shadow-lg hover:shadow-xl transition-all">
                    <Link to="/login">Espace Formateur</Link>
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 shadow-lg hover:shadow-xl transition-all">
                    <Link to="/presentation">
                      <Award className="mr-2 h-5 w-5" />
                      Présentation
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-12 bg-gradient-to-r from-primary to-secondary text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  <AnimatedCounter end={exercisesCount || 0} suffix="+" />
                </div>
                <div className="text-sm md:text-base opacity-90">
                  Exercices disponibles
                  <div className="text-xs opacity-80 mt-1">En cours de développement — chiffres initiaux</div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {satisfactionPercent !== null ? (
                    <AnimatedCounter end={satisfactionPercent} suffix="%" />
                  ) : (
                    <span>—</span>
                  )}
                </div>
                <div className="text-sm md:text-base opacity-90">Satisfaction utilisateurs
                  <div className="text-xs opacity-80 mt-1">(sondage disponible via votre profil — en cours de développement)</div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  <AnimatedCounter end={learnersCount || 0} suffix="+" />
                </div>
                <div className="text-sm md:text-base opacity-90">Apprenants actifs
                  <div className="text-xs opacity-80 mt-1">En cours de développement</div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  <AnimatedCounter end={24} suffix="/7" />
                </div>
                <div className="text-sm md:text-base opacity-90">Support disponible</div>
              </motion.div>
            </div>
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