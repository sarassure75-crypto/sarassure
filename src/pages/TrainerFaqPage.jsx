import React, { useState, useEffect, useCallback } from 'react';
    import { getFaqData, addFaqQuestion } from '@/data/faqData';
    import { getImageById } from '@/data/images';
    import { getImageUrl } from '@/lib/supabaseClient';
    import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
    import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { HelpCircle, MessageSquare, Send, Search, ChevronLeft, Loader2 } from 'lucide-react';
    import { useNavigate } from 'react-router-dom';

    const FaqAnswerStep = ({ step, index }) => {
        const [imageInfo, setImageInfo] = useState(null);
        const [pictogramInfo, setPictogramInfo] = useState(null);

        useEffect(() => {
            const fetchStepImages = async () => {
                if (step.image_id) {
                    const img = await getImageById(step.image_id);
                    setImageInfo(img);
                }
                if (step.pictogram_id) {
                    const picto = await getImageById(step.pictogram_id);
                    setPictogramInfo(picto);
                }
            };
            fetchStepImages();
        }, [step.image_id, step.pictogram_id]);

        return (
            <div className="flex items-start space-x-3 p-3 border-b last:border-b-0 bg-background/30 rounded-md">
                {pictogramInfo && (
                    <img
                        src={getImageUrl(pictogramInfo.file_path)}
                        alt={pictogramInfo.description || `Pictogramme étape ${index + 1}`}
                        className="h-8 w-8 md:h-10 md:w-10 object-contain rounded border flex-shrink-0 mt-1"
                    />
                )}
                <div className="flex-grow">
                    <p className="text-sm md:text-base text-foreground mb-2">{step.instruction}</p>
                    {imageInfo && (
                        <img
                            src={getImageUrl(imageInfo.file_path)}
                            alt={imageInfo.description || `Image étape ${index + 1}`}
                            className="max-w-xs md:max-w-sm rounded-md border shadow-sm"
                        />
                    )}
                </div>
            </div>
        );
    };

    const TrainerFaqPage = () => {
      const [faqList, setFaqList] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
      const [searchTerm, setSearchTerm] = useState('');
      const [newQuestion, setNewQuestion] = useState('');
      const { toast } = useToast();
      const navigate = useNavigate();

      const loadFaqs = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getFaqData();
            setFaqList(data || []);
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de charger la FAQ.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
      }, [toast]);

      useEffect(() => {
        loadFaqs();
      }, [loadFaqs]);

      const handleSearchChange = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
      };

      const handleQuestionSubmit = async (e) => {
        e.preventDefault();
        if (!newQuestion.trim()) {
          toast({ title: "Question vide", description: "Veuillez écrire votre question.", variant: "destructive" });
          return;
        }
        try {
            await addFaqQuestion(newQuestion);
            setNewQuestion('');
            toast({
              title: "Question envoyée !",
              description: "Votre question a été soumise. Une réponse sera ajoutée dès que possible.",
              className: "bg-primary text-primary-foreground"
            });
            loadFaqs();
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible d'envoyer la question.", variant: "destructive" });
        }
      };

      const filteredFaq = faqList.filter(item =>
        item.question.toLowerCase().includes(searchTerm) ||
        (item.category && item.category.toLowerCase().includes(searchTerm))
      );

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto p-4 md:p-6"
        >
          <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour
          </Button>

          <Card className="mb-8 shadow-lg bg-gradient-to-br from-primary/10 via-background to-background">
            <CardHeader className="text-center">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
                <HelpCircle className="mx-auto h-16 w-16 text-primary mb-3" />
              </motion.div>
              <CardTitle className="text-3xl md:text-4xl font-extrabold text-primary">FAQ Formateurs</CardTitle>
              <CardDescription className="text-md md:text-lg text-muted-foreground mt-1">
                Trouvez des réponses aux questions fréquentes et des solutions aux difficultés rencontrées.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-6">
                <Input
                  type="text"
                  placeholder="Rechercher une question, un mot-clé..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 text-base h-12 border-primary/50 focus:border-primary"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
             <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : filteredFaq.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-3">
              {filteredFaq.map((item) => (
                <motion.div key={item.id} initial={{ opacity: 0, y:10 }} animate={{ opacity: 1, y:0 }} transition={{ duration: 0.2 }}>
                  <AccordionItem value={item.id} className="border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
                    <AccordionTrigger className="p-4 md:p-5 text-left hover:no-underline">
                      <span className="text-md md:text-lg font-medium text-primary">{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 md:p-5 border-t">
                      <div className="space-y-4">
                        {item.answer_steps && item.answer_steps.map((step, index) => (
                           <FaqAnswerStep key={index} step={step} index={index} />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">Catégorie: {item.category}</p>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aucune Q&R ne correspond à votre recherche.</p>
          )}

          <Card className="mt-10 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl md:text-2xl text-secondary">
                <MessageSquare className="mr-3 h-7 w-7" /> Vous ne trouvez pas de réponse ?
              </CardTitle>
              <CardDescription>Posez votre question ici. Elle sera ajoutée à la FAQ avec une réponse dès que possible.</CardDescription>
            </CardHeader>
            <form onSubmit={handleQuestionSubmit}>
              <CardContent>
                <Label htmlFor="new-question" className="sr-only">Votre question</Label>
                <Textarea
                  id="new-question"
                  placeholder="Écrivez votre question ici..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  rows={4}
                  className="text-base"
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full md:w-auto ml-auto bg-secondary hover:bg-secondary/90">
                  <Send className="mr-2 h-4 w-4" /> Envoyer ma question
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      );
    };

    export default TrainerFaqPage;