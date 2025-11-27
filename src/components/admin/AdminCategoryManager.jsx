import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAdmin } from '@/contexts/AdminContext';
import { Edit3, Trash2, PlusCircle, Save, X, Loader2, ChevronRight } from 'lucide-react';

const AdminCategoryManager = () => {
  const { toast } = useToast();
  const { 
    categories: currentTaskCategories, 
    categoriesHierarchy,
    renameCategory, 
    deleteCategory, 
    addCategory,
    addSubcategory,
    removeSubcategoryParent
  } = useAdmin();
  
  const [categories, setCategories] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddSubcategoryDialogOpen, setIsAddSubcategoryDialogOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [selectedParentCategory, setSelectedParentCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    setCategories(currentTaskCategories || []);
  }, [currentTaskCategories]);

  useEffect(() => {
    setHierarchy(categoriesHierarchy || []);
  }, [categoriesHierarchy]);

  const handleEdit = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
  };

  const handleSaveEdit = async () => {
    if (!editingCategory || !newCategoryName.trim()) {
      toast({ title: "Nom invalide", description: "Le nom de la catégorie ne peut pas être vide.", variant: "destructive" });
      return;
    }
    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase() && cat.id !== editingCategory.id)) {
      toast({ title: "Catégorie existante", description: "Ce nom de catégorie existe déjà.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    await renameCategory(editingCategory.id, newCategoryName.trim());
    setIsLoading(false);
    
    toast({ title: "Catégorie renommée", description: `"${editingCategory.name}" est devenu "${newCategoryName.trim()}".` });
    setEditingCategory(null);
    setNewCategoryName('');
  };

  const handleDelete = async (categoryToDelete) => {
    if (categoryToDelete.name === "Général") {
        toast({ title: "Suppression impossible", description: "La catégorie 'Général' ne peut pas être supprimée.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    await deleteCategory(categoryToDelete.id);
    setIsLoading(false);
    toast({ title: "Catégorie supprimée", description: `La catégorie "${categoryToDelete.name}" a été supprimée.`, variant: "destructive" });
  };

  const handleAddCategory = async () => {
    const trimmedName = newCategoryInput.trim();
    if (!trimmedName) {
      toast({ title: "Nom invalide", description: "Le nom de la catégorie ne peut pas être vide.", variant: "destructive" });
      return;
    }
    if (categories.some(cat => cat.name.toLowerCase() === trimmedName.toLowerCase())) {
      toast({ title: "Catégorie existante", description: "Ce nom de catégorie existe déjà.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    await addCategory(trimmedName);
    setIsLoading(false);
    toast({ title: "Catégorie ajoutée", description: `La catégorie "${trimmedName}" a été ajoutée.` });
    setNewCategoryInput('');
    setIsAddDialogOpen(false);
  };

  const handleCategoryInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCategory();
    }
  };

  const handleSubcategoryInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubcategory();
    }
  };

  const handleAddSubcategory = async () => {
    const trimmedName = newSubcategoryName.trim();
    if (!trimmedName) {
      toast({ title: "Nom invalide", description: "Le nom de la sous-catégorie ne peut pas être vide.", variant: "destructive" });
      return;
    }
    if (!selectedParentCategory) {
      toast({ title: "Catégorie parente manquante", description: "Veuillez sélectionner une catégorie parente.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    await addSubcategory(parseInt(selectedParentCategory), trimmedName);
    setIsLoading(false);
    toast({ title: "Sous-catégorie ajoutée", description: `La sous-catégorie "${trimmedName}" a été ajoutée.` });
    setNewSubcategoryName('');
    setSelectedParentCategory('');
    setIsAddSubcategoryDialogOpen(false);
  };

  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Catégories</CardTitle>
        <CardDescription>Modifiez, ajoutez ou supprimez des catégories et sous-catégories. La suppression d'une catégorie nécessite une réaffectation manuelle des tâches.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex-1"><PlusCircle className="mr-2 h-4 w-4" /> Ajouter une Catégorie</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={(e) => { e.preventDefault(); handleAddCategory(); }}>
                <DialogHeader>
                  <DialogTitle>Ajouter une nouvelle catégorie</DialogTitle>
                  <DialogDescription>Entrez le nom de la nouvelle catégorie.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="new-category-name" className="text-right">Nom</Label>
                    <Input 
                      id="new-category-name" 
                      value={newCategoryInput} 
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      onKeyDown={handleCategoryInputKeyDown}
                      className="col-span-3" 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                    Ajouter
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddSubcategoryDialogOpen} onOpenChange={setIsAddSubcategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex-1" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Ajouter une Sous-Catégorie</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={(e) => { e.preventDefault(); handleAddSubcategory(); }}>
                <DialogHeader>
                  <DialogTitle>Ajouter une sous-catégorie</DialogTitle>
                  <DialogDescription>Sélectionnez une catégorie parente et entrez le nom de la sous-catégorie.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="parent-category" className="text-right">Catégorie Parente</Label>
                    <Select value={selectedParentCategory} onValueChange={setSelectedParentCategory}>
                      <SelectTrigger className="col-span-3" id="parent-category">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="new-subcategory-name" className="text-right">Nom</Label>
                    <Input 
                      id="new-subcategory-name" 
                      value={newSubcategoryName} 
                      onChange={(e) => setNewSubcategoryName(e.target.value)}
                      onKeyDown={handleSubcategoryInputKeyDown}
                      className="col-span-3" 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                    Ajouter
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading && categories.length === 0 ? <div className="text-center p-4"><Loader2 className="h-6 w-6 animate-spin mx-auto"/></div> :
        <ul className="space-y-2">
          {hierarchy.map(parentCategory => (
            <div key={parentCategory.id}>
              <li className="flex items-center justify-between p-3 border rounded-md bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="flex-grow flex items-center space-x-2">
                  {parentCategory.subcategories && parentCategory.subcategories.length > 0 && (
                    <button 
                      onClick={() => toggleCategoryExpand(parentCategory.id)}
                      className="p-1"
                    >
                      <ChevronRight className={`h-4 w-4 transition-transform ${expandedCategories[parentCategory.id] ? 'rotate-90' : ''}`} />
                    </button>
                  )}
                  {editingCategory?.id === parentCategory.id ? (
                    <Input 
                      value={newCategoryName} 
                      onChange={(e) => setNewCategoryName(e.target.value)} 
                      className="h-8 text-sm"
                    />
                  ) : (
                    <span className="text-sm font-bold">{parentCategory.name}</span>
                  )}
                </div>
                {editingCategory?.id !== parentCategory.id && (
                  <div className="space-x-1">
                    <Button onClick={() => handleEdit(parentCategory)} size="icon" variant="ghost" className="text-blue-600 hover:text-blue-700 h-8 w-8" disabled={isLoading}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    {parentCategory.name !== "Général" && (
                      <Button onClick={() => handleDelete(parentCategory)} size="icon" variant="ghost" className="text-red-500 hover:text-red-600 h-8 w-8" disabled={isLoading}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
                {editingCategory?.id === parentCategory.id && (
                  <div className="space-x-1">
                    <Button onClick={handleSaveEdit} size="icon" variant="ghost" className="text-green-600 hover:text-green-700 h-8 w-8" disabled={isLoading}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>}</Button>
                    <Button onClick={() => setEditingCategory(null)} size="icon" variant="ghost" className="h-8 w-8" disabled={isLoading}><X className="h-4 w-4"/></Button>
                  </div>
                )}
              </li>
              
              {/* Subcategories */}
              {expandedCategories[parentCategory.id] && parentCategory.subcategories && parentCategory.subcategories.length > 0 && (
                <ul className="ml-8 space-y-2 mt-2">
                  {parentCategory.subcategories.map(subcategory => (
                    <li key={subcategory.id} className="flex items-center justify-between p-3 border border-l-4 border-l-blue-400 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors">
                      {editingCategory?.id === subcategory.id ? (
                        <div className="flex-grow flex items-center space-x-2">
                          <Input 
                            value={newCategoryName} 
                            onChange={(e) => setNewCategoryName(e.target.value)} 
                            className="h-8 text-sm"
                          />
                          <Button onClick={handleSaveEdit} size="icon" variant="ghost" className="text-green-600 hover:text-green-700 h-8 w-8" disabled={isLoading}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>}</Button>
                          <Button onClick={() => setEditingCategory(null)} size="icon" variant="ghost" className="h-8 w-8" disabled={isLoading}><X className="h-4 w-4"/></Button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-700 flex-grow">{subcategory.name}</span>
                      )}
                      {editingCategory?.id !== subcategory.id && (
                        <div className="space-x-1">
                          <Button onClick={() => handleEdit(subcategory)} size="icon" variant="ghost" className="text-blue-600 hover:text-blue-700 h-8 w-8" disabled={isLoading}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => handleDelete(subcategory)} size="icon" variant="ghost" className="text-red-500 hover:text-red-600 h-8 w-8" disabled={isLoading}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </ul>
        }
      </CardContent>
    </Card>
  );
};

export default AdminCategoryManager;