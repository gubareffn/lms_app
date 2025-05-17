import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import {BrowserRouter, Route, Routes} from "react-router-dom";

import theme from './theme';
import { HomePage } from './pages/HomePage';

import './App.css';
import CourseList from "./pages/CourseList";
import SignInPage from"./pages/SignInPage";
import SignUpPage from"./pages/SignUpPage";

function App() {
  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/*<Route path="/profile" element={<ProfilePage />} />*/}
            <Route path="/courses" element={<CourseList />} />
              <Route path="/login" element={<SignInPage />} />
              <Route path="/sign-up" element={<SignUpPage />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
  );
}

export default App;
