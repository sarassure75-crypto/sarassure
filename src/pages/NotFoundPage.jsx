import React from 'react';
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { AlertTriangle } from 'lucide-react';
    import { motion } from 'framer-motion';

    const NotFoundPage = () => {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-20"
        >
          <AlertTriangle className="mx-auto h-24 w-24 text-destructive mb-8" />
          <h1 className="text-5xl font-extrabold text-foreground mb-4">
            Oops! Page non trouvée
          </h1>
          <p className="text-xl text-muted-foreground mb-10">
            La page que vous cherchez semble s'être égarée dans le monde numérique.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link to="/">Retourner à l'accueil</Link>
          </Button>
        </motion.div>
      );
    };

    export default NotFoundPage;