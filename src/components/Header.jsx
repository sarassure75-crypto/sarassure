import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu, X, User, LogOut, UserCog, LayoutDashboard, BookOpen, HelpCircle, BarChart3, Download, MessageSquare as MessageSquareWarning } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES } from '@/data/users';
import LearnerCredentialsModal from '@/components/LearnerCredentialsModal';

const Header = ({ pwaMode = false }) => {
  const { currentUser, logout, deferredPrompt, handleInstallPrompt } = useAuth();
  const navigate = useNavigate();
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center px-4 py-2 text-lg font-medium rounded-md transition-colors ${
      isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
    }`;

  const commonLinks = [
    { to: '/taches', label: 'Tâches', icon: BookOpen, roles: [USER_ROLES.LEARNER, USER_ROLES.TRAINER, USER_ROLES.ADMIN] },
  ];

  const userLinks = {
    [USER_ROLES.ADMIN]: [
      { to: '/admin/dashboard', label: 'Dashboard Admin', icon: LayoutDashboard },
    ],
    [USER_ROLES.TRAINER]: [
      { to: '/formateur', label: 'Dashboard Formateur', icon: LayoutDashboard },
      { to: '/formateur/faq', label: 'FAQ', icon: HelpCircle },
      { to: '/compte-formateur', label: 'Mon Compte', icon: UserCog },
    ],
    [USER_ROLES.LEARNER]: [
      { to: '/mon-suivi', label: 'Mon Suivi', icon: BarChart3 },
      { to: '/compte-apprenant', label: 'Mon Compte', icon: UserCog },
      { to: '/report-error', label: 'Signaler une erreur', icon: MessageSquareWarning },
    ],
  };

  const getNavLinks = () => {
    if (!currentUser) return [];
    const roleLinks = userLinks[currentUser.role] || [];
    const filteredCommonLinks = commonLinks.filter(link => link.roles.includes(currentUser.role));
    return [...filteredCommonLinks, ...roleLinks];
  };

  const navLinks = getNavLinks();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SARASSURE Logo" className="h-10 w-auto" />
          </Link>

          {!pwaMode && (
            <nav className="hidden md:flex items-center gap-4">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={({isActive}) => `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2">
            {deferredPrompt && !pwaMode && (
              <Button variant="outline" size="sm" onClick={handleInstallPrompt}>
                <Download className="mr-2 h-4 w-4" />
                Installer
              </Button>
            )}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-sm font-medium text-muted-foreground">
                  {currentUser.first_name || currentUser.email}
                </span>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              !pwaMode && (
                <div className="hidden md:flex items-center gap-2">
                  <Button asChild variant="ghost">
                    <Link to="/login">Connexion</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/learner-login">Accès Apprenant</Link>
                  </Button>
                </div>
              )
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Ouvrir le menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm">
                <div className="flex justify-between items-center mb-6">
                   <SheetClose asChild>
                     <Link to="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="SARASSURE Logo" className="h-8 w-auto" />
                     </Link>
                   </SheetClose>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-6 w-6" />
                    </Button>
                  </SheetClose>
                </div>
                <nav className="flex flex-col gap-4">
                  {currentUser ? (
                    <>
                      {navLinks.map((link) => (
                        <SheetClose asChild key={link.to}>
                          <NavLink to={link.to} className={navLinkClass}>
                            <link.icon className="mr-3 h-5 w-5" />
                            {link.label}
                          </NavLink>
                        </SheetClose>
                      ))}
                       <hr className="my-2"/>
                       <SheetClose asChild>
                         <button onClick={handleLogout} className="flex items-center px-4 py-2 text-lg font-medium rounded-md transition-colors hover:bg-muted w-full text-left">
                            <LogOut className="mr-3 h-5 w-5 text-destructive" />
                            Déconnexion
                         </button>
                       </SheetClose>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Link to="/login">
                          <Button className="w-full justify-center">Connexion Admin/Formateur</Button>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/learner-login">
                          <Button className="w-full justify-center" variant="secondary">Accès Apprenant</Button>
                        </Link>
                      </SheetClose>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      {currentUser && currentUser.role === USER_ROLES.LEARNER && (
        <LearnerCredentialsModal
          isOpen={isCredentialsModalOpen}
          onClose={() => setIsCredentialsModalOpen(false)}
          learnerCode={currentUser.learner_code}
        />
      )}
    </>
  );
};

export default Header;