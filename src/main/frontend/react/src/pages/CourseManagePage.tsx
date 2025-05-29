import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Divider, Paper, TextField, Button,
    Stack, IconButton, CircularProgress, Alert, List, ListItem
} from '@mui/material';
import { Add, Delete, Edit, Save, Cancel } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../components/AuthContext';

interface Course {
    id: number;
    name: string;
    description: string;
    studyDirection: string;
    startDate: string;
    endDate: string | null;
    hoursCount: number;
    resultCompetence: string;
    categoryId: number;
    statusId: number;
}

interface CourseMaterial {
    id?: number;
    name: string;
    text: string;
}

const CourseManagePage = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [materials, setMaterials] = useState<CourseMaterial[]>([]);
    const [loading, setLoading] = useState({
        course: true,
        materials: true,
        submit: false
    });
    const [error, setError] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);

    // Загрузка данных курса
    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading({ course: true, materials: true, submit: false });
                setError(null);

                const [courseResponse, materialsResponse] = await Promise.all([
                    axios.get(`http://localhost:8080/api/courses/${id}`),
                    axios.get(`http://localhost:8080/api/courses/${id}/materials`)
                ]);

                setCourse(courseResponse.data);
                setMaterials(materialsResponse.data || []);
            } catch (err) {
                setError('Не удалось загрузить данные курса');
                console.error(err);
            } finally {
                setLoading({ course: false, materials: false, submit: false });
            }
        };

        fetchCourseData();
    }, [id]);

    const handleCourseChange = (field: keyof Course, value: any) => {
        if (course) {
            setCourse({ ...course, [field]: value });
        }
    };

    const handleMaterialChange = (index: number, field: keyof CourseMaterial, value: string) => {
        const newMaterials = [...materials];
        newMaterials[index] = { ...newMaterials[index], [field]: value };
        setMaterials(newMaterials);
    };

    const handleAddMaterial = () => {
        setMaterials([...materials, { name: '', text: '' }]);
    };

    const handleRemoveMaterial = (index: number) => {
        const newMaterials = materials.filter((_, i) => i !== index);
        setMaterials(newMaterials);
    };

    const handleSaveCourse = async () => {
        if (!course) return;

        try {
            setLoading(prev => ({ ...prev, submit: true }));
            setError(null);

            // Сохраняем изменения курса
            await axios.put(`http://localhost:8080/api/courses/${id}`, course, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });

            // Сохраняем материалы курса
            await axios.put(`http://localhost:8080/api/courses/${id}/materials`, materials, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });

            setEditMode(false);
        } catch (err) {
            setError('Ошибка при сохранении изменений');
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    const handleDeleteCourse = async () => {
        if (!window.confirm('Вы уверены, что хотите удалить этот курс? Это действие нельзя отменить.')) {
            return;
        }

        try {
            setLoading(prev => ({ ...prev, submit: true }));
            await axios.delete(`http://localhost:8080/api/courses/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            navigate('/teaching');
        } catch (err) {
            setError('Ошибка при удалении курса');
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    if (loading.course) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!course) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h4">Курс не найден</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    {editMode ? 'Редактирование курса' : course.name}
                </Typography>

                {!editMode ? (
                    <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={() => setEditMode(true)}
                    >
                        Редактировать
                    </Button>
                ) : (
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            startIcon={<Cancel />}
                            onClick={() => {
                                setEditMode(false);
                                // Здесь можно добавить сброс изменений
                            }}
                            disabled={loading.submit}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={loading.submit ? <CircularProgress size={20} /> : <Save />}
                            onClick={handleSaveCourse}
                            disabled={loading.submit}
                        >
                            Сохранить
                        </Button>
                    </Stack>
                )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
                {editMode ? (
                    <>
                        <TextField
                            label="Название курса"
                            value={course.name}
                            onChange={(e) => handleCourseChange('name', e.target.value)}
                            fullWidth
                            required
                            error={!course.name}
                            helperText={!course.name ? 'Обязательное поле' : ''}
                        />

                        <TextField
                            label="Описание курса"
                            value={course.description}
                            onChange={(e) => handleCourseChange('description', e.target.value)}
                            multiline
                            rows={4}
                            fullWidth
                        />

                        <TextField
                            label="Направление обучения"
                            value={course.studyDirection}
                            onChange={(e) => handleCourseChange('studyDirection', e.target.value)}
                            fullWidth
                            required
                            error={!course.studyDirection}
                            helperText={!course.studyDirection ? 'Обязательное поле' : ''}
                        />

                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Дата начала"
                                type="date"
                                value={course.startDate.split('T')[0]}
                                onChange={(e) => handleCourseChange('startDate', e.target.value + 'T00:00:00')}
                                fullWidth
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />

                            <TextField
                                label="Дата окончания"
                                type="date"
                                value={course.endDate ? course.endDate.split('T')[0] : ''}
                                onChange={(e) => handleCourseChange('endDate', e.target.value ? e.target.value + 'T00:00:00' : null)}
                                fullWidth
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Stack>

                        <TextField
                            label="Количество часов"
                            type="number"
                            value={course.hoursCount}
                            onChange={(e) => handleCourseChange('hoursCount', parseInt(e.target.value) || 0)}
                            fullWidth
                            required
                            error={!course.hoursCount}
                            helperText={!course.hoursCount ? 'Обязательное поле' : ''}
                        />

                        <TextField
                            label="Результаты обучения"
                            value={course.resultCompetence}
                            onChange={(e) => handleCourseChange('resultCompetence', e.target.value)}
                            multiline
                            rows={2}
                            fullWidth
                            required
                            error={!course.resultCompetence}
                            helperText={!course.resultCompetence ? 'Обязательное поле' : ''}
                        />
                    </>
                ) : (
                    <>
                        <Typography variant="h6">Основная информация</Typography>
                        <Typography>{course.description}</Typography>

                        <List>
                            <ListItem>
                                <Typography><strong>Направление:</strong> {course.studyDirection}</Typography>
                            </ListItem>
                            <ListItem>
                                <Typography><strong>Дата начала:</strong> {new Date(course.startDate).toLocaleDateString()}</Typography>
                            </ListItem>
                            {course.endDate && (
                                <ListItem>
                                    <Typography><strong>Дата окончания:</strong> {new Date(course.endDate).toLocaleDateString()}</Typography>
                                </ListItem>
                            )}
                            <ListItem>
                                <Typography><strong>Количество часов:</strong> {course.hoursCount}</Typography>
                            </ListItem>
                            <ListItem>
                                <Typography><strong>Результаты обучения:</strong> {course.resultCompetence}</Typography>
                            </ListItem>
                        </List>
                    </>
                )}

                <Typography variant="h6">Материалы курса</Typography>
                <Divider />

                {editMode ? (
                    <>
                        {materials.map((material, index) => (
                            <Paper key={index} elevation={2} sx={{ p: 2, mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography>Материал {index + 1}</Typography>
                                    <IconButton
                                        onClick={() => handleRemoveMaterial(index)}
                                        color="error"
                                        disabled={materials.length <= 1}
                                    >
                                        <Delete />
                                    </IconButton>
                                </Box>

                                <Stack spacing={2}>
                                    <TextField
                                        label="Название материала"
                                        value={material.name}
                                        onChange={(e) => handleMaterialChange(index, 'name', e.target.value)}
                                        fullWidth
                                        required
                                        error={!material.name}
                                        helperText={!material.name ? 'Обязательное поле' : ''}
                                    />

                                    <TextField
                                        label="Содержание"
                                        value={material.text}
                                        onChange={(e) => handleMaterialChange(index, 'text', e.target.value)}
                                        multiline
                                        rows={4}
                                        fullWidth
                                        required
                                        error={!material.text}
                                        helperText={!material.text ? 'Обязательное поле' : ''}
                                    />
                                </Stack>
                            </Paper>
                        ))}

                        <Button
                            variant="outlined"
                            startIcon={<Add />}
                            onClick={handleAddMaterial}
                            sx={{ alignSelf: 'flex-start' }}
                        >
                            Добавить материал
                        </Button>
                    </>
                ) : (
                    <>
                        {materials.length === 0 ? (
                            <Typography>Материалы курса отсутствуют</Typography>
                        ) : (
                            <List>
                                {materials.map((material, index) => (
                                    <Paper key={index} elevation={2} sx={{ p: 2, mb: 2 }}>
                                        <Typography variant="subtitle1">{material.name}</Typography>
                                        <Typography>{material.text}</Typography>
                                    </Paper>
                                ))}
                            </List>
                        )}
                    </>
                )}

                {editMode && (
                    <Stack direction="row" spacing={2} justifyContent="space-between">
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleDeleteCourse}
                            disabled={loading.submit}
                            startIcon={loading.submit ? <CircularProgress size={20} /> : null}
                        >
                            Удалить курс
                        </Button>

                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="outlined"
                                onClick={() => setEditMode(false)}
                                disabled={loading.submit}
                            >
                                Отмена
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSaveCourse}
                                disabled={loading.submit}
                                startIcon={loading.submit ? <CircularProgress size={20} /> : <Save />}
                            >
                                Сохранить изменения
                            </Button>
                        </Stack>
                    </Stack>
                )}
            </Stack>
        </Box>
    );
};

export default CourseManagePage;