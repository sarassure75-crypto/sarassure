import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { USER_ROLES } from '@/data/users';
import { AdminProvider } from '@/contexts/AdminContext';
import PwaInstallButton from '@/components/PwaInstallButton';
import OfflineIndicator from '@/components/OfflineIndicator';
import LoadingFallback from '@/components/LoadingFallback';

// Pages chargées immédiatement (critiques pour le démarrage)
import Layout from '@/pages/Layout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Composant de chargement amélioré
const PageLoader = () => (
  <LoadingFallback message="Chargement de la page..." />
);

// Pages chargées à la demande (lazy loading)
const TaskListPage = lazy(() => import('@/pages/TaskListPage'));
const ExercisePage = lazy(() => import('@/pages/ExercisePage'));
const ExerciseStepsPreviewPage = lazy(() => import('@/pages/ExerciseStepsPreviewPage'));
const QuestionnairePlayerPage = lazy(() => import('@/pages/QuestionnairePlayerPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const TrainerDashboardPage = lazy(() => import('@/pages/TrainerDashboardPage'));
const TrainerFaqPage = lazy(() => import('@/pages/TrainerFaqPage'));
const ReportErrorPage = lazy(() => import('@/pages/ReportErrorPage'));
const LearnerLoginPage = lazy(() => import('@/pages/LearnerLoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const TrainerAccountPage = lazy(() => import('@/pages/TrainerAccountPage'));
const LearnerAccountPage = lazy(() => import('@/pages/LearnerAccountPage'));
const LearnerProgressPage = lazy(() => import('@/pages/LearnerProgressPage'));
const PwaHomePage = lazy(() => import('@/pages/PwaHomePage'));
const DashboardRedirector = lazy(() => import('@/pages/DashboardRedirector'));
const AppPresentationPage = lazy(() => import('@/pages/AppPresentationPage'));

// Pages Contributeur
const ContributorDashboard = lazy(() => import('@/pages/ContributorDashboard'));
const NewContribution = lazy(() => import('@/pages/NewContribution'));
const QuestionnaireCreation = lazy(() => import('@/pages/QuestionnaireCreation'));
const MyContributions = lazy(() => import('@/pages/MyContributions'));
const TermsOfServicePage = lazy(() => import('@/pages/TermsOfServicePage'));
const ContributorSalesHistory = lazy(() => import('@/components/ContributorSalesHistory'));
const ContributorImageLibrary = lazy(() => import('@/pages/ContributorImageLibrary'));
const ContributorProfilePage = lazy(() => import('@/pages/ContributorProfilePage'));
const ContributorInfoPage = lazy(() => import('@/pages/ContributorInfoPage'));

// Pages Formateur
const TrainerLearnersPage = lazy(() => import('@/pages/Formateur/TrainerLearnersPage'));
const BuyLicensesPage = lazy(() => import('@/pages/Formateur/BuyLicensesPage'));
const TrainerProfilePage = lazy(() => import('@/pages/Formateur/TrainerProfilePage'));
const TrainerLicensesManagementPage = lazy(() => import('@/pages/Formateur/TrainerLicensesManagementPage'));

// Pages Admin - Modération
const ModerationPage = lazy(() => import('@/pages/ModerationPage'));
const AdminImageValidation = lazy(() => import('@/pages/AdminImageValidation'));
const AdminExerciseValidation = lazy(() => import('@/pages/AdminExerciseValidation'));
const AdminRevenueDashboard = lazy(() => import('@/pages/AdminRevenueDashboard'));

// Ressources
const WallpapersLibraryPage = lazy(() => import('@/pages/WallpapersLibraryPage'));
const ExerciseRequestsList = lazy(() => import('@/pages/ExerciseRequestsList'));
const AdminGlossaryManager = lazy(() => import('@/components/admin/AdminGlossaryManager'));

function AppContent() {
  const location = useLocation();
  const isPwaMode = window.matchMedia('(display-mode: standalone)').matches || new URLSearchParams(location.search).get('mode') === 'pwa';

  if (isPwaMode && location.pathname === '/') {
     return (
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Layout pwaMode={true} />}>
              <Route index element={<PwaHomePage />} />
              <Route path="taches" element={<ProtectedRoute roles={[USER_ROLES.LEARNER, USER_ROLES.TRAINER, USER_ROLES.ADMIN]}><TaskListPage /></ProtectedRoute>} />
              <Route path="questionnaire/:taskId" element={<ProtectedRoute roles={[USER_ROLES.LEARNER, USER_ROLES.TRAINER, USER_ROLES.ADMIN]}><QuestionnairePlayerPage /></ProtectedRoute>} />
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
        </Suspense>
      );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="learner-login" element={<LearnerLoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="pwa-home" element={<PwaHomePage />} />
        <Route path="dashboard-redirect" element={<DashboardRedirector />} />
        
        {/* Page publique de présentation de l'application */}
        <Route path="presentation" element={<AppPresentationPage />} />
        
        {/* Page publique d'information contributeur */}
        <Route path="devenir-contributeur" element={<ContributorInfoPage />} />
        
        <Route path="taches" element={<ProtectedRoute roles={[USER_ROLES.LEARNER, USER_ROLES.TRAINER, USER_ROLES.ADMIN]}><TaskListPage /></ProtectedRoute>} />
        <Route path="questionnaire/:taskId" element={<ProtectedRoute roles={[USER_ROLES.LEARNER, USER_ROLES.TRAINER, USER_ROLES.ADMIN]}><QuestionnairePlayerPage /></ProtectedRoute>} />
        <Route path="tache/:taskId" element={<ProtectedRoute roles={[USER_ROLES.LEARNER, USER_ROLES.TRAINER, USER_ROLES.ADMIN]}><ExerciseStepsPreviewPage /></ProtectedRoute>} />
        <Route path="tache/:taskId/version/:versionId" element={<ProtectedRoute roles={[USER_ROLES.LEARNER, USER_ROLES.TRAINER, USER_ROLES.ADMIN]}><ExercisePage /></ProtectedRoute>} />
        
        <Route path="admin/preview/tache/:taskId/version/:versionId" element={<ProtectedRoute roles={[USER_ROLES.ADMIN]}><ExercisePage /></ProtectedRoute>} />
        
        <Route path="report-error" element={<ProtectedRoute roles={[USER_ROLES.LEARNER, USER_ROLES.TRAINER, USER_ROLES.ADMIN]}><ReportErrorPage /></ProtectedRoute>} />
        <Route path="mon-suivi" element={<ProtectedRoute roles={[USER_ROLES.LEARNER]}><LearnerProgressPage /></ProtectedRoute>} />
        <Route path="compte-apprenant" element={<ProtectedRoute roles={[USER_ROLES.LEARNER]}><LearnerAccountPage /></ProtectedRoute>} />

        {/* Route Admin - Gestion du Lexique */}
        <Route path="admin/lexique" element={<ProtectedRoute roles={[USER_ROLES.ADMIN]}><AdminGlossaryManager /></ProtectedRoute>} />

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
        <Route path="contributeur/questionnaire" element={<ProtectedRoute roles={[USER_ROLES.ADMIN, USER_ROLES.CONTRIBUTOR]}><QuestionnaireCreation /></ProtectedRoute>} />
        <Route path="contributeur/mes-contributions" element={<ProtectedRoute roles={[USER_ROLES.ADMIN, USER_ROLES.CONTRIBUTOR]}><MyContributions /></ProtectedRoute>} />
        <Route path="contributeur/liste-demandes" element={<ProtectedRoute roles={[USER_ROLES.ADMIN, USER_ROLES.CONTRIBUTOR]}><ExerciseRequestsList /></ProtectedRoute>} />
        <Route path="contributeur/bibliotheque" element={<ProtectedRoute roles={[USER_ROLES.ADMIN, USER_ROLES.CONTRIBUTOR]}><ContributorImageLibrary /></ProtectedRoute>} />
        <Route path="contributeur/ventes" element={<ProtectedRoute roles={[USER_ROLES.ADMIN, USER_ROLES.CONTRIBUTOR]}><ContributorSalesHistory /></ProtectedRoute>} />
        <Route path="contributeur/profil" element={<ProtectedRoute roles={[USER_ROLES.ADMIN, USER_ROLES.CONTRIBUTOR]}><ContributorProfilePage /></ProtectedRoute>} />
        <Route path="contributeur/cgu" element={<ProtectedRoute roles={[USER_ROLES.ADMIN, USER_ROLES.CONTRIBUTOR]}><TermsOfServicePage /></ProtectedRoute>} />
        
        {/* Ressources publiques / contributeurs */}
        <Route path="ressources/wallpapers" element={<WallpapersLibraryPage />} />
        <Route path="wallpapers" element={<WallpapersLibraryPage />} />
        
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
    </Suspense>
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