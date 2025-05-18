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
    IconButton, Snackbar,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage, AuthProvider, AuthResponse } from '@toolpad/core/SignInPage';
import { useTheme } from '@mui/material/styles';
import {useState} from "react";
import axios from "axios";

const providers = [{ id: 'credentials', name: 'Email and Password' }];
interface LoginResponse {
    token: string;
    id: string;
    email: string;
    firstName: string;
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
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <AccountCircle fontSize="inherit" />
                        </InputAdornment>
                    ),
                },
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
        <Link href="/" variant="body2">
            Регистрация
        </Link>
    );
}

function ForgotPasswordLink() {
    return (
        <Link href="/" variant="body2">
            Забыли пароль?
        </Link>
    );
}

function Title() {
    return <h2 style={{ marginBottom: 8 }}>Войти</h2>;
}

// function Subtitle() {
//     return (
//         <Alert sx={{ mb: 2, px: 1, py: 0.25, width: '100%' }} severity="warning">
//             We are investigating an ongoing outage.
//         </Alert>
//     );
// }

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
            slotProps={{
                typography: {
                    color: 'textSecondary',
                    fontSize: theme.typography.pxToRem(14),
                },
            }}
        />
    );
}

function SlotsSignIn() {
    const theme = useTheme();
    const [error, setError] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleLogin = async (
        provider: AuthProvider,
        formData?: FormData,
        callbackUrl?: string
    ): Promise<{ error: any; url: any }> => {
        try {
            const response = await axios.post<LoginResponse>('http://localhost:8080/api/auth/login', {
                email: formData?.get('email'),
                password: formData?.get('password')
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify({
                id: response.data.id,
                email: response.data.email,
                firstName: response.data.firstName
            }));

            // Возвращаем успешный AuthResponse
            return {
                error: null,
                url: '/' // Используем callbackUrl если он есть
            };

        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message || 'Неверный email или пароль'
                : 'Ошибка при входе';

            setError(errorMessage);
            setSnackbarOpen(true);

            // Возвращаем AuthResponse с ошибкой
            return {
                error: errorMessage,
                url: null
            };
        }
    };

    return (
        <AppProvider theme={theme}>
            <SignInPage
                signIn={handleLogin}
                slots={{
                    title: Title,
                    emailField: CustomEmailField,
                    passwordField: CustomPasswordField,
                    submitButton: CustomButton,
                    signUpLink: SignUpLink,
                    rememberMe: RememberMeCheckbox,
                    forgotPasswordLink: ForgotPasswordLink,
                }}
                slotProps={{ form: { noValidate: true } }}
                providers={providers}
            />

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
            >
                <Alert severity="error">{error}</Alert>
            </Snackbar>
        </AppProvider>
    );
}
export default SlotsSignIn;