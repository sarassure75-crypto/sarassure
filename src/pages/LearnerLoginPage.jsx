import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import AuthRedirect from '@/components/AuthRedirect';
import { useAuth } from '@/contexts/AuthContext';

const LearnerLoginPage = () => {
  const [learnerCode, setLearnerCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loginWithLearnerCode } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (learnerCode.length !== 6 || !/^\d{6}$/.test(learnerCode)) {
      toast({
        title: 'Code invalide',
        description: 'Le code apprenant doit contenir exactement 6 chiffres.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await loginWithLearnerCode(learnerCode);
      // Redirection will be handled by AuthRedirect
    } catch (error) {
      toast({
        title: 'Erreur de connexion',
        description: error.message || 'Une erreur est survenue. Veuillez réessayer.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <AuthRedirect>
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-background">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md mx-auto shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Accès Apprenant</CardTitle>
              <CardDescription>Entrez votre code à 6 chiffres pour vous connecter.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="learner-code">Code Apprenant</Label>
                  <Input
                    id="learner-code"
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    placeholder="_ _ _ _ _ _"
                    required
                    value={learnerCode}
                    onChange={(e) => setLearnerCode(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-[0.5em]"
                    disabled={isSubmitting}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Se connecter'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AuthRedirect>
  );
};

export default LearnerLoginPage;