import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { PlusCircle, Save } from 'lucide-react';
import AdminFaqStepForm from './AdminFaqStepForm';
import { useToast } from '@/components/ui/use-toast';

const AdminFaqForm = ({ faqItem: initialFaqItem, onSave, onCancel, images }) => {
  const [faqItem, setFaqItem] = useState(
    initialFaqItem || {
      question: '',
      category: 'Technique',
      keywords: [],
      answer_steps: [{ instruction: '', image_id: null, pictogram_id: null }],
    }
  );
  const [keywordsInput, setKeywordsInput] = useState(initialFaqItem?.keywords?.join(', ') || '');
  const { toast } = useToast();

  useEffect(() => {
    const initialData = initialFaqItem || {
      question: '',
      category: 'Technique',
      keywords: [],
      answer_steps: [{ instruction: '', image_id: null, pictogram_id: null }],
    };
    // Ensure answer_steps is used internally
    if (initialData.answerSteps) {
      initialData.answer_steps = initialData.answerSteps;
      delete initialData.answerSteps;
    }
    if (!initialData.answer_steps) {
      initialData.answer_steps = [{ instruction: '', image_id: null, pictogram_id: null }];
    }
    setFaqItem(initialData);
    setKeywordsInput(initialData?.keywords?.join(', ') || '');
  }, [initialFaqItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFaqItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleKeywordsChange = (e) => {
    setKeywordsInput(e.target.value);
    setFaqItem((prev) => ({
      ...prev,
      keywords: e.target.value
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
    }));
  };

  const handleStepChange = (index, updatedStep) => {
    const newSteps = [...faqItem.answer_steps];
    newSteps[index] = updatedStep;
    setFaqItem((prev) => ({ ...prev, answer_steps: newSteps }));
  };

  const addStep = () => {
    setFaqItem((prev) => ({
      ...prev,
      answer_steps: [...prev.answer_steps, { instruction: '', image_id: null, pictogram_id: null }],
    }));
  };

  const removeStep = (index) => {
    setFaqItem((prev) => ({
      ...prev,
      answer_steps: prev.answer_steps.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!faqItem.question.trim() || faqItem.answer_steps.some((step) => !step.instruction.trim())) {
      toast({
        title: 'Champs requis',
        description: "La question et l'instruction de chaque étape sont requises.",
        variant: 'destructive',
      });
      return;
    }
    // The object is already using answer_steps, so it's ready to be saved.
    onSave(faqItem);
  };

  const categories = ['Technique', 'Pédagogie', 'Compte', 'Autre'];

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{initialFaqItem ? 'Modifier' : 'Ajouter'} une Q&R</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="faq-question">Question</Label>
            <Input
              id="faq-question"
              name="question"
              value={faqItem.question}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="faq-category">Catégorie</Label>
            <Select
              name="category"
              value={faqItem.category}
              onValueChange={(value) => setFaqItem((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger id="faq-category">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="faq-keywords">Mots-clés (séparés par des virgules)</Label>
            <Input id="faq-keywords" value={keywordsInput} onChange={handleKeywordsChange} />
          </div>
          <div>
            <Label>Étapes de la Réponse</Label>
            {faqItem.answer_steps.map((step, index) => (
              <AdminFaqStepForm
                key={index}
                step={step}
                index={index}
                onStepChange={handleStepChange}
                onRemoveStep={removeStep}
                images={images}
              />
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addStep} className="mt-2">
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une étape
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" /> Sauvegarder
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AdminFaqForm;
