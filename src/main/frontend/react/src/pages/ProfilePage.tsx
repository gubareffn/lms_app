import React, {useEffect, useState} from 'react';
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
    Snackbar,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions, Select, MenuItem, Modal
} from '@mui/material';
import {useAuth} from "../components/AuthContext";
import axios from 'axios';
import {Download, Description, Delete, Edit, Person} from '@mui/icons-material';
import {useParams, useNavigate} from "react-router-dom";

interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    role?: string;
    password: string;
}

interface PassportData {
    id?: number;
    series: string;
    number: string;
    issuedBy: string;
    issuedDate: string;
    dateOfBirth: string;
}

interface Document {
    id: number;
    fileName: string;
    filePath: string;
    createDate: string;
    type: string;
}

interface DocumentType {
    id: number;
    name: string;
}

const decodeJwt = (token: string | null) => {
    if (!token) return null;

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Failed to decode JWT', e);
        return null;
    }
};

const ProfilePage = () => {
    const {user} = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [passport, setPassport] = useState<PassportData | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState({
        profile: true,
        documents: true
    });
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('profile');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [passportDialogOpen, setPassportDialogOpen] = useState(false);
    const [profileDialogOpen, setProfileDialogOpen] = useState(false);
    const [passportForm, setPassportForm] = useState({
        series: '',
        number: '',
        issuedBy: '',
        dateOfBirth: '',
        issuedDate: ''
    });

    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        password: ''
    });

    const {id: userId} = useParams<{ id: string }>();
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType")
    const decodedToken = decodeJwt(token);
    const authUserId = decodedToken.id;

    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [studentDocuments, setStudentDocuments] = useState<Record<number, Document[]>>({});

    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [selectedDocType, setSelectedDocType] = useState<number | null>(null);
    const [loadingDocTypes, setLoadingDocTypes] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading({profile: true, documents: true});
                setError('');

                // Загрузка профиля
                const profileResponse = await axios.get(`http://localhost:8080/api/students/profile/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${user?.token}`
                    }
                });
                setProfile(profileResponse.data);

                setProfileForm({
                    firstName: profileResponse.data.firstName,
                    lastName: profileResponse.data.lastName,
                    middleName: profileResponse.data.middleName,
                    email: profileResponse.data.email,
                    password: ''
                });

                if (userType === 'STUDENT' || userType === 'ADMIN') {
                    try {
                        const passportResponse = await axios.get(`http://localhost:8080/api/passport/student/${userId}`, {
                            headers: {
                                Authorization: `Bearer ${user?.token}`
                            }
                        });
                        setPassport(passportResponse.data);
                        if (passportResponse.data) {
                            setPassportForm(passportResponse.data);
                        }
                    } catch (err) {
                        console.log('Паспортные данные не найдены');
                    } finally {
                        setLoading(prev => ({...prev, passport: false}));
                    }
                }
                // Инициализация формы паспортных данных
                if (profileResponse.data.passportData) {
                    setPassportForm(profileResponse.data.passportData);
                }

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
                setLoading({profile: false, documents: false});
            }
        };

        fetchData();
    }, [user, userId]);

    const handleOpenUploadModal = () => {
        setSelectedStudentId(Number(userId));
        setUploadModalOpen(true);
        fetchDocumentTypes();
    };

    const handleDownload = async (filename: string) => {
        try {
            window.open(`http://localhost:8080/api/documents/download/${filename}`, '_blank');
        } catch (err) {
            setSnackbarMessage('Ошибка при скачивании файла');
            setSnackbarOpen(true);
            console.error(err);
        }
    };

    const handleFileUpload = async () => {
        if (!file || !selectedStudentId || !selectedDocType) {
            setError('Выберите файл и тип документа');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentTypeId', selectedDocType.toString());

            const response = await axios.post(
                `http://localhost:8080/api/documents/upload/by-student`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setUploadModalOpen(false);
            setFile(null);
            setSelectedDocType(null);
            alert('Документ успешно загружен');
        } catch (err) {
            setError('Ошибка при загрузке файла');
            console.error(err);
        }
    };

    const fetchDocumentTypes = async () => {
        try {
            setLoadingDocTypes(true);
            const response = await axios.get('http://localhost:8080/api/document-type', {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            setDocumentTypes(response.data);
        } catch (err) {
            setError('Не удалось загрузить типы документов');
            console.error(err);
        } finally {
            setLoadingDocTypes(false);
        }
    };

    const handleDeleteDocument = async (docId: number) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот документ?')) return;

        try {
            await axios.delete(`http://localhost:8080/api/documents/delete/${docId}`, {
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

    const handlePassportSubmit = async () => {
        try {
            const endpoint = passport?.id
                ? `http://localhost:8080/api/passport/update`
                : `http://localhost:8080/api/passport/add`;

            const method = passport?.id ? 'put' : 'post';

            const data = {
                ...passportForm,
            };

            const response = await axios[method](endpoint, data, {
                headers: {
                    Authorization: `Bearer ${user?.token}`
                }
            });

            setPassport(response.data);
            setPassportForm(response.data);
            setPassportDialogOpen(false);
            setSnackbarMessage('Паспортные данные успешно сохранены');
            setSnackbarOpen(true);
        } catch (err) {
            setSnackbarMessage('Ошибка при сохранении паспортных данных');
            setSnackbarOpen(true);
            console.error(err);
        }
    };

    const handleProfileSubmit = async () => {
        try {
            const response = await axios.put(
                `http://localhost:8080/api/students/${userId}/update`,
                profileForm,
                {
                    headers: {
                        Authorization: `Bearer ${user?.token}`
                    }
                }
            );

            setProfile(response.data);
            setProfileDialogOpen(false);
            setSnackbarMessage('Профиль успешно обновлен');
            setSnackbarOpen(true);
        } catch (err) {
            setSnackbarMessage('Ошибка при обновлении профиля');
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
                <CircularProgress/>
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
        <Box sx={{maxWidth: 1200, mx: 'auto', p: 3}}>
            <Paper elevation={3} sx={{p: 4}}>
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
                    </Box>

                    {authUserId === Number(userId) && (
                        <Button
                            variant="outlined"
                            startIcon={<Edit/>}
                            onClick={() => setProfileDialogOpen(true)}
                        >
                            Редактировать
                        </Button>
                    )}
                </Box>

                <Divider sx={{my: 3}}/>

                {/* Вкладки */}
                <Box sx={{borderBottom: 1, borderColor: 'divider', mb: 3}}>
                    <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                        <Tab label="Профиль" value="profile"/>
                        <Tab label="Документы" value="documents"/>
                    </Tabs>
                </Box>

                {/* Содержимое вкладки "Профиль" */}
                {activeTab === 'profile' && (
                    <Box>
                        <List>
                            {(userType === 'STUDENT' || userType === 'ADMIN') && (
                                <>
                                    <Divider component="li" sx={{my: 1}}/>
                                    <ListItem>
                                        <ListItemText
                                            primary="Паспортные данные"
                                            secondary={
                                                passport ? (
                                                    <>
                                                        <div>Серия: {passport.series}</div>
                                                        <div>Номер: {passport.number}</div>
                                                        <div>Кем выдан: {passport.issuedBy}</div>
                                                        <div>Дата рождения: {formatDate(passport.dateOfBirth)}</div>
                                                        <div>Дата выдачи: {formatDate(passport.issuedDate)}</div>
                                                    </>
                                                ) : 'Не указаны'
                                            }
                                        />
                                        {authUserId === Number(userId) && (
                                            <Button
                                                variant="outlined"
                                                startIcon={<Edit/>}
                                                onClick={() => setPassportDialogOpen(true)}
                                            >
                                                {passport ? 'Изменить' : 'Добавить'}
                                            </Button>
                                        )}
                                    </ListItem>
                                </>
                            )}
                        </List>
                    </Box>
                )}

                {/* Содержимое вкладки "Документы" */}
                {activeTab === 'documents' && (
                    <Box>
                        {loading.documents ? (
                            <CircularProgress/>
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
                                                        <Description color="primary" sx={{mr: 1}}/>
                                                        <Typography>{doc.fileName}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={doc.type} size="small"/>
                                                </TableCell>
                                                <TableCell>{formatDate(doc.createDate)}</TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        onClick={() => handleDownload(doc.fileName)}
                                                        color="primary"
                                                        title="Скачать"
                                                    >
                                                        <Download/>
                                                    </IconButton>
                                                    {authUserId === Number(userId) && (
                                                        <IconButton
                                                            onClick={() => handleDeleteDocument(doc.id)}
                                                            color="error"
                                                            title="Удалить"
                                                        >
                                                            <Delete/>
                                                        </IconButton>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography color="text.secondary" sx={{textAlign: 'center', py: 4}}>
                                Нет загруженных документов
                            </Typography>
                        )}
                    </Box>
                )}

                <Box display="flex" justifyContent="flex-end" mt={4}>
                    <Button
                        variant="contained"
                        onClick={() => navigate(-1)}
                        sx={{mr: 2}}
                    >
                        Назад
                    </Button>
                    {authUserId === Number(userId) && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenUploadModal()}
                        >
                            Загрузить документ
                        </Button>
                    )}
                </Box>
            </Paper>

            <Modal open={uploadModalOpen} onClose={() => setUploadModalOpen(false)}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Typography variant="h6" mb={2}>
                        Загрузить документ
                    </Typography>

                    {loadingDocTypes ? (
                        <CircularProgress/>
                    ) : (
                        <>
                            <Select
                                value={selectedDocType || ''}
                                onChange={(e) => setSelectedDocType(Number(e.target.value))}
                                displayEmpty
                                fullWidth
                                sx={{mb: 2}}
                            >
                                <MenuItem value="" disabled>
                                    Выберите тип документа
                                </MenuItem>
                                {documentTypes.map((type) => (
                                    <MenuItem key={type.id} value={type.id}>
                                        {type.name}
                                    </MenuItem>
                                ))}
                            </Select>

                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                style={{marginBottom: '16px'}}
                            />

                            <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                                <Button
                                    size="small"
                                    onClick={handleFileUpload}
                                    disabled={!file || !selectedDocType}
                                >
                                    Загрузить
                                </Button>
                            </Box>
                        </>
                    )}
                </Box>
            </Modal>
            {/* Диалог для ввода паспортных данных */}
            <Dialog open={passportDialogOpen} onClose={() => setPassportDialogOpen(false)}>
                <DialogTitle>
                    <Box display="flex" alignItems="center">
                        <Person sx={{mr: 1}}/>
                        {passport ? 'Изменить паспортные данные' : 'Добавить паспортные данные'}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2}}>
                        <TextField
                            label="Серия"
                            type="number"
                            value={passportForm.series}
                            onChange={(e) => setPassportForm({...passportForm, series: e.target.value})}
                            margin="normal"
                            fullWidth
                        />
                        <TextField
                            label="Номер"
                            type="number"
                            value={passportForm.number}
                            onChange={(e) => setPassportForm({...passportForm, number: e.target.value})}
                            margin="normal"
                            fullWidth
                        />
                    </Box>
                    <TextField
                        label="Кем выдан"
                        value={passportForm.issuedBy}
                        onChange={(e) => setPassportForm({...passportForm, issuedBy: e.target.value})}
                        margin="normal"
                        fullWidth
                    />
                    <TextField
                        label="Дата рождения"
                        type="date"
                        value={passportForm.dateOfBirth}
                        onChange={(e) => setPassportForm({...passportForm, dateOfBirth: e.target.value})}
                        margin="normal"
                        fullWidth
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        label="Дата выдачи"
                        type="date"
                        value={passportForm.issuedDate}
                        onChange={(e) => setPassportForm({...passportForm, issuedDate: e.target.value})}
                        margin="normal"
                        fullWidth
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPassportDialogOpen(false)}>Отмена</Button>
                    <Button
                        onClick={handlePassportSubmit}
                        variant="contained"
                        disabled={!passportForm.series || !passportForm.number || !passportForm.issuedBy || !passportForm.issuedDate}
                    >
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Редактирование профиля</DialogTitle>
                <DialogContent>
                    <Box sx={{mt: 2}}>
                        <TextField
                            label="Фамилия"
                            value={profileForm.lastName}
                            onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                            margin="normal"
                            fullWidth
                        />
                        <TextField
                            label="Имя"
                            value={profileForm.firstName}
                            onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                            margin="normal"
                            fullWidth
                        />
                        <TextField
                            label="Отчество"
                            value={profileForm.middleName}
                            onChange={(e) => setProfileForm({...profileForm, middleName: e.target.value})}
                            margin="normal"
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                            margin="normal"
                            fullWidth
                            type="email"
                        />
                        <TextField
                            label="Пароль"
                            value={profileForm.password}
                            onChange={(e) => setProfileForm({...profileForm, password: e.target.value})}
                            margin="normal"
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setProfileDialogOpen(false)}>Отмена</Button>
                    <Button
                        onClick={handleProfileSubmit}
                        variant="contained"
                    >
                        Подтвердить
                    </Button>
                </DialogActions>
            </Dialog>

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