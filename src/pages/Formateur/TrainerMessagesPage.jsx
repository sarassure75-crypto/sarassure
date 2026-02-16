import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Archive, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';

export default function TrainerMessagesPage() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    if (currentUser) {
      loadMessages();
    }
  }, [currentUser]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('recipient_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await supabase.from('contact_messages').update({ read: true }).eq('id', id);

      setMessages(messages.map((m) => (m.id === id ? { ...m, read: true } : m)));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const deleteMessage = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce message?')) {
      try {
        await supabase.from('contact_messages').delete().eq('id', id);

        setMessages(messages.filter((m) => m.id !== id));
        setSelectedMessage(null);
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="text-primary" />
            Messages
          </h1>
          <p className="text-gray-600 mt-1">Gérez vos messages reçus</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : messages.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun message</h3>
              <p className="text-gray-600">Vous n'avez pas reçu de messages pour le moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste des messages */}
            <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
              {messages.map((message) => (
                <Card
                  key={message.id}
                  className={`cursor-pointer transition-all ${
                    selectedMessage?.id === message.id
                      ? 'border-primary bg-primary/5'
                      : !message.read
                      ? 'border-yellow-200 bg-yellow-50'
                      : ''
                  }`}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (!message.read) {
                      markAsRead(message.id);
                    }
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium truncate ${
                            !message.read ? 'text-yellow-900 font-bold' : 'text-gray-900'
                          }`}
                        >
                          {message.name || message.email}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{message.subject}</p>
                      </div>
                      {!message.read && (
                        <div className="h-2 w-2 bg-yellow-500 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Détail du message */}
            <div className="lg:col-span-2">
              {selectedMessage ? (
                <Card>
                  <CardHeader className="border-b">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{selectedMessage.subject}</CardTitle>
                        <CardDescription className="mt-2">
                          <p>
                            <strong>De:</strong> {selectedMessage.name} ({selectedMessage.email})
                          </p>
                          <p>
                            <strong>Date:</strong>{' '}
                            {new Date(selectedMessage.created_at).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deleteMessage(selectedMessage.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Mail className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Sélectionnez un message pour le lire</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
