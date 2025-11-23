import React from 'react';
    import { Link } from 'react-router-dom';
    import { cn } from '@/lib/utils';
    import { useOutletContext } from 'react-router-dom';
    import { useLocation } from 'react-router-dom';


    const Footer = ({ className }) => {
      const currentYear = new Date().getFullYear();
      const outletContext = useOutletContext();
      const location = useLocation();
      
      const isMobileViewContext = outletContext?.isMobileView || false;
      const isActuallyMobileDevice = outletContext?.isActuallyMobileDevice || false;

      const isExercisePageContext = location.pathname.includes('/tache/') && !location.pathname.includes('/preview');
      
      const footerPaddingClass = isMobileViewContext && isExercisePageContext ? "py-2" : "py-6";
      
      if (isMobileViewContext && isActuallyMobileDevice) {
        return null; 
      }


      return (
        <footer className={cn("bg-muted text-muted-foreground mt-auto", footerPaddingClass, className)}>
          <div className="container mx-auto px-4 text-center">
            <p className={cn(isMobileViewContext && isExercisePageContext ? "text-xs" : "text-sm")}>
              &copy; {currentYear} SARASSURE. Tous droits réservés.
            </p>
            {!(isMobileViewContext && isExercisePageContext) && (
              <>
                <p className="text-xs mt-1">
                  Une application pour apprendre à utiliser votre smartphone facilement.
                </p>
                <div className="mt-2">
                  <Link to="/admin" className="text-xs text-primary hover:underline">
                    Administration
                  </Link>
                </div>
              </>
            )}
          </div>
        </footer>
      );
    };

    export default Footer;