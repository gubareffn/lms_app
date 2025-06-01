import React, { useState } from 'react';
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    Paper,
    Snackbar,
    Alert
} from '@mui/material';
import axios from 'axios';

interface StudentFormData {
    lastName: string;
    firstName: string;
    middleName: string;
    password: string;
    email: string;
}

const SignUpPage = () => {
    const [formData, setFormData] = useState<StudentFormData>({
        lastName: '',
        firstName: '',
        middleName: '',
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:8080/api/auth/register/student', {
                lastName: formData.lastName,
                firstName: formData.firstName,
                middleName: formData.middleName,
                password: formData.password,
                email: formData.email
            });

            setSuccess(true);
            setSnackbarOpen(true);

            setFormData({
                lastName: '',
                firstName: '',
                middleName: '',
                email: '',
                password: ''
            });
        } catch (err) {
            setError('Ошибка регистрации');
            setSnackbarOpen(true);
            console.error('Registration error:', err);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    if (success) {
        return (
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Регистрация успешна!
                    </Typography>
                    <Typography>
                        Теперь вы можете войти в систему, используя свои учетные данные.
                    </Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Регистрация обучающегося
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Фамилия"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Имя"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Отчество"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleChange}
                        required
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Пароль"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 3 }}
                    >
                        Зарегистрироваться
                    </Button>
                </Box>
            </Paper>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={success ? "success" : "error"}
                    sx={{ width: '100%' }}
                >
                    {success ? "Регистрация прошла успешно!" : error}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default SignUpPage;