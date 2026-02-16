import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  getAllGlossaryTerms,
  createGlossaryTerm,
  updateGlossaryTerm,
  deleteGlossaryTerm,
  getGlossaryStats,
} from '@/data/glossary';
import { Plus, Trash2, Edit2, X, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * AdminGlossaryManager
 * Outil d'administration pour gérer le lexique
 */
export default function AdminGlossaryManager() {
  const { toast } = useToast();

  const [terms, setTerms] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // État du formulaire
  const [formMode, setFormMode] = useState('add'); // 'add' ou 'edit'
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    term: '',
    definition: '',
    category: 'general',
    example: '',
    related_terms: '',
  });

  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [termsData, statsData] = await Promise.all([getAllGlossaryTerms(), getGlossaryStats()]);

      setTerms(termsData);
      setStats(statsData);
      setCategories(statsData.categories || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les termes du lexique',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.term.trim() || !formData.definition.trim() || !formData.category.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const relatedTermsArray = formData.related_terms
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      if (formMode === 'add') {
        await createGlossaryTerm(
          formData.term,
          formData.definition,
          formData.category,
          formData.example,
          relatedTermsArray
        );
        toast({
          title: 'Succès',
          description: `Le terme "${formData.term}" a été créé`,
        });
      } else {
        await updateGlossaryTerm(editingId, {
          term: formData.term,
          definition: formData.definition,
          category: formData.category,
          example: formData.example || null,
          related_terms: relatedTermsArray,
        });
        toast({
          title: 'Succès',
          description: `Le terme "${formData.term}" a été mis à jour`,
        });
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving term:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le terme',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (term) => {
    setFormMode('edit');
    setEditingId(term.id);
    setFormData({
      term: term.term,
      definition: term.definition,
      category: term.category,
      example: term.example || '',
      related_terms: (term.related_terms || []).join(', '),
    });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id, termName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${termName}" ?`)) {
      return;
    }

    try {
      await deleteGlossaryTerm(id);
      toast({
        title: 'Succès',
        description: `Le terme "${termName}" a été supprimé`,
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting term:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le terme',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormMode('add');
    setEditingId(null);
    setFormData({
      term: '',
      definition: '',
      category: 'general',
      example: '',
      related_terms: '',
    });
  };

  const filteredTerms = terms.filter((term) => {
    const matchSearch =
      term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === 'all' || term.category === filterCategory;
    return matchSearch && matchCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion du Lexique</h1>
        <p className="text-gray-600">
          Créez et gérez les termes du dictionnaire utilisés dans les exercices
        </p>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.activeTerms}</div>
                <div className="text-sm text-gray-600 mt-1">Termes actifs</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">{stats.totalTerms}</div>
                <div className="text-sm text-gray-600 mt-1">Total</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{stats.categoryCount}</div>
                <div className="text-sm text-gray-600 mt-1">Catégories</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{stats.inactiveTerms}</div>
                <div className="text-sm text-gray-600 mt-1">Inactifs</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Formulaire de création/édition */}
      <Card className="border-2 border-blue-500">
        <CardHeader className="bg-blue-50">
          <CardTitle>
            {formMode === 'add' ? '➕ Ajouter un terme' : '✏️ Modifier un terme'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Terme * <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="term"
                  value={formData.term}
                  onChange={handleInputChange}
                  placeholder="Ex: Scroll, Paramètres, Icônes"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie * <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="general">Général</option>
                  <option value="interaction">Interaction</option>
                  <option value="interface">Interface</option>
                  <option value="gestion">Gestion</option>
                  <option value="matériel">Matériel</option>
                  <option value="audio">Audio</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Définition * <span className="text-red-500">*</span>
              </label>
              <Textarea
                name="definition"
                value={formData.definition}
                onChange={handleInputChange}
                placeholder="Entrez la définition complète du terme..."
                required
                rows={4}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exemple</label>
              <Input
                type="text"
                name="example"
                value={formData.example}
                onChange={handleInputChange}
                placeholder="Ex: Faites glisser votre doigt vers le bas pour scroll"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Termes connexes (séparés par des virgules)
              </label>
              <Input
                type="text"
                name="related_terms"
                value={formData.related_terms}
                onChange={handleInputChange}
                placeholder="Ex: Glissement, Défilement, Swipe"
                className="w-full"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {formMode === 'add' ? 'Ajouter' : 'Mettre à jour'}
                  </>
                )}
              </Button>
              {formMode === 'edit' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-col md:flex-row">
            <Input
              type="text"
              placeholder="🔍 Rechercher un terme..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des termes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Termes ({filteredTerms.length})</h2>
        </div>

        {filteredTerms.length === 0 ? (
          <Card className="bg-gray-50">
            <CardContent className="pt-6 text-center text-gray-600">Aucun terme trouvé</CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filteredTerms.map((term) => (
              <Card key={term.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-blue-700">{term.term}</h3>
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                          {term.category}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{term.definition}</p>
                      {term.example && (
                        <p className="text-sm text-gray-600 italic mb-2">
                          💡 <strong>Exemple :</strong> "{term.example}"
                        </p>
                      )}
                      {term.related_terms && term.related_terms.length > 0 && (
                        <p className="text-sm text-gray-600">
                          <strong>Connexes :</strong> {term.related_terms.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(term)}
                        className="flex items-center gap-2"
                      >
                        <Edit2 className="h-4 w-4" />
                        Éditer
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(term.id, term.term)}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
