import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { USER_ROLES, getUserById } from '@/data/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { UserPlus, CheckCircle, ArrowRight, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [role, setRole] = useState(USER_ROLES.LEARNER);
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [newLearner, setNewLearner] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await signUp({
        email: email,
        password: password,
        options: {
          data: {
            first_name: firstName,
            role: role,
          },
        },
      });

      if (error) throw error;

      if (role === USER_ROLES.LEARNER) {
        let profile = null;
        for (let i = 0; i < 5; i++) {
          await new Promise((res) => setTimeout(res, 500));
          const profileData = await getUserById(data.user.id);
          if (profileData) {
            profile = profileData;
            break;
          }
        }

        if (!profile) {
          toast({
            title: 'Inscription presque terminée !',
            description:
              'Veuillez vérifier vos emails pour confirmer votre compte. Votre code vous sera accessible après connexion.',
            duration: 7000,
          });
          navigate('/login');
        } else {
          setNewLearner(profile);
          setRegistrationSuccess(true);
        }
      } else {
        toast({
          title: 'Inscription réussie !',
          description: 'Veuillez vérifier vos emails pour confirmer votre compte.',
        });
        navigate('/login');
      }
    } catch (error) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || 'Une erreur est survenue.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (registrationSuccess && newLearner) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-emerald-200 p-4"
      >
        <Card className="w-full max-w-md shadow-2xl border-2 border-green-400">
          <CardHeader className="text-center bg-green-500 text-white p-6 rounded-t-lg">
            <CheckCircle size={48} className="mx-auto mb-3" />
            <CardTitle className="text-2xl font-bold">Inscription Réussie !</CardTitle>
            <CardDescription className="text-green-50">
              Notez bien vos informations de connexion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6 text-center">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <Label className="text-sm text-green-600">Votre Prénom :</Label>
              <p className="text-2xl font-semibold text-green-800">{newLearner.first_name}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <Label className="text-sm text-green-600">
                Votre Code Secret (pour la connexion simplifiée) :
              </Label>
              <p className="text-4xl font-bold tracking-wider text-green-800">
                {newLearner.learner_code || 'En attente...'}
              </p>
            </div>
            <div className="flex items-start p-3 bg-yellow-50 border border-yellow-300 text-yellow-700 rounded-md text-sm">
              <Info className="mr-2 h-5 w-5 mt-0.5 text-yellow-600 flex-shrink-0" />
              <p className="text-left">
                Un email de confirmation a été envoyé. Vous devez valider votre email avant de
                pouvoir vous connecter.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => navigate('/login')}
              className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
            >
              Aller à la page de connexion <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-screen bg-background p-4"
    >
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Créer un compte</CardTitle>
          <CardDescription>Rejoignez la plateforme en quelques clics.</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={loading}
                placeholder="Votre prénom"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="votre.email@exemple.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe (6 caractères minimum)</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Je suis un(e)</Label>
              <Select value={role} onValueChange={setRole} disabled={loading}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Sélectionnez un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={USER_ROLES.LEARNER}>Apprenant</SelectItem>
                  <SelectItem value={USER_ROLES.TRAINER}>Formateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                'Création en cours...'
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" /> S'inscrire
                </>
              )}
            </Button>
            <p className="mt-4 text-xs text-center text-muted-foreground">
              Déjà un compte ?{' '}
              <Link
                to="/login"
                className="underline underline-offset-2 text-primary hover:text-primary/80"
              >
                Se connecter
              </Link>
            </p>
            <p className="mt-2 text-xs text-center text-muted-foreground">
              Apprenant sans email ? Utilisez le{' '}
              <Link
                to="/learner-login"
                className="underline underline-offset-2 text-primary hover:text-primary/80"
              >
                code fourni par votre formateur
              </Link>
              .
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default RegisterPage;
