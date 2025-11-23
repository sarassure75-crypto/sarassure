import { useState, useCallback } from 'react';

    export const useAdminView = () => {
      const [selectedTask, setSelectedTask] = useState(null);
      const [selectedVersion, setSelectedVersion] = useState(null);
      const [selectedStep, setSelectedStep] = useState(null);
      const [editingStepIndex, setEditingStepIndex] = useState(null);

      const [isEditingTask, setIsEditingTask] = useState(false);
      const [isEditingVersion, setIsEditingVersion] = useState(false);
      const [isEditingStep, setIsEditingStep] = useState(false);

      const [currentView, setCurrentView] = useState('task-list');
      const [viewHistory, setViewHistory] = useState([]);

      const navigateToView = useCallback((view, stateUpdates = {}) => {
        setViewHistory(prev => [...prev, {
          view: currentView,
          task: selectedTask,
          version: selectedVersion,
          step: selectedStep,
          stepIndex: editingStepIndex,
          isEditingTask,
          isEditingVersion,
          isEditingStep
        }]);

        if (stateUpdates.selectedTask !== undefined) setSelectedTask(stateUpdates.selectedTask);
        if (stateUpdates.selectedVersion !== undefined) setSelectedVersion(stateUpdates.selectedVersion);
        if (stateUpdates.selectedStep !== undefined) setSelectedStep(stateUpdates.selectedStep);
        if (stateUpdates.editingStepIndex !== undefined) setEditingStepIndex(stateUpdates.editingStepIndex);
        if (stateUpdates.isEditingTask !== undefined) setIsEditingTask(stateUpdates.isEditingTask);
        if (stateUpdates.isEditingVersion !== undefined) setIsEditingVersion(stateUpdates.isEditingVersion);
        if (stateUpdates.isEditingStep !== undefined) setIsEditingStep(stateUpdates.isEditingStep);

        setCurrentView(view);
      }, [currentView, selectedTask, selectedVersion, selectedStep, editingStepIndex, isEditingTask, isEditingVersion, isEditingStep]);

      const navigateBack = useCallback(() => {
        if (viewHistory.length === 0) {
          setCurrentView('task-list');
          setSelectedTask(null);
          setSelectedVersion(null);
          setSelectedStep(null);
          setEditingStepIndex(null);
          setIsEditingTask(false);
          setIsEditingVersion(false);
          setIsEditingStep(false);
          setViewHistory([]);
          return;
        }
        const prevState = viewHistory[viewHistory.length - 1];
        setViewHistory(prev => prev.slice(0, -1));

        setSelectedTask(prevState.task);
        setSelectedVersion(prevState.version);
        setSelectedStep(prevState.step);
        setEditingStepIndex(prevState.stepIndex);
        setIsEditingTask(prevState.isEditingTask);
        setIsEditingVersion(prevState.isEditingVersion);
        setIsEditingStep(prevState.isEditingStep);
        setCurrentView(prevState.view);
      }, [viewHistory]);

      const resetToListView = useCallback(() => {
        setCurrentView('task-list');
        setSelectedTask(null);
        setSelectedVersion(null);
        setSelectedStep(null);
        setEditingStepIndex(null);
        setIsEditingTask(false);
        setIsEditingVersion(false);
        setIsEditingStep(false);
        setViewHistory([]);
      }, []);

      return {
        currentView,
        selectedTask,
        selectedVersion,
        selectedStep,
        editingStepIndex,
        isEditingTask,
        isEditingVersion,
        isEditingStep,
        navigateToView,
        navigateBack,
        resetToListView,
        setSelectedTask,
        setSelectedVersion,
        setSelectedStep,
        setEditingStepIndex,
        setIsEditingTask,
        setIsEditingVersion,
        setIsEditingStep,
        setCurrentView,
      };
    };