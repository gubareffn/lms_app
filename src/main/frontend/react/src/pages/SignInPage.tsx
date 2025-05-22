import * as React from 'react';
import {
    Button,
    FormControl,
    Checkbox,
    FormControlLabel,
    InputLabel,
    OutlinedInput,
    TextField,
    InputAdornment,
    Link,
    Alert,
    IconButton,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Tabs,
    Tab,
    Typography
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useTheme } from '@mui/material/styles';
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../components/AuthContext";

interface LoginResponse {
    token: string;
    id: string;
    email: string;
    firstName: string;
    userType: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

function CustomEmailField() {
    return (
        <TextField
            id="input-with-icon-textfield"
            label="Email"
            name="email"
            type="email"
            size="small"
            required
            fullWidth
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <AccountCircle fontSize="inherit" />
                    </InputAdornment>
                ),
            }}
            variant="outlined"
        />
    );
}

function CustomPasswordField() {
    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent) => {
        event.preventDefault();
    };

    return (
        <FormControl sx={{ my: 2 }} fullWidth variant="outlined">
            <InputLabel size="small" htmlFor="outlined-adornment-password">
                Пароль
            </InputLabel>
            <OutlinedInput
                id="outlined-adornment-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                size="small"
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                            size="small"
                        >
                            {showPassword ? (
                                <VisibilityOff fontSize="inherit" />
                            ) : (
                                <Visibility fontSize="inherit" />
                            )}
                        </IconButton>
                    </InputAdornment>
                }
                label="Password"
            />
        </FormControl>
    );
}

function CustomButton() {
    return (
        <Button
            type="submit"
            variant="outlined"
            color="info"
            size="small"
            disableElevation
            fullWidth
            sx={{ my: 2 }}
        >
            Войти
        </Button>
    );
}

function SignUpLink() {
    return (
        <Link href="/sign-up" variant="body2">
            Регистрация
        </Link>
    );
}

function ForgotPasswordLink() {
    return (
        <Link href="/forgot-password" variant="body2">
            Забыли пароль?
        </Link>
    );
}

interface LoginModalProps {
    open: boolean;
    onClose: () => void;
}

function LoginModal({ open, onClose }: LoginModalProps) {
    const { login } = useAuth();
    const theme = useTheme();
    const [error, setError] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'student' | 'worker'>('student');

    const handleTabChange = (event: React.SyntheticEvent, newValue: 'student' | 'worker') => {
        setActiveTab(newValue);
    };

    const handleLogin = async (formData: FormData): Promise<void> => {
        try {
            const endpoint = activeTab === 'student'
                ? 'http://localhost:8080/api/auth/login/student'
                : 'http://localhost:8080/api/auth/login/worker';

            const response = await axios.post<LoginResponse>(endpoint, {
                email: formData.get('email'),
                password: formData.get('password')
            });

            await login({
                token: response.data.token,
                id: response.data.id,
                email: response.data.email,
                userType: response.data.userType
            });

            onClose();
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message || 'Неверный email или пароль'
                : 'Ошибка при входе';
            setError(errorMessage);
            setSnackbarOpen(true);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="fullWidth"
                    >
                        <Tab
                            label="Студент"
                            value="student"
                            sx={{ textTransform: 'none' }}
                        />
                        <Tab
                            label="Работник"
                            value="worker"
                            sx={{ textTransform: 'none' }}
                        />
                    </Tabs>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Box
                    component="form"
                    onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        await handleLogin(formData);
                    }}
                    noValidate
                >
                    <CustomEmailField />
                    <CustomPasswordField />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {activeTab === 'student' && <RememberMeCheckbox />}
                        <ForgotPasswordLink />
                    </Box>

                    <CustomButton />
                </Box>

                {activeTab === 'student' && (
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <SignUpLink />
                    </Box>
                )}
            </DialogContent>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity="error" onClose={() => setSnackbarOpen(false)}>
                    {error}
                </Alert>
            </Snackbar>
        </Dialog>
    );
}

function RememberMeCheckbox() {
    const theme = useTheme();
    return (
        <FormControlLabel
            label="Запомнить меня"
            control={
                <Checkbox
                    name="remember"
                    value="true"
                    color="primary"
                    sx={{ padding: 0.5, '& .MuiSvgIcon-root': { fontSize: 20 } }}
                />
            }
            sx={{
                '& .MuiTypography-root': {
                    color: 'text.secondary',
                    fontSize: theme.typography.pxToRem(14),
                },
            }}
        />
    );
}

export default LoginModal;