import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { getAllUsersByRole, createLearner, updateUser, deleteUser } from '@/data/users.js';
import { UserPlus, Copy, RefreshCw, Users, Edit, X, Save, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

const AdminLearnerManager = () => {
    const [learners, setLearners] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newLearnerFirstName, setNewLearnerFirstName] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [editedFields, setEditedFields] = useState({});
    const { toast } = useToast();

    const fetchLearners = async () => {
        setIsLoading(true);
        try {
            const data = await getAllUsersByRole('apprenant');
            setLearners(data);
        } catch (error) {
            toast({
                title: "Erreur de chargement",
                description: "Impossible de récupérer la liste des apprenants.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLearners();
    }, []);

    const handleCreateLearner = async (e) => {
        e.preventDefault();
        if (!newLearnerFirstName.trim()) {
            toast({ title: "Prénom requis", description: "Veuillez entrer un prénom.", variant: "destructive" });
            return;
        }
        setIsCreating(true);
        try {
            const newLearner = await createLearner(newLearnerFirstName);
            toast({
                title: "Apprenant créé !",
                description: `${newLearner.first_name} a été ajouté avec le code : ${newLearner.learner_code}`,
            });
            setNewLearnerFirstName('');
            fetchLearners();
        } catch (error) {
            toast({
                title: "Erreur de création",
                description: error.message || "Une erreur est survenue.",
                variant: "destructive",
            });
        } finally {
            setIsCreating(false);
        }
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
            fetchLearners();
        } catch (error) {
            toast({ title: 'Erreur', description: `La mise à jour a échoué: ${error.message}`, variant: 'destructive' });
        }
    };
    
    const handleDeleteUser = async (userId) => {
        try {
            await deleteUser(userId);
            toast({ title: 'Apprenant supprimé', description: "L'utilisateur et son profil ont été supprimés.", variant: 'destructive'});
            fetchLearners();
        } catch (error) {
            toast({ title: 'Erreur de suppression', description: `La suppression a échoué: ${error.message}`, variant: 'destructive' });
        }
    };

    const handleCopy = (textToCopy) => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            toast({ title: "Copié !", description: `Le code ${textToCopy} a été copié.` });
        });
    };

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><UserPlus className="mr-2 h-5 w-5" />Créer un apprenant (sans email)</CardTitle>
                    <CardDescription>Créez un compte pour un apprenant qui n'a pas d'adresse email. Un code unique sera généré.</CardDescription>
                </CardHeader>
                <form onSubmit={handleCreateLearner}>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Prénom de l'apprenant</Label>
                            <Input
                                id="firstName"
                                value={newLearnerFirstName}
                                onChange={(e) => setNewLearnerFirstName(e.target.value)}
                                placeholder="Ex: Jean"
                                required
                                disabled={isCreating}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isCreating}>
                            {isCreating ? "Création en cours..." : "Créer le compte"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                           <Users className="mr-2 h-5 w-5" /> Liste des Apprenants
                        </div>
                        <Button variant="ghost" size="icon" onClick={fetchLearners} disabled={isLoading}>
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </CardTitle>
                    <CardDescription>Voici la liste de tous les comptes apprenants.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg max-h-[600px] overflow-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur-sm">
                                <TableRow>
                                    <TableHead>Prénom</TableHead>
                                    <TableHead>Nom</TableHead>
                                    <TableHead>Pseudo</TableHead>
                                    <TableHead>Code Apprenant</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={6} className="text-center">Chargement...</TableCell></TableRow>
                                    ) : learners.length > 0 ? (
                                        learners.map((learner) => (
                                            <motion.tr
                                                key={learner.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-muted/50"
                                            >
                                                {editingUser === learner.id ? (
                                                    <>
                                                        <TableCell><Input value={editedFields.first_name} onChange={(e) => setEditedFields({...editedFields, first_name: e.target.value})} /></TableCell>
                                                        <TableCell><Input value={editedFields.last_name} onChange={(e) => setEditedFields({...editedFields, last_name: e.target.value})} /></TableCell>
                                                        <TableCell><Input value={editedFields.pseudo} onChange={(e) => setEditedFields({...editedFields, pseudo: e.target.value})} /></TableCell>
                                                        <TableCell colSpan={2}></TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="icon" onClick={() => handleSaveUser(learner.id)}><Save className="h-4 w-4 text-green-600"/></Button>
                                                            <Button variant="ghost" size="icon" onClick={() => setEditingUser(null)}><X className="h-4 w-4 text-red-600"/></Button>
                                                        </TableCell>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TableCell className="font-medium">{learner.first_name || 'N/A'}</TableCell>
                                                        <TableCell>{learner.last_name || 'N/A'}</TableCell>
                                                        <TableCell>{learner.pseudo || 'N/A'}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono tracking-wider">{learner.learner_code || 'N/A'}</span>
                                                                {learner.learner_code && (
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(learner.learner_code)}>
                                                                        <Copy className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">{learner.email?.includes('@example.com') ? 'Aucun' : learner.email}</TableCell>
                                                        <TableCell className="text-right space-x-1">
                                                            <Button variant="ghost" size="icon" onClick={() => handleEditUser(learner)}><Edit className="h-4 w-4"/></Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Supprimer {learner.first_name}?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Cette action est irréversible et supprimera définitivement le compte et le profil de l'apprenant.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleDeleteUser(learner.id)} className="bg-destructive hover:bg-destructive/80">Supprimer</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </TableCell>
                                                    </>
                                                )}
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <TableRow><TableCell colSpan={6} className="text-center">Aucun apprenant trouvé.</TableCell></TableRow>
                                    )}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminLearnerManager;