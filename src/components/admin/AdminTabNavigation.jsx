import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, LayoutGrid, Image, CheckCircle, Users, MessageSquare, AlertTriangle, Mail, ListTodo, DollarSign } from 'lucide-react';

export default function AdminTabNavigation({ counters = {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathSegment = location.pathname.split('/admin/')[1] || 'dashboard';

  // Déterminer l'onglet actif
  let currentTab = 'dashboard';
  if (pathSegment === 'dashboard') currentTab = 'dashboard';
  else if (pathSegment === 'categories') currentTab = 'categories';
  else if (pathSegment === 'images') currentTab = 'images';
  else if (pathSegment === 'validation/images') currentTab = 'validation-images';
  else if (pathSegment === 'validation/exercices') currentTab = 'validation-exercices';
  else if (pathSegment === 'revenus') currentTab = 'revenus';
  else if (pathSegment === 'users') currentTab = 'users';
  else if (pathSegment === 'faq') currentTab = 'faq';
  else if (pathSegment === 'errors') currentTab = 'errors';
  else if (pathSegment === 'contact') currentTab = 'contact';

  const navItems = [
    { id: 'dashboard', label: 'Tâches', icon: ListTodo, path: '/admin/dashboard', count: 0 },
    { id: 'categories', label: 'Catégories', icon: LayoutGrid, path: '/admin/categories', count: 0 },
    { id: 'images', label: 'Images', icon: Image, path: '/admin/images', count: 0 },
    { id: 'validation-images', label: 'Valider images', icon: CheckCircle, path: '/admin/validation/images', count: counters.pendingImages || 0 },
    { id: 'validation-exercices', label: 'Valider exercices', icon: CheckCircle, path: '/admin/validation/exercices', count: counters.pendingContributions || 0 },
    { id: 'revenus', label: 'Revenus', icon: DollarSign, path: '/admin/revenus', count: 0 },
    { id: 'users', label: 'Utilisateurs', icon: Users, path: '/admin/users', count: 0 },
    { id: 'faq', label: 'FAQ', icon: MessageSquare, path: '/admin/faq', count: counters.pendingFaq || 0 },
    { id: 'errors', label: 'Rapports', icon: AlertTriangle, path: '/admin/errors', count: 0 },
    { id: 'contact', label: 'Messages', icon: Mail, path: '/admin/contact', count: counters.pendingMessages || 0 },
  ];

  return (
    <div className="grid grid-cols-5 md:grid-cols-5 lg:grid-cols-10 gap-2 mb-6">
      {navItems.map(item => (
        <Button
          key={item.id}
          onClick={() => navigate(item.path)}
          variant={currentTab === item.id ? "default" : "outline"}
          className={`w-full relative h-auto flex-col p-2 text-xs ${currentTab === item.id ? 'ring-2 ring-primary' : ''}`}
        >
          <div className="relative inline-block mb-1">
            <item.icon className="h-5 w-5" />
            {item.count > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                {item.count > 9 ? '9+' : item.count}
              </span>
            )}
          </div>
          <span className="line-clamp-1">{item.label}</span>
        </Button>
      ))}
    </div>
  );
}
