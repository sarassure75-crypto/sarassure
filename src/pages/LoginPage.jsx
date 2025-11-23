import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, Loader2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import ContactForm from '@/components/ContactForm';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { error } = await login(data.email, data.password);
      if (error) {
        throw error;
      }
      toast({
        title: "Connexion réussie",
        description: "Vous allez être redirigé.",
      });
      navigate('/dashboard-redirect');
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Erreur de connexion",
        description: "Email ou mot de passe incorrect.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4"
    >
      <div className="w-full max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Connexion
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Contact
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-primary">Connexion</CardTitle>
                <CardDescription>Accédez à votre espace administrateur ou formateur.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre.email@example.com"
                      {...register("email", { required: "L'email est requis" })}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="********"
                      {...register("password", { required: "Le mot de passe est requis" })}
                      className={errors.password ? 'border-red-500' : ''}
                    />
                    {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                  </div>
                  <Button type="submit" className="w-full text-lg py-6" disabled={loading}>
                    {loading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <LogIn className="mr-2 h-5 w-5" />
                    )}
                    Se connecter
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col items-center space-y-2">
                 <p className="text-sm text-muted-foreground">
                  Vous êtes un apprenant ?
                  <Button variant="link" asChild>
                    <Link to="/learner-login">Connectez-vous ici</Link>
                  </Button>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <ContactForm onSuccess={() => setActiveTab('login')} />
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default LoginPage;