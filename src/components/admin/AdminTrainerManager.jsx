import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { getAllUsersByRole, updateUser, deleteUser, createTrainer } from '@/data/users.js';
import { RefreshCw, Users, Copy, Edit, Save, X, Trash2, Plus, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminTrainerManager = ({ onTrainerCreated }) => {
    const [trainers, setTrainers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [editedFields, setEditedFields] = useState({});
    const [isCreating, setIsCreating] = useState(false);
    const [newTrainer, setNewTrainer] = useState({ firstName: '', pseudo: '' });
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const { toast } = useToast();

    const fetchTrainers = async () => {
        setIsLoading(true);
        try {
            const data = await getAllUsersByRole('formateur');
            setTrainers(data);
        } catch (error) {
            toast({
                title: "Erreur de chargement",
                description: "Impossible de récupérer la liste des formateurs.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTrainers();
    }, []);

    const handleCopy = (textToCopy, type) => {
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy).then(() => {
            toast({ title: "Copié !", description: `Le ${type} ${textToCopy} a été copié.` });
        });
    };

    const handleEditUser = (user) => {
        setEditingUser(user.id);
        setEditedFields({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            pseudo: user.pseudo || ''
        });
    };

    const handleSaveUser = async (userId) => {
        try {
            await updateUser(userId, editedFields);
            toast({ title: 'Profil mis à jour !', description: 'Les informations ont été sauvegardées.' });
            setEditingUser(null);
            fetchTrainers();
        } catch (error) {
            toast({ title: 'Erreur', description: `La mise à jour a échoué: ${error.message}`, variant: 'destructive' });
        }
    };
    
    const handleDeleteUser = async (userId) => {
        try {
            await deleteUser(userId);
            toast({ title: 'Formateur supprimé', description: "L'utilisateur et son profil ont été supprimés.", variant: 'destructive'});
            fetchTrainers();
        } catch (error) {
            toast({ title: 'Erreur de suppression', description: `La suppression a échoué: ${error.message}`, variant: 'destructive' });
        }
    };

    const handleCreateTrainer = async () => {
        if (!newTrainer.firstName || !newTrainer.pseudo) {
            toast({ title: 'Champs requis', description: 'Veuillez remplir tous les champs', variant: 'destructive' });
            return;
        }

        setIsCreating(true);
        try {
            const trainer = await createTrainer(newTrainer.firstName, newTrainer.pseudo);
            toast({ 
                title: 'Formateur créé !', 
                description: `Code: ${trainer.trainer_code} - Pseudo: ${trainer.pseudo}`,
                duration: 10000 
            });
            setNewTrainer({ firstName: '', pseudo: '' });
            setShowCreateDialog(false);
            fetchTrainers();
            if (onTrainerCreated) onTrainerCreated();
        } catch (error) {
            toast({ title: 'Erreur', description: `La création a échoué: ${error.message}`, variant: 'destructive' });
        } finally {
            setIsCreating(false);
        }
    };

    const handleResetPassword = async (trainerId, trainerCode) => {
        // Reset password to trainer_code via edge function
        try {
            const { error } = await supabase.functions.invoke('update-user-password', {
                body: { userId: trainerId, password: trainerCode },
            });
            
            if (error) throw error;
            
            toast({ 
                title: 'Mot de passe réinitialisé',
                description: `Le mot de passe est maintenant: ${trainerCode}`,
                duration: 10000
            });
        } catch (error) {
            toast({ title: 'Erreur', description: `La réinitialisation a échoué: ${error.message}`, variant: 'destructive' });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                       <Users className="mr-2 h-5 w-5" /> Liste des Formateurs
                    </div>
                    <div className="flex items-center gap-2">
                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                            <DialogTrigger asChild>
                                <Button variant="default" size="sm">
                                    <Plus className="mr-2 h-4 w-4" /> Créer un formateur
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Créer un nouveau formateur</DialogTitle>
                                    <DialogDescription>
                                        Le code formateur sera généré automatiquement
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div>
                                        <Label htmlFor="firstName">Prénom</Label>
                                        <Input
                                            id="firstName"
                                            value={newTrainer.firstName}
                                            onChange={(e) => setNewTrainer({...newTrainer, firstName: e.target.value})}
                                            placeholder="Jean"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="pseudo">Pseudo (identifiant de connexion)</Label>
                                        <Input
                                            id="pseudo"
                                            value={newTrainer.pseudo}
                                            onChange={(e) => setNewTrainer({...newTrainer, pseudo: e.target.value})}
                                            placeholder="jean.formateur"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Annuler</Button>
                                    <Button onClick={handleCreateTrainer} disabled={isCreating}>
                                        {isCreating ? 'Création...' : 'Créer'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" onClick={fetchTrainers} disabled={isLoading}>
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </CardTitle>
                <CardDescription>Voici la liste de tous les comptes formateurs et leurs codes uniques.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg max-h-[600px] overflow-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur-sm">
                            <TableRow>
                                <TableHead>Prénom</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Pseudo</TableHead>
                                <TableHead>Code Formateur</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={6} className="text-center">Chargement...</TableCell></TableRow>
                                ) : trainers.length > 0 ? (
                                    trainers.map((trainer) => (
                                        <motion.tr
                                            key={trainer.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-muted/50"
                                        >
                                            {editingUser === trainer.id ? (
                                                <>
                                                    <TableCell><Input value={editedFields.first_name} onChange={(e) => setEditedFields({...editedFields, first_name: e.target.value})} /></TableCell>
                                                    <TableCell><Input value={editedFields.last_name} onChange={(e) => setEditedFields({...editedFields, last_name: e.target.value})} /></TableCell>
                                                    <TableCell className="text-muted-foreground">{trainer.email || 'Aucun'}</TableCell>
                                                    <TableCell><Input value={editedFields.pseudo} onChange={(e) => setEditedFields({...editedFields, pseudo: e.target.value})} /></TableCell>
                                                    <TableCell></TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => handleSaveUser(trainer.id)}><Save className="h-4 w-4 text-green-600"/></Button>
                                                        <Button variant="ghost" size="icon" onClick={() => setEditingUser(null)}><X className="h-4 w-4 text-red-600"/></Button>
                                                    </TableCell>
                                                </>
                                            ) : (
                                                <>
                                                    <TableCell className="font-medium">{trainer.first_name || 'N/A'}</TableCell>
                                                    <TableCell>{trainer.last_name || 'N/A'}</TableCell>
                                                    <TableCell className="text-muted-foreground">{trainer.email || 'Aucun'}</TableCell>
                                                    <TableCell>{trainer.pseudo || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono tracking-wider">{trainer.trainer_code || 'N/A'}</span>
                                                            {trainer.trainer_code && (
                                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(trainer.trainer_code, 'code')}>
                                                                    <Copy className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right space-x-1">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditUser(trainer)} title="Modifier"><Edit className="h-4 w-4"/></Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleResetPassword(trainer.id, trainer.trainer_code)} title="Réinitialiser le mot de passe"><KeyRound className="h-4 w-4 text-amber-600"/></Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" title="Supprimer"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Supprimer {trainer.first_name}?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Cette action est irréversible et supprimera définitivement le compte et le profil du formateur.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteUser(trainer.id)} className="bg-destructive hover:bg-destructive/80">Supprimer</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </TableCell>
                                                </>
                                            )}
                                        </motion.tr>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={6} className="text-center">Aucun formateur trouvé.</TableCell></TableRow>
                                )}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default AdminTrainerManager;