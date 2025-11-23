import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Users, BookOpen, LogIn } from 'lucide-react';

const PwaHomePage = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const LOGO_URL = "/logo_large.png";

  const handleLogout = () => {
    logout();
    navigate('/login?returnToPwa=true'); 
  };


  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100 p-4 text-center"
    >
      <img-replace src={LOGO_URL} alt="SARASSURE Logo" className="h-48 w-48 mb-8 rounded-full shadow-lg border-2 border-white" />
      <h1 className="text-4xl font-bold text-primary mb-8">SARASSURE</h1>

      {isAuthenticated && currentUser ? (
        <>
          <Button 
            onClick={() => navigate('/taches')} 
            className="w-full max-w-sm h-20 text-2xl mb-6 bg-green-500 hover:bg-green-600 text-white shadow-xl transform hover:scale-105 transition-transform duration-200"
          >
            <BookOpen className="mr-4 h-8 w-8" /> Espace Apprenant{currentUser.firstName ? `, ${currentUser.firstName}` : ''}
          </Button>
          
          {(currentUser.role === 'formateur' || currentUser.role === 'administrateur') && (
            <Button 
              onClick={() => navigate('/formateur')} 
              variant="secondary" 
              className="w-full max-w-sm h-16 text-xl mb-6 shadow-lg transform hover:scale-105 transition-transform duration-200"
            >
              <Users className="mr-3 h-7 w-7" /> Suivi Formateur
            </Button>
          )}
          <Button onClick={handleLogout} variant="outline" className="w-full max-w-sm text-lg">
            Déconnexion
          </Button>
        </>
      ) : (
        <Button 
          onClick={() => navigate('/login?returnToPwa=true')} 
          className="w-full max-w-sm h-20 text-2xl mb-6 bg-primary hover:bg-primary/90 text-white shadow-xl transform hover:scale-105 transition-transform duration-200"
        >
          <LogIn className="mr-4 h-8 w-8" /> Se Connecter
        </Button>
      )}

      <p className="mt-12 text-sm text-gray-600">
        Version PWA Installée.
      </p>
    </motion.div>
  );
};

export default PwaHomePage;