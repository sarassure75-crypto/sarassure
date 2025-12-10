import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";

const AdminFaqList = ({ faqData, onEdit, onDelete }) => {
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const groupedFaq = faqData.reduce((acc, item) => {
    const category = item.category || 'Autre';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des Questions & Réponses</CardTitle>
        <CardDescription>Gérez les Q&R de la FAQ pour les formateurs.</CardDescription>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedFaq).length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Aucune Q&R pour le moment.</p>
        ) : (
          Object.entries(groupedFaq).map(([category, items]) => (
            <div key={category} className="mb-4">
              <h3
                className="text-lg font-semibold text-primary flex justify-between items-center cursor-pointer py-2 px-3 rounded-md hover:bg-muted/30 transition-colors"
                onClick={() => toggleCategory(category)}
              >
                {category} ({items.length})
                {expandedCategories[category] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </h3>
              <AnimatePresence>
                {expandedCategories[category] && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 mt-1 pl-3 border-l-2 border-muted"
                  >
                    {items.map(item => (
                      <motion.li
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="p-3 border rounded-md bg-background hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-foreground flex-grow pr-2">{item.question}</p>
                          <div className="flex space-x-1 shrink-0">
                            <Button variant="ghost" size="icon_xs" onClick={() => onEdit(item)} title="Modifier">
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon_xs" title="Supprimer">
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Confirmer la suppression</DialogTitle>
                                  <DialogDescription>
                                    Êtes-vous sûr de vouloir supprimer la Q&R : "{item.question}" ? Cette action est irréversible.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
                                  <DialogClose asChild><Button variant="destructive" onClick={() => onDelete(item.id)}>Supprimer</Button></DialogClose>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Mots-clés: {item.keywords?.join(', ') || 'N/A'}</p>
                        {item.isUserSubmitted && <Badge variant="outline" className="mt-1 text-xs bg-yellow-100 text-yellow-700 border-yellow-300">Soumis par utilisateur</Badge>}
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          )))}
      </CardContent>
    </Card>
  );
};

export default AdminFaqList;