import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { getFaqData, updateFaq, createFaq, deleteFaq } from '@/data/faqData';
import { fetchImages } from '@/data/images';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import AdminFaqForm from './faq/AdminFaqForm';
import AdminFaqList from './faq/AdminFaqList';
import { v4 as uuidv4 } from 'uuid';

const AdminFaqManager = () => {
  const [faqData, setFaqData] = useState([]);
  const [images, setImages] = useState([]);
  const [editingFaqItem, setEditingFaqItem] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [faqItems, imagesData] = await Promise.all([
        getFaqData(),
        fetchImages()
      ]);
      setFaqData(faqItems || []);
      setImages(Array.isArray(imagesData) ? imagesData : []);
    } catch (error) {
      console.error("Error loading FAQ data:", error);
      setImages([]);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données pour la FAQ.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveFaqItem = async (itemToSave) => {
    try {
      if (itemToSave.id) {
        await updateFaq(itemToSave.id, itemToSave);
      } else {
        await createFaq({ ...itemToSave, id: uuidv4() });
      }
      await loadData();
      setIsFormVisible(false);
      setEditingFaqItem(null);
      toast({ title: "Q&R sauvegardée avec succès !" });
    } catch (error) {
      toast({ title: "Erreur de sauvegarde", description: error.message, variant: "destructive" });
    }
  };

  const handleEditFaqItem = (item) => {
    setEditingFaqItem(item);
    setIsFormVisible(true);
  };

  const handleDeleteFaqItem = async (itemId) => {
    try {
      await deleteFaq(itemId);
      await loadData();
      toast({ title: "Q&R supprimée.", variant: "destructive" });
    } catch (error) {
      toast({ title: "Erreur de suppression", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestionnaire FAQ</CardTitle>
          <CardDescription>Chargement en cours...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {isFormVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AdminFaqForm
              faqItem={editingFaqItem}
              onSave={handleSaveFaqItem}
              onCancel={() => { setIsFormVisible(false); setEditingFaqItem(null); }}
              images={images}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!isFormVisible && (
        <Button onClick={() => { setEditingFaqItem(null); setIsFormVisible(true); }} className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une Q&R
        </Button>
      )}

      <AdminFaqList 
        faqData={faqData}
        onEdit={handleEditFaqItem}
        onDelete={handleDeleteFaqItem}
      />
    </div>
  );
};

export default AdminFaqManager;