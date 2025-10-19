import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
// pages
import GetStarted from '../pages/GetStarted';
import Features from '../pages/Features';
import About from '../pages/About';
import Calendar from '../user/pages/Calendar';
import TaskFlow from '../user/pages/TaskFlow';
import Profile from '../user/pages/Profile';
import AdminLayout from '../admin/AdminLayout';
import AdminDashboard from '../admin/admin-pages/AdminDashboard';
import AdminCalendar from '../admin/admin-pages/AdminCalendar';
import AdminCreateTask from '../admin/admin-pages/AdminCreateTask';
import AdminTeamMembers from '../admin/admin-pages/AdminTeamMembers';
import Dashboard from '../user/pages/DashboardUser';
import AddNewTeamMember from '../admin/admin-pages/AdminCreateUser';
import Layout from '../pages/page/Layout';
import Home from '../pages/page/Home';
import UserLayout from '../user/UserLayout';
import { AuthProvider, AdminRoute, UserRoute } from '../auth/context/ProtectedRoutes';
import NotFound from '../auth/NotFound';

const Router = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/error" element={<NotFound />} />

                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="features" element={<Features />} />
                        <Route path="about" element={<About />} />
                        <Route path="get-started" element={<GetStarted />} />
                    </Route>
                    
                    <Route element={<UserRoute />}>
                        <Route path="/user-layout" element={<UserLayout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="calendar" element={<Calendar />} />
                            <Route path="taskflow" element={<TaskFlow />} />
                            <Route path="profile" element={<Profile />} />
                        </Route>
                    </Route>

                    <Route element={<AdminRoute />}>
                        <Route path='/admin-layout' element={<AdminLayout />}>
                            <Route index element={<AdminDashboard />} />
                            <Route path='admin-dashboard' element={<AdminDashboard />} />
                            <Route path='admin-calendar' element={<AdminCalendar />} />
                            <Route path='admin-create-user' element={<AddNewTeamMember />} />
                            <Route path='admin-create-task' element={<AdminCreateTask />} />
                            <Route path='admin-team-members' element={<AdminTeamMembers />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default Router;