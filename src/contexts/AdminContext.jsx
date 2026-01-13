
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { invalidateAllCaches } from '@/lib/retryUtils';
import { 
  fetchTasks, 
  fetchTaskCategories, 
  updateTask as apiUpdateTask, 
  addTask as apiCreateTask,
  deleteTask as apiDeleteTask, 
  upsertVersion as apiUpsertVersion, 
  deleteVersion as apiDeleteVersion, 
  upsertManySteps as apiUpsertManySteps,
  deleteStep as apiDeleteStep, 
  addTaskCategory as apiAddCategory, 
  renameTaskCategory as apiRenameCategory, 
  deleteTaskCategory as apiDeleteCategory,
  fetchCategoriesHierarchy as apiFetchCategoriesHierarchy,
  addSubcategory as apiAddSubcategory,
  updateSubcategoryParent as apiUpdateSubcategoryParent,
  removeSubcategoryParent as apiRemoveSubcategoryParent,
  fetchDeletedTasks,
  restoreTask,
  permanentlyDeleteTask
} from '@/data/tasks';
import { fetchImages, getImageCategories, deleteImage as apiDeleteImage } from '@/data/images';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [images, setImages] = useState(new Map());
  const [categories, setCategories] = useState([]);
  const [categoriesHierarchy, setCategoriesHierarchy] = useState([]);
  const [imageCategories, setImageCategories] = useState(['all']);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const refreshImageCategories = useCallback(async () => {
    try {
      const cats = await getImageCategories();
      setImageCategories(cats);
    } catch (e) {
      console.error("Failed to refresh image categories", e);
    }
  }, []);

  const fetchAllData = useCallback(async (forceRefresh = false) => {
      setIsLoading(true);
      setError(null);
      try {
        const [tasksData, categoriesData, hierarchyData, imagesMapData, imgCategoriesData] = await Promise.all([
            fetchTasks(forceRefresh),
            fetchTaskCategories(forceRefresh),
            apiFetchCategoriesHierarchy(),
            fetchImages(forceRefresh),
            getImageCategories(forceRefresh)
        ]);
        setTasks(tasksData || []);
        setCategories(categoriesData || []);
        setCategoriesHierarchy(hierarchyData || []);
        setImages(imagesMapData || new Map());
        setImageCategories(imgCategoriesData || ['all']);
        return { tasksData: tasksData || [], categoriesData: categoriesData || [], hierarchyData: hierarchyData || [] };
      } catch (error) {
        const errorMessage = "Impossible de recharger les données.";
        console.error("Error fetching admin data:", error);
        setError(errorMessage);
        return { tasksData: [], categoriesData: [], hierarchyData: [] };
      } finally {
        setIsLoading(false);
      }
  }, []); // Supprime toast des dépendances pour éviter la boucle

  const deleteImage = async (imageId, filePath) => {
    console.log('🗑️ [AdminContext] deleteImage called with id:', imageId);
    try {
      await apiDeleteImage(imageId, filePath);
    } catch (e) {
      console.error('AdminContext.deleteImage: error deleting image', e);
      // If deletion fails, refresh full data to reconcile state
      await fetchAllData(true);
      throw e;
    }

    // Refresh all data after successful deletion to ensure UI is consistent
    // This removes the image from the Map and refreshes categories
    console.log('✅ [AdminContext] Deletion successful, refreshing all data...');
    await fetchAllData(true);
  };

  useEffect(() => {
    fetchAllData();
  }, []); // Utilise tableau vide pour n'exécuter qu'une fois au montage
  
  const createTask = async (taskData) => {
    const newTask = await apiCreateTask(taskData);
    await fetchAllData(true);
    return newTask;
  };
  
  const updateTask = async (taskId, updates) => {
    const updatedTask = await apiUpdateTask(taskId, updates);
    await fetchAllData(true);
    return updatedTask;
  };
  
  const deleteTask = async (taskId) => {
    await apiDeleteTask(taskId);
    // Invalider TOUS les caches (localStorage + Service Worker)
    await invalidateAllCaches();
    await fetchAllData(true);
  };
  
  const upsertVersion = async (versionData) => {
    const newVersion = await apiUpsertVersion(versionData);
    await fetchAllData(true);
    return newVersion;
  };

  const deleteVersion = async (versionId) => {
    await apiDeleteVersion(versionId);
    await fetchAllData(true);
  };

  const upsertManySteps = async (stepsData) => {
    const newSteps = await apiUpsertManySteps(stepsData);
    await fetchAllData(true);
    return newSteps;
  }
  
  const deleteStep = async (stepId) => {
    await apiDeleteStep(stepId);
    await fetchAllData(true);
  };
  
  const addCategory = async (name) => {
    await apiAddCategory(name);
    const { categoriesData } = await fetchAllData(true);
    return categoriesData;
  };
  
  const renameCategory = async (id, newName) => {
    await apiRenameCategory(id, newName);
    const { categoriesData } = await fetchAllData(true);
    return categoriesData;
  };
  
  const deleteCategory = async (id) => {
    await apiDeleteCategory(id);
    const { categoriesData } = await fetchAllData(true);
    return categoriesData;
  };

  const addSubcategory = async (parentCategoryId, subcategoryName) => {
    await apiAddSubcategory(parentCategoryId, subcategoryName);
    const { hierarchyData } = await fetchAllData(true);
    return hierarchyData;
  };

  const updateSubcategoryParent = async (subcategoryId, newParentId) => {
    await apiUpdateSubcategoryParent(subcategoryId, newParentId);
    const { hierarchyData } = await fetchAllData(true);
    return hierarchyData;
  };

  const removeSubcategoryParent = async (categoryId) => {
    await apiRemoveSubcategoryParent(categoryId);
    const { hierarchyData } = await fetchAllData(true);
    return hierarchyData;
  };

  const value = {
    tasks,
    images,
    categories,
    categoriesHierarchy,
    imageCategories,
    isLoading,
    error,
    fetchAllData,
    createTask,
    updateTask,
    deleteTask,
    upsertVersion,
    deleteVersion,
    upsertManySteps,
    deleteStep,
    addCategory,
    renameCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategoryParent,
    removeSubcategoryParent,
    fetchDeletedTasks,
    restoreTask,
    permanentlyDeleteTask,
    refreshImageCategories
    ,
    deleteImage
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
