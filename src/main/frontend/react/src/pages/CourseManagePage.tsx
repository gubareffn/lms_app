import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Divider, Paper, TextField, Button,
    Stack, IconButton, CircularProgress, Alert, List, ListItem,
    Tabs, Tab, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, Select, MenuItem, LinearProgress
} from '@mui/material';
import {Add, Delete, Edit, Save, Cancel, People, Book, Group, Check, Close} from '@mui/icons-material';
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
    isNew?: boolean;
}

interface Group {
    id: number;
    name: string;
    maxStudentCount: number;
    studentCount: number;
}

interface Student {
    id: number;
    name: string;
    secondName: string
    surname: string
    email: string;
    percent: number;
    statusName: string;
    requestId: number;
}

interface StudentProgress {
    studentId: number;
    progress: number;
    learningStatus: string;
}

interface LearningStatus {
    id: number;
    name: string;
}

const CourseManagePage = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [materials, setMaterials] = useState<CourseMaterial[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
    const [learningStatuses, setLearningStatuses] = useState<LearningStatus[]>([]);
    const [loading, setLoading] = useState({
        course: true,
        materials: true,
        groups: true,
        statuses: true,
        submit: false,
        materialSaving: false
    });
    const [error, setError] = useState<string | null>(null);

    const [editInfoMode, setEditInfoMode] = useState(false);
    const [editMaterialsMode, setEditMaterialsMode] = useState(false);
    const [editGroupsMode, setEditGroupsMode] = useState(false);

    const [activeTab, setActiveTab] = useState('info');
    const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

    const [studentsProgress, setStudentsProgress] = useState<Record<number, StudentProgress>>({});
    const [editingStatus, setEditingStatus] = useState<{studentId: number | null, tempStatus: string}>({
        studentId: null,
        tempStatus: 'В процессе'
    });

    const isAdmin = localStorage.getItem("role") === 'ADMIN';

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading({
                    course: true,
                    materials: true,
                    groups: true,
                    statuses: true,
                    submit: false,
                    materialSaving: false
                });
                setError(null);

                const [courseResponse, materialsResponse, groupsResponse, statusesResponse] = await Promise.all([
                    axios.get(`http://localhost:8080/api/courses/${id}`),
                    axios.get(`http://localhost:8080/api/material/${id}`),
                    axios.get(`http://localhost:8080/api/groups/${id}`),
                    axios.get(`http://localhost:8080/api/progress/status`)
                ]);

                setCourse(courseResponse.data);
                setMaterials(materialsResponse.data || []);
                setGroups(groupsResponse.data || []);
                setLearningStatuses(statusesResponse.data || []);
            } catch (err) {
                setError('Не удалось загрузить данные курса');
                console.error(err);
            } finally {
                setLoading(prev => ({
                    ...prev,
                    course: false,
                    materials: false,
                    groups: false,
                    statuses: false
                }));
            }
        };

        fetchCourseData();
    }, [id]);

    // Загрузка студентов при выборе группы
    useEffect(() => {
        if (selectedGroup) {
            const fetchStudentsWithProgress = async () => {
                try {
                    const [studentsResponse] = await Promise.all([
                        axios.get(`http://localhost:8080/api/progress/groups/${selectedGroup}/students`),
                    ]);

                    setStudents(studentsResponse.data);
                } catch (err) {
                    setError('Не удалось загрузить список студентов');
                    console.error(err);
                }
            };
            fetchStudentsWithProgress();
        }
    }, [selectedGroup, id]);

    const handleUpdateLearningStatus = async (studentId: number, requestId: number, newStatus: string) => {
        try {
            await axios.put(
                `http://localhost:8080/api/progress/${requestId}/update/status`,
                {
                    courseId: id,
                    status: newStatus
                },
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`
                    }
                }
            );

            // Обновляем локальное состояние
            setStudentsProgress(prev => ({
                ...prev,
                [studentId]: {
                    ...prev[studentId],
                    learningStatus: newStatus
                }
            }));
            setEditingStatus({ studentId: null, tempStatus: 'В процессе' });
        } catch (err) {
            setError('Ошибка при обновлении статуса обучения');
            console.error(err);
        }
    };

    const startEditingStatus = (studentId: number, currentStatus: string) => {
        setEditingStatus({
            studentId,
            tempStatus: currentStatus || 'В процессе'
        });
    };

    const cancelEditingStatus = () => {
        setEditingStatus({ studentId: null, tempStatus: 'В процессе' });
    };

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
        setMaterials([...materials, { name: '', text: '', isNew: true }]);
    };

    const handleSaveMaterial = async (index: number) => {
        const material = materials[index];

        if (!material.name || !material.text) {
            setError('Название и содержание материала обязательны');
            return;
        }

        try {
            setLoading(prev => ({ ...prev, materialSaving: true }));
            setError(null);

            let savedMaterial;

            if (material.isNew) {
                const response = await axios.post(
                    `http://localhost:8080/api/material/${id}/add`,
                    { name: material.name, text: material.text },
                    {
                        headers: {
                            'Authorization': `Bearer ${user?.token}`
                        }
                    }
                );
                savedMaterial = response.data;
            } else {
                const response = await axios.put(
                    `http://localhost:8080/api/material/${material.id}/update`,
                    { name: material.name, text: material.text },
                    {
                        headers: {
                            'Authorization': `Bearer ${user?.token}`
                        }
                    }
                );
                savedMaterial = response.data;
            }

            const newMaterials = [...materials];
            newMaterials[index] = { ...savedMaterial };
            setMaterials(newMaterials);

        } catch (err) {
            setError('Ошибка при сохранении материала');
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, materialSaving: false }));
        }
    };

    const handleRemoveMaterial = async (index: number) => {
        const material = materials[index];

        if (material.id) {
            try {
                await axios.delete(
                    `http://localhost:8080/api/material/${material.id}/delete`,
                    {
                        headers: {
                            'Authorization': `Bearer ${user?.token}`
                        }
                    }
                );

                const newMaterials = materials.filter((_, i) => i !== index);
                setMaterials(newMaterials);
            } catch (err) {
                setError('Ошибка при удалении материала');
                console.error(err);
            }
        } else {
            const newMaterials = materials.filter((_, i) => i !== index);
            setMaterials(newMaterials);
        }
    };

    const handleAddGroup = async () => {
        if (!selectedGroup) return;

        try {
            await axios.post(
                `http://localhost:8080/api/courses/${id}/groups`,
                { groupId: selectedGroup },
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`
                    }
                }
            );

            const response = await axios.get(`http://localhost:8080/api/courses/${id}/groups`);
            setGroups(response.data);
            setSelectedGroup(null);
        } catch (err) {
            setError('Ошибка при добавлении группы');
            console.error(err);
        }
    };

    const handleRemoveGroup = async (groupId: number) => {
        try {
            await axios.delete(
                `http://localhost:8080/api/courses/${id}/groups/${groupId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`
                    }
                }
            );

            const response = await axios.get(`http://localhost:8080/api/courses/${id}/groups`);
            setGroups(response.data);
        } catch (err) {
            setError('Ошибка при удалении группы');
            console.error(err);
        }
    };

    const handleSaveCourseInfo = async () => {
        if (!course) return;

        try {
            setLoading(prev => ({ ...prev, submit: true }));
            setError(null);

            await axios.put(`http://localhost:8080/api/courses/${id}/update`, course, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });

            setEditInfoMode(false);
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
                    {course.name}
                </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
                <Tab label="Информация" value="info"/>
                <Tab label="Материалы" value="materials"/>
                <Tab label="Группы" value="groups"/>
            </Tabs>

            {activeTab === 'info' && (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        {editInfoMode ? (
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="outlined"
                                    startIcon={<Cancel />}
                                    onClick={() => setEditInfoMode(false)}
                                    disabled={loading.submit}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={loading.submit ? <CircularProgress size={20} /> : <Save />}
                                    onClick={handleSaveCourseInfo}
                                    disabled={loading.submit}
                                >
                                    Сохранить
                                </Button>
                            </Stack>
                        ) : (
                            <Button
                                variant="contained"
                                startIcon={<Edit />}
                                onClick={() => setEditInfoMode(true)}
                            >
                                Редактировать
                            </Button>
                        )}
                    </Box>

                    {editInfoMode ? (
                        <Stack spacing={3}>
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

                            <Stack direction="row" justifyContent="flex-end">
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleDeleteCourse}
                                    disabled={loading.submit}
                                    startIcon={loading.submit ? <CircularProgress size={20} /> : null}
                                >
                                    Удалить курс
                                </Button>
                            </Stack>
                        </Stack>
                    ) : (
                        <Stack spacing={3}>
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
                        </Stack>
                    )}
                </Box>
            )}

            {activeTab === 'materials' && (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        {editMaterialsMode ? (
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="outlined"
                                    startIcon={<Cancel />}
                                    onClick={() => setEditMaterialsMode(false)}
                                >
                                    Завершить редактирование
                                </Button>
                            </Stack>
                        ) : (
                            <Button
                                variant="contained"
                                startIcon={<Edit />}
                                onClick={() => setEditMaterialsMode(true)}
                            >
                                Редактировать материалы
                            </Button>
                        )}
                    </Box>

                    {editMaterialsMode ? (
                        <>
                            <Typography variant="h6">Материалы курса</Typography>
                            <Divider sx={{ my: 2 }} />

                            {materials.map((material, index) => (
                                <Paper key={index} elevation={2} sx={{ p: 2, mb: 2 }}>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 2
                                    }}>
                                        <Typography>
                                            {material.isNew ? 'Новый материал' : `Материал ${material.id}`}
                                        </Typography>
                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => handleSaveMaterial(index)}
                                                disabled={loading.materialSaving || !material.name || !material.text}
                                                startIcon={loading.materialSaving ? <CircularProgress size={20} /> : <Save />}
                                            >
                                                Сохранить
                                            </Button>
                                            <IconButton
                                                onClick={() => handleRemoveMaterial(index)}
                                                color="error"
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Stack>
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
                                sx={{ alignSelf: 'flex-start', mt: 2 }}
                            >
                                Добавить материал
                            </Button>
                        </>
                    ) : (
                        <>
                            <Typography variant="h6">Материалы курса</Typography>
                            <Divider sx={{ my: 2 }} />

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
                </Box>
            )}

            {activeTab === 'groups' && (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        {editGroupsMode ? (
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="outlined"
                                    startIcon={<Cancel />}
                                    onClick={() => setEditGroupsMode(false)}
                                >
                                    Завершить редактирование
                                </Button>
                            </Stack>
                        ) : isAdmin && (
                            <Button
                                variant="contained"
                                startIcon={<Edit />}
                                onClick={() => setEditGroupsMode(true)}
                            >
                                Управлять группами
                            </Button>
                        )}
                    </Box>

                    <Stack spacing={3}>
                        <Typography variant="h6">Группы курса</Typography>
                        <Divider />

                        {editGroupsMode && isAdmin && (
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Select
                                    value={selectedGroup || ''}
                                    onChange={(e) => setSelectedGroup(Number(e.target.value))}
                                    displayEmpty
                                    sx={{ minWidth: 200 }}
                                >
                                    <MenuItem value="" disabled>
                                        Выберите группу
                                    </MenuItem>
                                    {availableGroups
                                        .filter(g => !groups.some(cg => cg.id === g.id))
                                        .map(group => (
                                            <MenuItem key={group.id} value={group.id}>
                                                {group.name} ({group.studentCount}/{group.maxStudentCount})
                                            </MenuItem>
                                        ))}
                                </Select>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={handleAddGroup}
                                    disabled={!selectedGroup}
                                >
                                    Добавить группу
                                </Button>
                            </Stack>
                        )}

                        {groups.length === 0 ? (
                            <Typography>Нет назначенных групп</Typography>
                        ) : (
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Название группы</TableCell>
                                            <TableCell>Студентов</TableCell>
                                            <TableCell>Статус</TableCell>
                                            {editGroupsMode && isAdmin && <TableCell>Действия</TableCell>}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {groups.map((group) => (
                                            <TableRow
                                                key={group.id}
                                                hover
                                                onClick={() => setSelectedGroup(group.id === selectedGroup ? null : group.id)}
                                                sx={{ cursor: 'pointer' }}
                                            >
                                                <TableCell>{group.name}</TableCell>
                                                <TableCell>
                                                    {group.studentCount}/{group.maxStudentCount}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={group.studentCount < group.maxStudentCount ? 'Доступна' : 'Заполнена'}
                                                        color={group.studentCount < group.maxStudentCount ? 'success' : 'error'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                {editGroupsMode && isAdmin && (
                                                    <TableCell>
                                                        <IconButton
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveGroup(group.id);
                                                            }}
                                                            color="error"
                                                        >
                                                            <Delete />
                                                        </IconButton>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}

                        {selectedGroup && (
                            <>
                                <Typography variant="h6" sx={{ mt: 3 }}>
                                    Студенты группы {groups.find(g => g.id === selectedGroup)?.name}
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                {students.length === 0 ? (
                                    <Typography>В группе нет студентов</Typography>
                                ) : (
                                    <TableContainer component={Paper}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>ФИО</TableCell>
                                                    <TableCell>Email</TableCell>
                                                    <TableCell>Прогресс</TableCell>
                                                    <TableCell>Статус обучения</TableCell>
                                                    {isAdmin && <TableCell>Действия</TableCell>}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {students.map((student) => {
                                                    const progressData = studentsProgress[student.id];
                                                    const isEditing = editingStatus.studentId === student.id;

                                                    return (
                                                        <TableRow key={student.id}>
                                                            <TableCell>{student.surname} {student.name} {student.secondName}</TableCell>
                                                            <TableCell>{student.email}</TableCell>
                                                            <TableCell>
                                                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                                    <Box sx={{width: '100%', mr: 1}}>
                                                                        <LinearProgress
                                                                            variant="determinate"
                                                                            value={student.percent}
                                                                        />
                                                                    </Box>
                                                                    <Typography variant="body2">
                                                                        {Math.round(student.percent)}
                                                                    </Typography>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                {isEditing ? (
                                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                                        <Select
                                                                            value={editingStatus.tempStatus}
                                                                            onChange={(e) => setEditingStatus(prev => ({
                                                                                ...prev,
                                                                                tempStatus: e.target.value
                                                                            }))}
                                                                            size="small"
                                                                        >
                                                                            {learningStatuses.map(status => (
                                                                                <MenuItem key={status.id} value={status.name}>
                                                                                    {status.name}
                                                                                </MenuItem>
                                                                            ))}
                                                                        </Select>
                                                                        <IconButton
                                                                            size="small"
                                                                            color="primary"
                                                                            onClick={() => {
                                                                                handleUpdateLearningStatus(
                                                                                    student.id,
                                                                                    student.requestId,
                                                                                    editingStatus.tempStatus
                                                                                );
                                                                            }}
                                                                        >
                                                                            <Check />
                                                                        </IconButton>
                                                                        <IconButton
                                                                            size="small"
                                                                            color="error"
                                                                            onClick={cancelEditingStatus}
                                                                        >
                                                                            <Close />
                                                                        </IconButton>
                                                                    </Stack>
                                                                ) : (
                                                                    <Chip
                                                                        label={student.statusName || 'Не указан'}
                                                                        color={
                                                                            student?.statusName === 'Завершено' ? 'success' :
                                                                                student?.statusName === 'Отчислен' ? 'error' :
                                                                                    'default'
                                                                        }
                                                                        onClick={() => startEditingStatus(
                                                                            student.id,
                                                                            student?.statusName || 'В процессе'
                                                                        )}
                                                                    />
                                                                )}
                                                            </TableCell>
                                                            {isAdmin && (
                                                                <TableCell>
                                                                    <IconButton
                                                                        color="primary"
                                                                        onClick={() => startEditingStatus(
                                                                            student.id,
                                                                            student?.statusName || 'В процессе'
                                                                        )}
                                                                    >
                                                                        <Edit />
                                                                    </IconButton>
                                                                </TableCell>
                                                            )}
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </>
                        )}
                    </Stack>
                </Box>
            )}
        </Box>
    );
};

export default CourseManagePage;