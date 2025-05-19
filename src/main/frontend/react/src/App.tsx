import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import {BrowserRouter, Route, Routes} from "react-router-dom";

import theme from './theme';
import { HomePage } from './pages/HomePage';

import './App.css';
import CourseList from "./pages/CourseList";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import CoursePage from "./pages/CoursePage";
// import StudentProfile from "./pages/StudentProfile";

function App() {

    //const [logged] = useAuth();

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    {/*<Route path="/profile" element={<ProfilePage />} />*/}
                    <Route path="/courses" element={<CourseList/>}/>
                    <Route path="/courses/:id" element={<CoursePage />} />
                    {/*<Route path="/login" element={<SignInPage/>}/>*/}
                    <Route path="/sign-up" element={<SignUpPage/>}/>

                    {/*<Route path="/student-profile" element={<StudentProfile />} />*/}
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
