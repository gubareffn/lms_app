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
    CircularProgress,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Alert,
    Snackbar
} from '@mui/material';
import { useAuth } from "../components/AuthContext";
import axios from 'axios';
import { Download, Description, Delete } from '@mui/icons-material';
import { useParams, useNavigate } from "react-router-dom";

interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    role?: string;
    userType: 'STUDENT' | 'TEACHER' | 'ADMIN';
    joinDate: string;
}

interface Document {
    id: number;
    fileName: string;
    filePath: string;  // Изменили urlAddress на filePath для соответствия API
    createDate: string;
    type: string;
}

const ProfilePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState({
        profile: true,
        documents: true
    });
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('profile');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const userRole = localStorage.getItem("userType");
    const { id: userId } = useParams<{ id: string }>();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading({ profile: true, documents: true });
                setError('');

                // Загрузка профиля
                const profileResponse = await axios.get(`http://localhost:8080/api/students/profile/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${user?.token}`
                    }
                });
                setProfile(profileResponse.data);

                // Загрузка документов
                const docsResponse = await axios.get(`http://localhost:8080/api/documents/student/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${user?.token}`
                    }
                });
                setDocuments(docsResponse.data);

            } catch (err) {
                setError('Не удалось загрузить данные');
                console.error(err);
            } finally {
                setLoading({ profile: false, documents: false });
            }
        };

        fetchData();
    }, [user, userId]);

    const handleDownload = async (filename: string) => {
        try {
            // Открываем файл в новой вкладке для скачивания
            window.open(`http://localhost:8080/api/documents/download/${filename}`, '_blank');
        } catch (err) {
            setSnackbarMessage('Ошибка при скачивании файла');
            setSnackbarOpen(true);
            console.error(err);
        }
    };

    const handleDeleteDocument = async (docId: number) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот документ?')) return;

        try {
            await axios.delete(`http://localhost:8080/api/documents/${docId}`, {
                headers: {
                    Authorization: `Bearer ${user?.token}`
                }
            });

            setDocuments(documents.filter(doc => doc.id !== docId));
            setSnackbarMessage('Документ успешно удален');
            setSnackbarOpen(true);
        } catch (err) {
            setSnackbarMessage('Ошибка при удалении документа');
            setSnackbarOpen(true);
            console.error(err);
        }
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    };

    if (loading.profile) {
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
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
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
                        <Typography variant="subtitle1" color="text.secondary" mt={1}>
                            {profile.email}
                        </Typography>
                        {/*<Chip*/}
                        {/*    label={profile.userType === 'STUDENT' ? 'Студент' :*/}
                        {/*        profile.userType === 'TEACHER' ? 'Преподаватель' : 'Администратор'}*/}
                        {/*    color="primary"*/}
                        {/*    size="small"*/}
                        {/*    sx={{ mt: 1 }}*/}
                        {/*/>*/}
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Вкладки */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                        <Tab label="Профиль" value="profile" />
                        <Tab label="Документы" value="documents" />
                    </Tabs>
                </Box>

                {/* Содержимое вкладки "Профиль" */}
                {activeTab === 'profile' && (
                    <Box>
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="Дата регистрации"
                                    secondary={formatDate(profile.joinDate)}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Роль в системе"
                                    secondary={profile.role || 'Не указана'}
                                />
                            </ListItem>
                        </List>
                    </Box>
                )}

                {/* Содержимое вкладки "Документы" */}
                {activeTab === 'documents' && (
                    <Box>
                        {loading.documents ? (
                            <CircularProgress />
                        ) : documents.length > 0 ? (
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Название документа</TableCell>
                                            <TableCell>Тип</TableCell>
                                            <TableCell>Дата загрузки</TableCell>
                                            <TableCell>Действия</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {documents.map((doc) => (
                                            <TableRow key={doc.id}>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center">
                                                        <Description color="primary" sx={{ mr: 1 }} />
                                                        <Typography>{doc.fileName}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={doc.type} size="small" />
                                                </TableCell>
                                                <TableCell>{formatDate(doc.createDate)}</TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        onClick={() => handleDownload(doc.fileName)}
                                                        color="primary"
                                                        title="Скачать"
                                                    >
                                                        <Download />
                                                    </IconButton>
                                                    {/*{(user?.id === profile.id || userRole === 'ADMIN') && (*/}
                                                    {/*    <IconButton*/}
                                                    {/*        onClick={() => handleDeleteDocument(doc.id)}*/}
                                                    {/*        color="error"*/}
                                                    {/*        title="Удалить"*/}
                                                    {/*    >*/}
                                                    {/*        <Delete />*/}
                                                    {/*    </IconButton>*/}
                                                    {/*)}*/}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                Нет загруженных документов
                            </Typography>
                        )}
                    </Box>
                )}

                <Box display="flex" justifyContent="flex-end" mt={4}>
                    <Button
                        variant="contained"
                        onClick={() => navigate(-1)}
                        sx={{ mr: 2 }}
                    >
                        Назад
                    </Button>
                    {/*{(user?.id === profile.id || userRole === 'ADMIN') && (*/}
                    {/*    <Button*/}
                    {/*        variant="contained"*/}
                    {/*        color="primary"*/}
                    {/*        onClick={() => navigate(`/profile/${userId}/upload`)}*/}
                    {/*    >*/}
                    {/*        Загрузить документ*/}
                    {/*    </Button>*/}
                    {/*)}*/}
                </Box>
            </Paper>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarMessage.includes('Ошибка') ? 'error' : 'success'}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ProfilePage;