import React from 'react';
    import { Link, useLocation } from 'react-router-dom';
    import { useOutletContext } from 'react-router-dom';


    const Footer = () => {
      const currentYear = new Date().getFullYear();
      const location = useLocation();
      const context = useOutletContext();
      const isMobileView = context?.isMobileView || false; 
      
      const showTrainerLink = location.pathname === '/' && isMobileView;


      return (
        <footer className="bg-muted text-muted-foreground py-6 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm">
              &copy; {currentYear} SARASSURE. Tous droits réservés.
            </p>
            <p className="text-xs mt-1">
              Une application pour apprendre à utiliser votre smartphone facilement.
            </p>
            <div className="mt-2 space-x-4">
              <Link to="/admin" className="text-xs text-primary hover:underline">
                Administration
              </Link>
              {showTrainerLink && (
                 <Link to="/formateur" className="text-xs text-secondary hover:underline">
                    Suivi Formateur
                </Link>
              )}
            </div>
          </div>
        </footer>
      );
    };

    export default Footer;