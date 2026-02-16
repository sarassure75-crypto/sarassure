import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2, Server, FileCode2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const fetchTableData = async (tableName, select = '*') => {
  const { data, error } = await supabase.from(tableName).select(select);
  if (error) throw error;
  return data;
};

const DatabaseExplorerPage = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tablesToFetch = {
          tasks: 'id, title, description, category, creation_status',
          versions: 'id, name, task_id, creation_status',
          steps: 'id, version_id, instruction, action_type, step_order',
          profiles: 'id, first_name, last_name, role, email',
          task_categories: '*',
          app_images: 'id, name, category, file_path',
          faq_items: 'id, question, category',
        };

        const promises = Object.entries(tablesToFetch).map(([tableName, select]) =>
          fetchTableData(tableName, select).then((result) => ({ [tableName]: result }))
        );

        const results = await Promise.all(promises);
        const fetchedData = results.reduce((acc, current) => ({ ...acc, ...current }), {});

        setData(fetchedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Server className="mr-3 text-primary" />
            Explorateur de Débogage
          </CardTitle>
          <CardDescription>
            Vue en temps réel des données brutes de votre base Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <Card className="bg-destructive/10 border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center">
                  <AlertCircle className="mr-2" />
                  Erreur de chargement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{error}</p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 w-full">
                {Object.keys(data).map((tableName) => (
                  <TabsTrigger key={tableName} value={tableName} className="capitalize">
                    {tableName.replace('_', ' ')}
                  </TabsTrigger>
                ))}
              </TabsList>
              {Object.entries(data).map(([tableName, tableData]) => (
                <TabsContent key={tableName} value={tableName}>
                  <Card className="mt-4">
                    <CardHeader className="flex flex-row justify-between items-center">
                      <div>
                        <CardTitle className="capitalize flex items-center">
                          <FileCode2 className="mr-2" />
                          {tableName.replace('_', ' ')}
                        </CardTitle>
                        <CardDescription>
                          Contient {tableData.length} enregistrement(s).
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigator.clipboard.writeText(JSON.stringify(tableData, null, 2))
                        }
                      >
                        Copier JSON
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-background-dark text-foreground-dark p-4 rounded-md overflow-auto text-xs max-h-[60vh] border">
                        {JSON.stringify(tableData, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseExplorerPage;
