import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from '@/pages/Layout';
import HomePage from '@/pages/HomePage';
import TaskListPage from '@/pages/TaskListPage';
import ExercisePage from '@/pages/ExercisePage';
import ExerciseStepsPreviewPage from '@/pages/ExerciseStepsPreviewPage';
import AdminPage from '@/pages/AdminPage';
import TrainerDashboardPage from '@/pages/TrainerDashboardPage';
import TrainerFaqPage from '@/pages/TrainerFaqPage';
import ReportErrorPage from '@/pages/ReportErrorPage';
import LoginPage from '@/pages/LoginPage';
import LearnerLoginPage from '@/pages/LearnerLoginPage';
import RegisterPage from '@/pages/RegisterPage';
import TrainerAccountPage from '@/pages/TrainerAccountPage';
import LearnerAccountPage from '@/pages/LearnerAccountPage';
import LearnerProgressPage from '@/pages/LearnerProgressPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import { USER_ROLES } from '@/data/users';
import PwaHomePage from '@/pages/PwaHomePage';
import { AdminProvider } from '@/contexts/AdminContext';
import DashboardRedirector from '@/pages/DashboardRedirector';
import PwaInstallButton from '@/components/PwaInstallButton';
import OfflineIndicator from '@/components/OfflineIndicator';

// Pages Contributeur
import ContributorDashboard from '@/pages/ContributorDashboard';
import NewContribution from '@/pages/NewContribution';
import MyContributions from '@/pages/MyContributions';
import TermsOfServicePage from '@/pages/TermsOfServicePage';
import ContributorSalesHistory from '@/components/ContributorSalesHistory';

// Pages Formateur
import TrainerLearnersPage from '@/pages/Formateur/TrainerLearnersPage';
import BuyLicensesPage from '@/pages/Formateur/BuyLicensesPage';
import TrainerProfilePage from '@/pages/Formateur/TrainerProfilePage';
import TrainerLicensesManagementPage from '@/pages/Formateur/TrainerLicensesManagementPage';
import ContributorImageLibrary from '@/pages/ContributorImageLibrary';
import ContributorProfilePage from '@/pages/ContributorProfilePage';

// Pages Admin - Modération
import ModerationPage from '@/pages/ModerationPage';
import AdminImageValidation from '@/pages/AdminImageValidation';
import AdminExerciseValidation from '@/pages/AdminExerciseValidation';
import AdminRevenueDashboard from '@/pages/AdminRevenueDashboard';

function AppContent() {
  const location = useLocation();
  const isPwaMode = window.matchMedia('(display-mode: standalone)').matches || new URLSearchParams(location.search).get('mode') === 'pwa';

  if (isPwaMode && location.pathname === '/') {
     return (
        <Routes>
          <Route path="/" element={<Layout pwaMode={true} />}>
            <Route index element={<PwaHomePage />} />
            <Route path="taches" element={<ProtectedRoute roles={[USER_ROLES.LEARNER, USER_ROLES.TRAINER, USER_ROLES.ADMIN]}><TaskListPage /></ProtectedRoute>} />
            <Route path="tache/:taskId" element={<ProtectedRoute roles={[USER_ROLES.LEARNER, USER_ROLES.TRAINER, USER_ROLES.ADMIN]}><ExerciseStepsPreviewPage /></ProtectedRoute>} />
            <Route path="tache/:taskId/version/:versionId" element={<ProtectedRoute roles={[USER_ROLES.LEARNER, USER_ROLES.TRAINER, USER_ROLES.ADMIN]}><ExercisePage /></ProtectedRoute>} />
            <Route path="formateur" element={<ProtectedRoute roles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]}><TrainerDashboardPage /></ProtectedRoute>} />
            <Route path="formateur/faq" element={<ProtectedRoute roles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]}><TrainerFaqPage /></ProtectedRoute>} />
            <Route path="mon-suivi" element={<ProtectedRoute roles={[USER_ROLES.LEARNER]}><LearnerProgressPage /></ProtectedRoute>} />
            <Route path="compte-apprenant" element={<ProtectedRoute roles={[USER_ROLES.LEARNER]}><LearnerAccountPage /></ProtectedRoute>} />
            <Route path="compte-formateur" element={<ProtectedRoute roles={[USER_ROLES.TRAINER]}><TrainerAccountPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="learner-login" element={<LearnerLoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="pwa-home" element={<PwaHomePage />} />
        <Route path="dashboard-redirect" element={<DashboardRedirector />} />
        
        <Route path="taches" element={<ProtectedRoute roles={[USER_ROLES.LEARNER, USER_ROLES.TRAINER, USER_ROLES.ADMIN]}><TaskListPage /></ProtectedRoute>} />
        <Route path="tache/:taskId" element={<ProtectedRoute roles={[USER_ROLES.LEARNER, USER_ROLES.TRAINER, USER_ROLES.ADMIN]}><ExerciseStepsPreviewPage /></ProtectedRoute>} />
        <Route path="tache/:taskId/version/:versionId" element={<ProtectedRoute roles={[USER_ROLES.LEARNER, USER_ROLES.TRAINER, USER_ROLES.ADMIN]}><ExercisePage /></ProtectedRoute>} />
        
        <Route path="admin/preview/tache/:taskId/version/:versionId" element={<ProtectedRoute roles={[USER_ROLES.ADMIN]}><ExercisePage /></ProtectedRoute>} />
        
        <Route path="report-error" element={<ProtectedRoute roles={[USER_ROLES.LEARNER, USER_ROLES.TRAINER, USER_ROLES.ADMIN]}><ReportErrorPage /></ProtectedRoute>} />
        <Route path="mon-suivi" element={<ProtectedRoute roles={[USER_ROLES.LEARNER]}><LearnerProgressPage /></ProtectedRoute>} />
        <Route path="compte-apprenant" element={<ProtectedRoute roles={[USER_ROLES.LEARNER]}><LearnerAccountPage /></ProtectedRoute>} />

        <Route path="admin/*" element={
          <ProtectedRoute roles={[USER_ROLES.ADMIN]}>
            <AdminProvider>
              <AdminPage />
            </AdminProvider>
          </ProtectedRoute>
        } />
        
        {/* Routes Contributeur */}
        <Route path="contributeur" element={<ProtectedRoute roles={[USER_ROLES.ADMIN, USER_ROLES.CONTRIBUTOR]}><ContributorDashboard /></ProtectedRoute>} />
        <Route path="contributeur/nouvelle-contribution" element={<ProtectedRoute roles={[USER_ROLES.ADMIN, USER_ROLES.CONTRIBUTOR]}><NewContribution /></ProtectedRoute>} />
        <Route path="contributeur/mes-contributions" element={<ProtectedRoute roles={[USER_ROLES.ADMIN, USER_ROLES.CONTRIBUTOR]}><MyContributions /></ProtectedRoute>} />
        <Route path="contributeur/bibliotheque" element={<ProtectedRoute roles={[USER_ROLES.ADMIN, USER_ROLES.CONTRIBUTOR]}><ContributorImageLibrary /></ProtectedRoute>} />
        <Route path="contributeur/ventes" element={<ProtectedRoute roles={[USER_ROLES.ADMIN, USER_ROLES.CONTRIBUTOR]}><ContributorSalesHistory /></ProtectedRoute>} />
        <Route path="contributeur/profil" element={<ProtectedRoute roles={[USER_ROLES.ADMIN, USER_ROLES.CONTRIBUTOR]}><ContributorProfilePage /></ProtectedRoute>} />
        <Route path="contributeur/cgu" element={<ProtectedRoute roles={[USER_ROLES.ADMIN, USER_ROLES.CONTRIBUTOR]}><TermsOfServicePage /></ProtectedRoute>} />
        
        {/* Routes Admin - Modération */}
        <Route path="admin/moderation" element={<ProtectedRoute roles={[USER_ROLES.ADMIN]}><ModerationPage /></ProtectedRoute>} />
        <Route path="admin/validation/images" element={<ProtectedRoute roles={[USER_ROLES.ADMIN]}><AdminImageValidation /></ProtectedRoute>} />
        <Route path="admin/validation/exercices" element={<ProtectedRoute roles={[USER_ROLES.ADMIN]}><AdminExerciseValidation /></ProtectedRoute>} />
        <Route path="admin/revenus" element={<ProtectedRoute roles={[USER_ROLES.ADMIN]}><AdminRevenueDashboard /></ProtectedRoute>} />
        
        <Route path="formateur" element={<ProtectedRoute roles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]}><TrainerDashboardPage /></ProtectedRoute>} />
        <Route path="formateur/apprenants" element={<ProtectedRoute roles={[USER_ROLES.TRAINER]}><TrainerLearnersPage /></ProtectedRoute>} />
        <Route path="formateur/acheter-licences" element={<ProtectedRoute roles={[USER_ROLES.TRAINER]}><BuyLicensesPage /></ProtectedRoute>} />
        <Route path="formateur/gestion-licences" element={<ProtectedRoute roles={[USER_ROLES.TRAINER]}><TrainerLicensesManagementPage /></ProtectedRoute>} />
        <Route path="formateur/faq" element={<ProtectedRoute roles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]}><TrainerFaqPage /></ProtectedRoute>} />
        <Route path="formateur/profil" element={<ProtectedRoute roles={[USER_ROLES.TRAINER]}><TrainerProfilePage /></ProtectedRoute>} />
        <Route path="compte-formateur" element={<ProtectedRoute roles={[USER_ROLES.TRAINER]}><TrainerAccountPage /></ProtectedRoute>} />
        
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

function App(){
  return (
    <>
      <AppContent />
      <PwaInstallButton />
      <OfflineIndicator />
    </>
  );
}

export default App;