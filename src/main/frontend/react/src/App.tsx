import {ThemeProvider} from '@mui/material/styles';
import {AppBar, CssBaseline} from '@mui/material';
import {BrowserRouter, Route, Routes} from "react-router-dom";

import theme from './theme';
import {HomePage} from './pages/HomePage';

import './App.css';
import CourseList from "./pages/CourseList";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import CoursePage from "./pages/CoursePage";
import {useAuth} from './components/AuthContext';
import ProfilePage from "./pages/ProfilePage";
import NavigationBar from "./components/Layout/AppBar";
import MyEducationPage from "./pages/MyEducationPage";

// import StudentProfile from "./pages/StudentProfile";

function App() {
    const {isAuthenticated, user, logout} = useAuth();
    //const [logged] = useAuth();

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <NavigationBar /> {/* AppBar теперь отдельный компонент */}
                <main style={{ marginTop: "64px" }}> {/* Отступ под AppBar */}
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/courses" element={<CourseList />} />
                        <Route path="/courses/:id" element={<CoursePage />} />
                        <Route path="/sign-up" element={<SignUpPage />} />
                        <Route path="/my-education" element={<MyEducationPage />} />
                        {/*<Route path="//my-education" element={<MyEducationPage />} />*/}
                    </Routes>
                </main>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
