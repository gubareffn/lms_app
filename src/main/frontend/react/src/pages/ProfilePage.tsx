import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Paper,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    Chip,
    CircularProgress
} from '@mui/material';
import { useAuth } from "../components/AuthContext";
import axios from 'axios';

interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    role?: string;
    userType: 'STUDENT' | 'TEACHER' | 'ADMIN';
    courses?: Array<{
        id: number;
        title: string;
        status: string;
    }>;
    requests?: Array<{
        id: number;
        title: string;
        status: string;
    }>;
}

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const userRole = localStorage.getItem("userType")

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/students/profile`, {
                    headers: {
                        Authorization: `Bearer ${user?.token}`
                    }
                });
                setProfile(response.data);
            } catch (err) {
                setError('Не удалось загрузить профиль');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box mt={2}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (!profile) {
        return <Typography>Профиль не найден</Typography>;
    }

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" mb={4}>
                    <Avatar
                        sx={{
                            width: 100,
                            height: 100,
                            fontSize: 40,
                            mr: 4,
                            bgcolor: 'primary.main'
                        }}
                    >
                        {profile.firstName[0]}{profile.lastName[0]}
                    </Avatar>

                    <Box>
                        <Typography variant="h4" component="h1">
                            {profile.lastName} {profile.firstName} {profile.middleName}
                        </Typography>

                        <Box display="flex" alignItems="center" mt={1}>
                            <Typography variant="subtitle1" color="text.secondary">
                                {profile.email}
                                {profile.role}
                                {profile.userType}
                            </Typography>

                            <Chip
                                label={
                                    userRole === 'STUDENT' ? 'Студент' :
                                        userRole === 'TEACHER' ? 'Преподаватель' : 'Администратор'
                                }

                                color={
                                    userRole === 'ADMIN' ? 'error' :
                                        userRole === 'TEACHER' ? 'warning' : 'primary'
                                }
                                size="small"
                                sx={{ ml: 2 }}
                            />
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {userRole === 'STUDENT' && (
                    <Box mb={4}>
                        <Typography variant="h6" gutterBottom>
                            Мои курсы
                        </Typography>
                        {profile.courses?.length ? (
                            <List>
                                {profile.courses.map(course => (
                                    <ListItem key={course.id}>
                                        <ListItemText
                                            primary={course.title}
                                            secondary={`Статус: ${course.status}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography color="text.secondary">Нет активных курсов</Typography>
                        )}
                    </Box>
                )}

                {profile.userType === 'TEACHER' && (
                    <Box mb={4}>
                        <Typography variant="h6" gutterBottom>
                            Мои заявки
                        </Typography>
                        {profile.requests?.length ? (
                            <List>
                                {profile.requests.map(request => (
                                    <ListItem key={request.id}>
                                        <ListItemText
                                            primary={request.title}
                                            secondary={`Статус: ${request.status}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography color="text.secondary">Нет активных заявок</Typography>
                        )}
                    </Box>
                )}

                {profile.userType === 'ADMIN' && (
                    <Box mb={4}>
                        <Typography variant="h6" gutterBottom>
                            Административные функции
                        </Typography>
                        <Box display="flex" gap={2}>
                            <Button variant="contained" color="error" href="/admin/users">
                                Управление пользователями
                            </Button>
                            <Button variant="contained" color="secondary" href="/admin/courses">
                                Управление курсами
                            </Button>
                        </Box>
                    </Box>
                )}

                <Box display="flex" justifyContent="space-between" mt={4}>
                    <Button
                        variant="outlined"
                        color="primary"
                        href="/profile/edit"
                    >
                        Редактировать профиль
                    </Button>

                    <Button
                        variant="outlined"
                        color="error"
                        onClick={logout}
                    >
                        Выйти
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default ProfilePage;