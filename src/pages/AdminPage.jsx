import React from 'react';
import {
  Route,
  Routes,
  useLocation,
  Navigate,
  useNavigate as useNavigateRouter,
} from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminTaskManager from '@/components/admin/AdminTaskManager';
import AdminImageGallery from '@/components/admin/AdminImageGallery';
import AdminFaqManager from '@/components/admin/AdminFaqManager';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import AdminErrorReportViewer from '@/components/admin/AdminErrorReportViewer';
import AdminContactManager from '@/components/admin/AdminContactManager';
import AdminTrash from '@/components/admin/AdminTrash';
import AdminCategoryManager from '@/components/admin/AdminCategoryManager';
import AdminLearnerReviews from '@/components/admin/AdminLearnerReviews';
import ExerciseRequestsManager from '@/components/admin/ExerciseRequestsManager';
import AdminPointsManager from '@/components/admin/AdminPointsManager';
import AdminQuestionnaireValidation from '@/components/admin/AdminQuestionnaireValidation';
import AdminImageValidation from './AdminImageValidation';
import AdminExerciseValidation from './AdminExerciseValidation';
import AdminExerciseValidationDebug from './AdminExerciseValidationDebug';
import AdminGlossaryManager from '@/components/admin/AdminGlossaryManager';
import { AdminQuestionnaireTranslationManager } from '@/components/admin/AdminQuestionnaireTranslationManager';
import { AdminTranslationManager } from '@/components/TranslationComponents';
import AdminTabNavigation from '@/components/admin/AdminTabNavigation';
import { useAdminCounters } from '@/hooks/useAdminCounters';
import {
  Home,
  Image,
  ListTodo,
  Users,
  MessageSquare,
  AlertTriangle,
  Mail,
  Trash,
  LayoutGrid,
  CheckCircle,
  DollarSign,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminPage = () => {
  const location = useLocation();
  const navigate = useNavigateRouter();
  const { currentUser } = useAuth();
  const pathSegment = location.pathname.split('/admin/')[1] || 'dashboard';

  // Convertir les chemins en IDs d'onglet
  let currentTab = 'dashboard';
  if (pathSegment === 'dashboard') currentTab = 'dashboard';
  else if (pathSegment === 'categories') currentTab = 'categories';
  else if (pathSegment === 'images') currentTab = 'images';
  else if (pathSegment === 'validation/images') currentTab = 'validation-images';
  else if (pathSegment === 'validation/exercices') currentTab = 'validation-exercices';
  else if (pathSegment === 'validation/questionnaires') currentTab = 'validation-questionnaires';
  else if (pathSegment === 'revenus') currentTab = 'revenus';
  else if (pathSegment === 'points') currentTab = 'points';
  else if (pathSegment === 'requests') currentTab = 'requests';
  else if (pathSegment === 'reviews') currentTab = 'reviews';
  else if (pathSegment === 'users') currentTab = 'users';
  else if (pathSegment === 'faq') currentTab = 'faq';
  else if (pathSegment === 'lexique') currentTab = 'lexique';
  else if (pathSegment === 'traductions') currentTab = 'traductions';
  else if (pathSegment === 'traductions-qcm') currentTab = 'traductions-qcm';
  else if (pathSegment === 'errors') currentTab = 'errors';
  else if (pathSegment === 'trash') currentTab = 'trash';
  else if (pathSegment === 'contact') currentTab = 'contact';

  const { counters } = useAdminCounters();

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl">
            <Home className="mr-3 h-8 w-8 text-primary" />
            Panneau d'Administration
          </CardTitle>
          <CardDescription>
            Gérez le contenu, les utilisateurs et la configuration de l'application.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Navigation Buttons */}
      <AdminTabNavigation counters={counters} />

      <Card>
        <CardContent className="p-2 sm:p-4 md:p-6">
          <Routes>
            <Route path="dashboard" element={<AdminTaskManager />} />
            <Route path="categories" element={<AdminCategoryManager />} />
            <Route path="images" element={<AdminImageGallery />} />
            <Route path="validation/images" element={<AdminImageValidation />} />
            <Route path="validation/exercices" element={<AdminExerciseValidation />} />
            <Route path="validation/questionnaires" element={<AdminQuestionnaireValidation />} />
            <Route path="requests" element={<ExerciseRequestsManager />} />
            <Route path="reviews" element={<AdminLearnerReviews currentUser={currentUser} />} />
            <Route path="users" element={<AdminUserManagement />} />
            <Route path="faq" element={<AdminFaqManager />} />
            <Route path="lexique" element={<AdminGlossaryManager />} />
            <Route path="traductions" element={<AdminTranslationManager />} />
            <Route path="traductions-qcm" element={<AdminQuestionnaireTranslationManager />} />
            <Route path="errors" element={<AdminErrorReportViewer />} />
            <Route path="trash" element={<AdminTrash />} />
            <Route path="contact" element={<AdminContactManager />} />
            <Route path="points" element={<AdminPointsManager />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Routes>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
