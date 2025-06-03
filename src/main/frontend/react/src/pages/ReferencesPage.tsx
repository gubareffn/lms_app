import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button,
    CircularProgress, Alert, IconButton, Stack, DialogTitle, Dialog, DialogContent, TextField, DialogActions
} from '@mui/material';
import {
    Add as AddIcon, Edit as EditIcon, Delete,
    Category as CategoryIcon, Flag as StatusIcon
} from '@mui/icons-material';
import axios from "axios";
import { useAuth } from "../components/AuthContext";

interface CourseCategory {
    id: number;
    name: string;
}

interface CourseStatus {
    id: number;
    name: string;
}

const ReferencesPage = () => {
    const { user } = useAuth();
    const [courseCategories, setCourseCategories] = useState<CourseCategory[]>([]);
    const [courseStatuses, setCourseStatuses] = useState<CourseStatus[]>([]);
    const [loading, setLoading] = useState({
        categories: false,
        statuses: false,
        saving: false
    });
    const [error, setError] = useState<string | null>(null);
    const [newCategory, setNewCategory] = useState({ name: '' });
    const [newStatus, setNewStatus] = useState({ name: '' });
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    useEffect(() => {
        fetchMiscData();
    }, []);

    const fetchMiscData = async () => {
        try {
            setLoading({ categories: true, statuses: true, saving: false });
            setError(null);

            const [categoriesResponse, statusesResponse] = await Promise.all([
                axios.get<CourseCategory[]>('http://localhost:8080/api/category', {
                    headers: { Authorization: `Bearer ${user?.token}` }
                }),
                axios.get<CourseStatus[]>('http://localhost:8080/api/status', {
                    headers: { Authorization: `Bearer ${user?.token}` }
                }),
            ]);

            setCourseCategories(categoriesResponse.data);
            setCourseStatuses(statusesResponse.data);
        } catch (err) {
            setError('Не удалось загрузить справочные данные');
            console.error('Error loading misc data:', err);
        } finally {
            setLoading({ categories: false, statuses: false, saving: false });
        }
    };

    const renderAddModals = () => (
        <>
            {/* Модальное окно добавления категории */}
            <Dialog
                open={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
            >
                <DialogTitle>Добавить новую категорию</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Название категории"
                        fullWidth
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ name: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsCategoryModalOpen(false)}>Отмена</Button>
                    <Button
                        onClick={handleCreateCategory}
                        color="primary"
                        variant="contained"
                        disabled={!newCategory.name || loading.saving}
                    >
                        {loading.saving ? <CircularProgress size={24} /> : 'Добавить'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Модальное окно добавления статуса */}
            <Dialog
                open={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
            >
                <DialogTitle>Добавить новый статус</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Название статуса"
                        fullWidth
                        value={newStatus.name}
                        onChange={(e) => setNewStatus({ name: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsStatusModalOpen(false)}>Отмена</Button>
                    <Button
                        onClick={handleCreateStatus}
                        color="primary"
                        variant="contained"
                        disabled={!newStatus.name || loading.saving}
                    >
                        {loading.saving ? <CircularProgress size={24} /> : 'Добавить'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );

    const handleCreateCategory = async () => {
        try {
            setLoading(prev => ({ ...prev, saving: true }));
            setError(null);

            const response = await axios.post(
                'http://localhost:8080/api/category/create',
                { name: newCategory.name },
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`
                    }
                }
            );

            // Обновляем список категорий
            const categoriesResponse = await axios.get<CourseCategory[]>(
                'http://localhost:8080/api/category',
                {
                    headers: { Authorization: `Bearer ${user?.token}` }
                }
            );
            setCourseCategories(categoriesResponse.data);

            setIsCategoryModalOpen(false);
            setNewCategory({ name: '' });
        } catch (err) {
            setError('Ошибка при создании категории');
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, saving: false }));
        }
    };

    const handleCreateStatus = async () => {
        try {
            setLoading(prev => ({ ...prev, saving: true }));
            setError(null);

            const response = await axios.post(
                'http://localhost:8080/api/status/create',
                { name: newStatus.name },
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`
                    }
                }
            );

            // Обновляем список статусов
            const statusesResponse = await axios.get<CourseStatus[]>(
                'http://localhost:8080/api/status',
                {
                    headers: { Authorization: `Bearer ${user?.token}` }
                }
            );
            setCourseStatuses(statusesResponse.data);

            setIsStatusModalOpen(false);
            setNewStatus({ name: '' });
        } catch (err) {
            setError('Ошибка при создании статуса');
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, saving: false }));
        }
    };

    const handleDeleteCategory = async (id: number) => {
        try {
            setLoading(prev => ({ ...prev, saving: true }));
            await axios.delete(`http://localhost:8080/api/category/${id}`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setCourseCategories(prev => prev.filter(cat => cat.id !== id));
        } catch (err) {
            setError('Ошибка при удалении категории');
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, saving: false }));
        }
    };

    const handleDeleteStatus = async (id: number) => {
        try {
            setLoading(prev => ({ ...prev, saving: true }));
            await axios.delete(`http://localhost:8080/api/status/${id}`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setCourseStatuses(prev => prev.filter(status => status.id !== id));
        } catch (err) {
            setError('Ошибка при удалении статуса');
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, saving: false }));
        }
    };

    return (
        <Box sx={{ pl: 4, pr: 4 }}>
            <Typography variant="h5" gutterBottom>
                Справочные данные
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Категории курсов */}
            <Stack direction="row" spacing={4} alignItems="flex-start" sx={{ mb: 6 }}>
                <TableContainer component={Paper} sx={{ width: '70%' }}>
                    <Typography variant="h6" sx={{ p: 2 }}>
                        <CategoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Категории курсов
                    </Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ width: '70%' }}>Название</TableCell>
                                <TableCell sx={{ width: '30%' }}>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading.categories ? (
                                <TableRow>
                                    <TableCell colSpan={2} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                courseCategories.map(category => (
                                    <TableRow key={category.id}>
                                        <TableCell>{category.name}</TableCell>
                                        <TableCell>
                                            <IconButton color="primary">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteCategory(category.id)}
                                                disabled={loading.saving}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsCategoryModalOpen(true)}
                    disabled={loading.saving}
                    sx={{ mt: 7, width: '200px' }}
                >
                    Добавить
                </Button>
            </Stack>

            {/* Статусы курсов */}
            <Stack direction="row" spacing={4} alignItems="flex-start">
                <TableContainer component={Paper} sx={{ width: '70%' }}>
                    <Typography variant="h6" sx={{ p: 2 }}>
                        <StatusIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Статусы курсов
                    </Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ width: '70%' }}>Название</TableCell>
                                <TableCell sx={{ width: '30%' }}>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading.statuses ? (
                                <TableRow>
                                    <TableCell colSpan={2} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                courseStatuses.map(status => (
                                    <TableRow key={status.id}>
                                        <TableCell>{status.name}</TableCell>
                                        <TableCell>
                                            <IconButton color="primary">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteStatus(status.id)}
                                                disabled={loading.saving}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsStatusModalOpen(true)}
                    disabled={loading.saving}
                    sx={{ mt: 7, width: '200px' }}
                >
                    Добавить
                </Button>

                {renderAddModals()}
            </Stack>
        </Box>
    );
};

export default ReferencesPage;