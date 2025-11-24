import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, LogIn } from 'lucide-react';

const PwaHomePage = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const LOGO_URL = "/logo_large.png";

  const handleLogout = () => {
    logout();
    navigate('/learner-login'); 
  };


  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100 p-4 text-center"
    >
      <img src={LOGO_URL} alt="SARASSURE Logo" className="h-48 w-48 mb-8 rounded-full shadow-lg border-2 border-white" />
      <h1 className="text-4xl font-bold text-primary mb-8">SARASSURE</h1>

      {isAuthenticated && currentUser ? (
        <>
          <Button 
            onClick={() => navigate('/taches')} 
            className="w-full max-w-sm h-20 text-2xl mb-6 bg-green-500 hover:bg-green-600 text-white shadow-xl transform hover:scale-105 transition-transform duration-200"
          >
            <BookOpen className="mr-4 h-8 w-8" /> Mes Exercices{currentUser.firstName ? `, ${currentUser.firstName}` : ''}
          </Button>
          
          <Button onClick={handleLogout} variant="outline" className="w-full max-w-sm text-lg">
            Déconnexion
          </Button>
        </>
      ) : (
        <Button 
          onClick={() => navigate('/learner-login')} 
          className="w-full max-w-sm h-20 text-2xl mb-6 bg-primary hover:bg-primary/90 text-white shadow-xl transform hover:scale-105 transition-transform duration-200"
        >
          <LogIn className="mr-4 h-8 w-8" /> Se Connecter (Apprenant)
        </Button>
      )}

      <p className="mt-12 text-sm text-gray-600">
        Version PWA Installée - Espace Apprenant
      </p>
    </motion.div>
  );
};

export default PwaHomePage;