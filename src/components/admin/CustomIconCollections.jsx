import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Download, Upload, Share2, Lock, Globe, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  getUserCollections,
  createCollection,
  getCollection,
  removeIconFromCollection,
  exportCollection,
  importCollection,
} from '@/lib/customIconsService';

/**
 * Gestionnaire de collections d'icônes personnalisées
 * Permet de créer, gérer et exporter des collections
 */
const CustomIconCollections = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionIcons, setCollectionIcons] = useState([]);
  const [showNewCollectionDialog, setShowNewCollectionDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadCollections();
    }
  }, [user]);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const data = await getUserCollections(user.id);
      setCollections(data || []);
      if (data?.length > 0) {
        setSelectedCollection(data[0]);
        loadCollectionIcons(data[0].id);
      }
    } catch (error) {
      console.error('Erreur chargement collections:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos collections',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCollectionIcons = async (collectionId) => {
    try {
      const data = await getCollection(collectionId);
      setCollectionIcons(data || []);
    } catch (error) {
      console.error('Erreur chargement icônes:', error);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom de la collection est requis',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newCollection = await createCollection(user.id, newCollectionName, newCollectionDesc);
      if (newCollection) {
        setCollections([...collections, newCollection]);
        setSelectedCollection(newCollection);
        setCollectionIcons([]);
        setShowNewCollectionDialog(false);
        setNewCollectionName('');
        setNewCollectionDesc('');
        toast({
          title: 'Succès',
          description: 'Collection créée avec succès',
        });
      }
    } catch (error) {
      console.error('Erreur création collection:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la collection',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveIcon = async (iconId) => {
    try {
      const success = await removeIconFromCollection(iconId);
      if (success) {
        setCollectionIcons(collectionIcons.filter((icon) => icon.id !== iconId));
        toast({
          title: 'Succès',
          description: 'Icône supprimée de la collection',
        });
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const handleExport = () => {
    if (selectedCollection && collectionIcons.length > 0) {
      exportCollection(collectionIcons, selectedCollection.name);
      toast({
        title: 'Succès',
        description: 'Collection exportée en JSON',
      });
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (file && selectedCollection) {
      try {
        const icons = await importCollection(file, selectedCollection.id);
        if (icons) {
          loadCollectionIcons(selectedCollection.id);
          toast({
            title: 'Succès',
            description: `${icons.length} icônes importées`,
          });
        }
      } catch (error) {
        console.error('Erreur import:', error);
        toast({
          title: 'Erreur',
          description: "Impossible d'importer la collection",
          variant: 'destructive',
        });
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📚 Mes Collections d'Icônes</CardTitle>
          <CardDescription>
            Organisez et gérez vos collections d'icônes personnalisées
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Créer une nouvelle collection */}
          <Button onClick={() => setShowNewCollectionDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle collection
          </Button>

          {collections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Aucune collection créée. Commencez par en créer une !</p>
            </div>
          ) : (
            <>
              {/* Liste des collections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => {
                      setSelectedCollection(collection);
                      loadCollectionIcons(collection.id);
                    }}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedCollection?.id === collection.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <h3 className="font-semibold">{collection.name}</h3>
                    <p className="text-sm text-gray-600">{collection.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {collectionIcons.filter((i) => i.collection_id === collection.id).length}{' '}
                      icônes
                    </p>
                  </button>
                ))}
              </div>

              {/* Détails de la collection sélectionnée */}
              {selectedCollection && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Icônes dans "{selectedCollection.name}"</h3>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleExport}
                        variant="outline"
                        size="sm"
                        disabled={collectionIcons.length === 0}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Exporter
                      </Button>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImport}
                          className="hidden"
                        />
                        <Button
                          onClick={(e) => e.currentTarget.parentElement.click()}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Importer
                        </Button>
                      </label>
                    </div>
                  </div>

                  {collectionIcons.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {collectionIcons.map((icon) => (
                        <div
                          key={icon.id}
                          className="p-3 border rounded bg-gray-50 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-mono text-sm">
                              {icon.library_id}-{icon.icon_name}
                            </p>
                            {icon.display_name && (
                              <p className="text-xs text-gray-600">{icon.display_name}</p>
                            )}
                            {icon.category && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded inline-block mt-1">
                                {icon.category}
                              </span>
                            )}
                          </div>
                          <Button
                            onClick={() => handleRemoveIcon(icon.id)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Aucune icône dans cette collection</p>
                      <p className="text-sm">Utilisez le gestionnaire d'icônes pour en ajouter</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour créer une nouvelle collection */}
      <Dialog open={showNewCollectionDialog} onOpenChange={setShowNewCollectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle collection d'icônes</DialogTitle>
            <DialogDescription>
              Créez une nouvelle collection pour organiser vos icônes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nom de la collection *</label>
              <Input
                placeholder="ex: Icônes de communication"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (optionnel)</label>
              <Textarea
                placeholder="Décrivez le contenu ou l'usage de cette collection..."
                value={newCollectionDesc}
                onChange={(e) => setNewCollectionDesc(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCollectionDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateCollection}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomIconCollections;
