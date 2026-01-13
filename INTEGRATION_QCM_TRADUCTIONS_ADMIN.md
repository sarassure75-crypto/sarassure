// src/components/admin/AdminDashboard.jsx - Ajout du lien vers les traductions QCM
// 
// À ajouter dans votre AdminDashboard ou menu d'administration :

/*
EXEMPLE 1: Ajouter un élément de menu

import AdminQuestionnaireTranslationManager from './AdminQuestionnaireTranslationManager';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={activeTab === 'dashboard' ? 'font-bold border-b-2' : ''}
        >
          Tableau de bord
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={activeTab === 'users' ? 'font-bold border-b-2' : ''}
        >
          Utilisateurs
        </button>
        <button
          onClick={() => setActiveTab('translations')}
          className={activeTab === 'translations' ? 'font-bold border-b-2' : ''}
        >
          🌐 Traductions QCM
        </button>
      </div>

      {activeTab === 'translations' && (
        <AdminQuestionnaireTranslationManager />
      )}
    </div>
  );
}
*/

/*
EXEMPLE 2: Ajouter une carte de lien dans l'AdminDashboard

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card 
    className="cursor-pointer hover:shadow-lg transition-shadow"
    onClick={() => navigate('/admin/glossary')}
  >
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BookOpen className="h-5 w-5" />
        Gestion du Lexique
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-gray-600">
        Gérer les termes du vocabulaire smartphone
      </p>
    </CardContent>
  </Card>

  <Card 
    className="cursor-pointer hover:shadow-lg transition-shadow"
    onClick={() => navigate('/admin/questionnaire-translations')}
  >
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Globe className="h-5 w-5" />
        Traductions QCM
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-gray-600">
        Traduire les questions et réponses des questionnaires
      </p>
    </CardContent>
  </Card>

  <Card 
    className="cursor-pointer hover:shadow-lg transition-shadow"
    onClick={() => navigate('/admin/translation-glossary')}
  >
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Languages className="h-5 w-5" />
        Traductions Lexique
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-gray-600">
        Gérer les traductions des termes du lexique
      </p>
    </CardContent>
  </Card>
</div>
*/

/*
EXEMPLE 3: Route dans React Router

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminQuestionnaireTranslationManager from '@/components/admin/AdminQuestionnaireTranslationManager';

function App() {
  return (
    <Routes>
      {/* ... autres routes */}
      <Route 
        path="/admin/questionnaire-translations"
        element={<AdminQuestionnaireTranslationManager />}
      />
    </Routes>
  );
}
*/

/*
EXEMPLE 4: Intégration avec vos ProtectedRoute

import ProtectedRoute from '@/components/ProtectedRoute';
import AdminQuestionnaireTranslationManager from '@/components/admin/AdminQuestionnaireTranslationManager';

function AdminRoutes() {
  return (
    <Routes>
      <Route
        path="/admin/questionnaire-translations"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminQuestionnaireTranslationManager />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
*/
