import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, X, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const LearnerNotesViewer = ({ open, onClose, taskId, userId }) => {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && userId) {
      fetchNotes();
    }
  }, [open, taskId, userId]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('learner_notes')
        .select(
          `
          id,
          note_text,
          created_at,
          versions:version_id(name),
          steps:step_id(instruction),
          learner_note_images(image_url)
        `
        )
        .eq('user_id', userId)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les notes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const { error } = await supabase.from('learner_notes').delete().eq('id', noteId);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Note supprimée',
      });
      fetchNotes();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la note',
        variant: 'destructive',
      });
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Mes notes personnelles
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucune note enregistrée pour cette tâche</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <Card key={note.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            {new Date(note.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </CardTitle>
                          {note.versions && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Version : {note.versions.name}
                            </p>
                          )}
                          {note.steps && (
                            <p className="text-xs text-muted-foreground">
                              Étape : {note.steps.instruction}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {note.note_text && (
                        <p className="text-sm whitespace-pre-wrap mb-3">{note.note_text}</p>
                      )}
                      {note.learner_note_images && note.learner_note_images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {note.learner_note_images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img.image_url}
                              alt={`Capture ${idx + 1}`}
                              className="rounded border w-full h-32 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(img.image_url, '_blank')}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LearnerNotesViewer;
