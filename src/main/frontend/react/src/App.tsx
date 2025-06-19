import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import theme from './theme';
import { HomePage } from './pages/HomePage';
import CourseList from "./pages/CourseList";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import CoursePage from "./pages/CoursePage";
import { useAuth } from './components/AuthContext';
import ProfilePage from "./pages/ProfilePage";
import NavigationBar from "./components/Layout/AppBar";
import MyEducationPage from "./pages/MyEducationPage";
import CourseStepper from "./pages/CourseStepper";
import TeachingPage from "./pages/TeachingPage";
import CourseCreatePage from "./pages/CourseCreatePage";
import AdminPage from "./pages/AdminPage";
import CourseManagePage from "./pages/CourseManagePage";
import ReferencesPage from "./pages/ReferencesPage";
import {JSX} from "react";

// Компонент для защиты маршрутов
const ProtectedRoute = ({ children, requiredRole }: { children: JSX.Element, requiredRole?: string }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/" replace />; // Перенаправляем на главную, если не авторизован
    }

    if (requiredRole && user?.userType !== requiredRole) {
        return <Navigate to="/" replace />; // Перенаправляем, если роль не подходит
    }

    return children;
};

function App() {
    const { isAuthenticated, user } = useAuth();

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <NavigationBar />
                <main style={{ marginTop: "64px" }}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/profile/student/:id" element={<ProfilePage />} />
                        <Route path="/profile/worker/:id" element={<ProfilePage />} />
                        <Route path="/students/:id" element={<ProfilePage />} />
                        <Route path="/courses" element={<CourseList />} />
                        <Route path="/courses/:id" element={<CoursePage />} />
                        <Route path="/courses/:id/manage" element={<CourseManagePage />} />
                        <Route path="/sign-up" element={<SignUpPage />} />
                        <Route path="/my-education" element={<MyEducationPage />} />
                        <Route path="/courses/materials/:courseId" element={<CourseStepper />} />

                        {/* Защищённые маршруты */}
                        <Route
                            path="/teaching"
                            element={
                                <ProtectedRoute requiredRole="TEACHER">
                                    <TeachingPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/teaching/create-course"
                            element={
                                <ProtectedRoute requiredRole="TEACHER">
                                    <CourseCreatePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute requiredRole="ADMIN">
                                    <AdminPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/references"
                            element={
                                <ProtectedRoute requiredRole="ADMIN">
                                    <ReferencesPage />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </main>
            </BrowserRouter>
        </ThemeProvider>
    );
}
export default App;