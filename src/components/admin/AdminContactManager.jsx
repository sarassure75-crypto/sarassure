import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { getContactMessages, markMessageAsRead, markMessageAsReplied, deleteContactMessage, getUnreadCount } from '@/data/contactMessages';
import { Mail, MailOpen, Reply, Trash2, RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminContactManager() {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
    loadUnreadCount();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getContactMessages();
      setMessages(data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les messages',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    const count = await getUnreadCount();
    setUnreadCount(count);
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await markMessageAsRead(messageId);
      await loadMessages();
      await loadUnreadCount();
      toast({
        title: 'Message marqué comme lu'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer le message',
        variant: 'destructive'
      });
    }
  };

  const handleMarkAsReplied = async (messageId) => {
    try {
      await markMessageAsReplied(messageId);
      await loadMessages();
      await loadUnreadCount();
      toast({
        title: 'Message marqué comme répondu'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer le message',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;
    
    try {
      await deleteContactMessage(selectedMessage.id);
      await loadMessages();
      await loadUnreadCount();
      setShowDeleteDialog(false);
      setSelectedMessage(null);
      toast({
        title: 'Message supprimé'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le message',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Messages de Contact
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Gérez les messages reçus via le formulaire de contact
              </CardDescription>
            </div>
            <Button
              onClick={loadMessages}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Chargement...
            </p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun message reçu
            </p>
          ) : (
            <div className="space-y-3">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    !message.is_read ? 'bg-blue-50 border-blue-200' : 'hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* En-tête */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {!message.is_read ? (
                          <Mail className="w-4 h-4 text-blue-600" />
                        ) : (
                          <MailOpen className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="font-medium">{message.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ({message.email})
                        </span>
                        {message.replied && (
                          <Badge variant="outline" className="text-xs">
                            <Reply className="w-3 h-3 mr-1" />
                            Répondu
                          </Badge>
                        )}
                      </div>

                      {/* Sujet */}
                      {message.subject && (
                        <p className="font-medium text-sm">
                          Sujet: {message.subject}
                        </p>
                      )}

                      {/* Message */}
                      <p className="text-sm whitespace-pre-wrap bg-white p-3 rounded border">
                        {message.message}
                      </p>

                      {/* Date */}
                      <p className="text-xs text-muted-foreground">
                        Reçu le {formatDate(message.created_at)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {!message.is_read && (
                        <Button
                          onClick={() => handleMarkAsRead(message.id)}
                          variant="outline"
                          size="sm"
                          title="Marquer comme lu"
                        >
                          <MailOpen className="w-4 h-4" />
                        </Button>
                      )}
                      {!message.replied && (
                        <Button
                          onClick={() => handleMarkAsReplied(message.id)}
                          variant="outline"
                          size="sm"
                          title="Marquer comme répondu"
                        >
                          <Reply className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          setSelectedMessage(message);
                          setShowDeleteDialog(true);
                        }}
                        variant="outline"
                        size="sm"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce message ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le message sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
