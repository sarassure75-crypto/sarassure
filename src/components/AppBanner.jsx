import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Menu, Home, BookOpen, User, LogOut, Shield, UserCog, MessageSquare as MessageSquareQuestion, BarChart3, Bug } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES } from '@/data/users';

const NavLink = ({ to, icon: Icon, children, onClick }) => (
  <Link to={to} onClick={onClick} className="flex items-center p-3 text-lg rounded-md hover:bg-primary/10 transition-colors">
    <Icon className="mr-4 h-6 w-6 text-primary" />
    <span>{children}</span>
  </Link>
);

const AppBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
  };

  const closeSheet = () => setIsSheetOpen(false);

  const handleLogout = async () => {
    await logout();
    setIsSheetOpen(false);
    navigate('/');
  };

  const renderNavLinks = () => {
    if (!currentUser) {
      return (
        <>
          <NavLink to="/login" icon={UserCog} onClick={closeSheet}>Espace Pro</NavLink>
          <NavLink to="/learner-login" icon={User} onClick={closeSheet}>Espace Apprenant</NavLink>
        </>
      );
    }

    switch (currentUser.role) {
      case USER_ROLES.ADMIN:
        return (
          <>
            <NavLink to="/admin/dashboard" icon={Shield} onClick={closeSheet}>Dashboard Admin</NavLink>
            <NavLink to="/taches" icon={BookOpen} onClick={closeSheet}>Liste des Tâches</NavLink>
          </>
        );
      case USER_ROLES.TRAINER:
        return (
          <>
            <NavLink to="/formateur/faq" icon={MessageSquareQuestion} onClick={closeSheet}>FAQ Formateurs</NavLink>
            <NavLink to="/compte-formateur" icon={User} onClick={closeSheet}>Mon Compte</NavLink>
          </>
        );
      case USER_ROLES.LEARNER:
        return (
          <>
            <NavLink to="/taches" icon={BookOpen} onClick={closeSheet}>Mes Tâches</NavLink>
            <NavLink to="/mon-suivi" icon={BarChart3} onClick={closeSheet}>Mon Suivi</NavLink>
            <NavLink to="/report-error" icon={Bug} onClick={closeSheet}>Signaler une erreur</NavLink>
            <NavLink to="/compte-apprenant" icon={User} onClick={closeSheet}>Mon Compte</NavLink>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-[#3A5A40] shadow-lg">
      <div className="container max-w-full px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo + Texte - Côté gauche */}
        <Link to="/" className="flex items-center gap-3 flex-grow min-w-0">
          {/* Logo Circulaire */}
          <div className="flex-shrink-0">
            <div className="relative w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm border-1.5 border-white/40 flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden">
              {/* Logo SVG */}
              <img 
                src="/logo.svg" 
                alt="SARASSURE" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Texte - Une seule ligne */}
          <div className="flex flex-col items-start gap-0 min-w-0">
            <h1 className="text-white text-sm md:text-base font-bold drop-shadow-lg leading-none truncate">
              Espace Apprenant
            </h1>
            <p className="text-white/80 text-xs md:text-sm font-semibold drop-shadow-md truncate">
              SARASSURE
            </p>
          </div>
        </Link>

        {/* Menu hamburger + Bouton Fermer - Côté droit */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="text-2xl">Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-4">
                <NavLink to="/" icon={Home} onClick={closeSheet}>Accueil</NavLink>
                {renderNavLinks()}
                {currentUser && (
                  <button onClick={handleLogout} className="flex items-center p-3 text-lg rounded-md hover:bg-destructive/10 transition-colors text-destructive">
                    <LogOut className="mr-4 h-6 w-6" />
                    <span>Déconnexion</span>
                  </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <button
            onClick={handleClose}
            className="p-2 text-white/80 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-md"
            title="Fermer l'application"
            aria-label="Fermer l'application"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppBanner;
