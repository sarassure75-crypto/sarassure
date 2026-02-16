import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { creationStatuses } from '@/data/tasks';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ChevronDown, ChevronUp, Circle } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

const AdminVersionTracking = () => {
  const { tasksData, updateSingleVersion, isLoading: isContextLoading } = useAdmin();
  const { toast } = useToast();
  const [allVersions, setAllVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedVersions, setExpandedVersions] = useState({});

  useEffect(() => {
    if (tasksData) {
      const processedVersions = tasksData.flatMap((task) =>
        (task.versions || []).map((version) => ({
          ...version,
          taskTitle: task.title,
          taskId: task.id,
        }))
      );
      setAllVersions(processedVersions);
      setIsLoading(false);
    }
  }, [tasksData]);

  const handleStatusChange = async (versionId, newStatus) => {
    const versionToUpdate = allVersions.find((v) => v.id === versionId);
    if (!versionToUpdate) return;

    const { steps, taskTitle, taskId, ...versionDataForUpdate } = versionToUpdate;
    const updatedVersionData = { ...versionDataForUpdate, creation_status: newStatus };

    try {
      await updateSingleVersion(updatedVersionData);
      toast({
        title: 'Statut mis à jour',
        description: `Le statut de la version a été changé en "${
          creationStatuses.find((s) => s.id === newStatus)?.label
        }".`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'La mise à jour du statut a échoué.',
        variant: 'destructive',
      });
    }
  };

  const toggleExpandVersion = (versionId) => {
    setExpandedVersions((prev) => ({ ...prev, [versionId]: !prev[versionId] }));
  };

  const getStatusInfo = (statusId) => {
    return (
      creationStatuses.find((s) => s.id === statusId) || { label: 'Inconnu', color: 'bg-gray-400' }
    );
  };

  if (isLoading || isContextLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Suivi de Création des Versions</CardTitle>
          <CardDescription>
            Visualisez et gérez l'état d'avancement de la création des versions.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suivi de Création des Versions</CardTitle>
        <CardDescription>
          Visualisez et gérez directement l'état d'avancement de la création des versions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60%]">Tâche / Version</TableHead>
              <TableHead className="w-[40%]">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allVersions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                  Aucune version à suivre pour le moment.
                </TableCell>
              </TableRow>
            ) : (
              allVersions.map((version) => {
                const statusInfo = getStatusInfo(version.creation_status);
                return (
                  <React.Fragment key={`${version.taskId}-${version.id}`}>
                    <TableRow>
                      <TableCell>
                        <div
                          className="font-medium flex items-center cursor-pointer"
                          onClick={() => toggleExpandVersion(version.id)}
                        >
                          {expandedVersions[version.id] ? (
                            <ChevronUp className="h-4 w-4 mr-2" />
                          ) : (
                            <ChevronDown className="h-4 w-4 mr-2" />
                          )}
                          <div>
                            <div>{version.taskTitle}</div>
                            <div className="text-sm text-muted-foreground">
                              {version.name} ({version.version || 'N/A'})
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={version.creation_status || 'to_create'}
                          onValueChange={(value) => handleStatusChange(version.id, value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue>
                              <Badge className={`${statusInfo.color} text-white`}>
                                {statusInfo.label}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {creationStatuses.map((status) => (
                              <SelectItem key={status.id} value={status.id}>
                                <Badge className={`${statusInfo.color} text-white`}>
                                  {status.label}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                    {expandedVersions[version.id] && (
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={2} className="py-2 px-8">
                          <h4 className="font-semibold text-sm mb-2">Étapes de la version :</h4>
                          {version.steps && version.steps.length > 0 ? (
                            <ul className="list-none space-y-1">
                              {version.steps.map((step, index) => (
                                <li
                                  key={index}
                                  className="text-xs text-muted-foreground flex items-center"
                                >
                                  <Circle className="h-2 w-2 mr-2 fill-current" />
                                  <span>
                                    {index + 1}. {step.instruction}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">
                              Aucune étape définie pour cette version.
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminVersionTracking;
