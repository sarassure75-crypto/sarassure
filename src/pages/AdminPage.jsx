import React from 'react';
import { NavLink, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminTaskManager from '@/components/admin/AdminTaskManager';
import AdminImageGallery from '@/components/admin/AdminImageGallery';
import AdminFaqManager from '@/components/admin/AdminFaqManager';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import AdminErrorReportViewer from '@/components/admin/AdminErrorReportViewer';
import AdminContactManager from '@/components/admin/AdminContactManager';
import AdminTrash from '@/components/admin/AdminTrash';
import AdminCategoryManager from '@/components/admin/AdminCategoryManager';
import { Home, Image, ListTodo, Users, MessageSquare, AlertTriangle, Mail, Trash, LayoutGrid } from 'lucide-react';

const AdminPage = () => {
    const location = useLocation();
    const currentTab = location.pathname.split('/admin/')[1] || 'dashboard';

    const navItems = [
        { id: 'dashboard', label: 'Tâches', icon: ListTodo, path: '/admin/dashboard' },
        { id: 'categories', label: 'Catégories', icon: LayoutGrid, path: '/admin/categories' },
        { id: 'images', label: 'Images', icon: Image, path: '/admin/images' },
        { id: 'users', label: 'Utilisateurs', icon: Users, path: '/admin/users' },
        { id: 'faq', label: 'FAQ', icon: MessageSquare, path: '/admin/faq' },
        { id: 'errors', label: 'Rapports', icon: AlertTriangle, path: '/admin/errors' },
        { id: 'trash', label: 'Corbeille', icon: Trash, path: '/admin/trash' },
        { id: 'contact', label: 'Messages', icon: Mail, path: '/admin/contact' },
    ];

    return (
        <div className="container mx-auto p-4">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center text-3xl">
                        <Home className="mr-3 h-8 w-8 text-primary"/>
                        Panneau d'Administration
                    </CardTitle>
                    <CardDescription>Gérez le contenu, les utilisateurs et la configuration de l'application.</CardDescription>
                </CardHeader>
            </Card>

            <Tabs value={currentTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 md:grid-cols-4 lg:grid-cols-8 mb-6">
                    {navItems.map(item => (
                        <NavLink to={item.path} key={item.id} className="w-full">
                             <TabsTrigger value={item.id} className="w-full">
                                <item.icon className="mr-2 h-4 w-4"/> {item.label}
                            </TabsTrigger>
                        </NavLink>
                    ))}
                </TabsList>
                
                <Card>
                    <CardContent className="p-2 sm:p-4 md:p-6">
                         <Routes>
                            <Route path="dashboard" element={<AdminTaskManager />} />
                            <Route path="categories" element={<AdminCategoryManager />} />
                            <Route path="images" element={<AdminImageGallery />} />
                            <Route path="users" element={<AdminUserManagement />} />
                            <Route path="faq" element={<AdminFaqManager />} />
                            <Route path="errors" element={<AdminErrorReportViewer />} />
                            <Route path="trash" element={<AdminTrash />} />
                            <Route path="contact" element={<AdminContactManager />} />
                            <Route index element={<Navigate to="dashboard" replace />} />
                        </Routes>
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    );
};

export default AdminPage;