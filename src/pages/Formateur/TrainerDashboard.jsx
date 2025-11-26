import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, HelpCircle, User } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function TrainerDashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalLearners: 0,
    activeLicenses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadStats();
    }
  }, [currentUser]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Total learners linked to this trainer
      const { count: learners } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('trainer_id', currentUser.id)
        .eq('role', 'apprenant');

      // Active licenses for this trainer
      const { count: licenses } = await supabase
        .from('learner_licenses')
        .select('*', { count: 'exact', head: true })
        .eq('trainer_id', currentUser.id)
        .eq('is_active', true);

      setStats({
        totalLearners: learners || 0,
        activeLicenses: licenses || 0,
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardItems = [
    {
      title: 'Apprenants',
      description: 'Gérez vos apprenants',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
      route: '/compte-formateur',
      stat: stats.totalLearners,
    },
    {
      title: 'Acheter des Licences',
      description: 'Achetez des licences pour vos apprenants',
      icon: CreditCard,
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200',
      route: '/compte-formateur',
      stat: stats.activeLicenses,
    },
    {
      title: 'FAQ Formateurs',
      description: 'Consultez les questions fréquentes',
      icon: HelpCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-200',
      route: '/formateur/faq',
    },
    {
      title: 'Mon Profil',
      description: 'Gérez votre profil et vos paramètres',
      icon: User,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200',
      route: '/compte-formateur',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            Dashboard Formateur
          </h1>
          <p className="text-gray-600 mt-2">Gérez vos apprenants et vos licences</p>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Apprenants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{stats.totalLearners}</div>
              <p className="text-xs text-blue-600 mt-1">Apprenants liés à votre compte</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-900 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Licences Actives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">{stats.activeLicenses}</div>
              <p className="text-xs text-green-600 mt-1">Licences en cours</p>
            </CardContent>
          </Card>
        </div>

        {/* Menu principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboardItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.route} to={item.route}>
                <Card className={`border-2 hover:shadow-lg transition-all h-full cursor-pointer ${item.bgColor || 'border-gray-200'}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Icon className={`h-5 w-5 ${item.color}`} />
                          {item.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {item.description}
                        </CardDescription>
                      </div>
                      {item.stat !== undefined && (
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${item.color}`}>
                            {item.stat}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
