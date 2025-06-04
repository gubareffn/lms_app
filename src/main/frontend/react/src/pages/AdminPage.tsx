import React, {useState, useEffect} from 'react';
import {
    Box, List, ListItem, ListItemIcon, ListItemText, Typography, Divider,
    Container, ListItemButton, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Select, MenuItem, Button,
    CircularProgress, Alert, IconButton, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions, TextField, Chip, Link, Tabs, Tab
} from '@mui/material';
import {
    Book, Group, Assignment, Delete, Comment, Person, Check,
    Person as StudentIcon, School as TeacherIcon, AdminPanelSettings as AdminIcon,
    Add as AddIcon, Edit as EditIcon, KeyboardArrowUp, KeyboardArrowDown
} from '@mui/icons-material';
import axios from "axios";
import {useNavigate} from 'react-router-dom';
import {useAuth} from "../components/AuthContext";

interface Request {
    id: number;
    studentId: number;
    studentFirstName: string;
    studentMiddleName: string;
    studentLastName: string;
    studentEmail: string;
    courseId: number;
    courseName: string;
    courseDescription: string;
    createTime: string;
    processingTime: string | null;
    status: string;
    requestText: string | null;
    groupId?: number;
    statusId?: number;
}

interface RequestStatus {
    id: number;
    name: string;
    description: string;
}

interface Group {
    id: number;
    name: string;
    maxStudents: number;
}

interface Student {
    id: number;
    lastName: string;
    firstName: string;
    middleName: string;
    email: string;
    password: string;
}

interface Worker {
    id: number;
    lastName: string;
    firstName: string;
    middleName: string;
    email: string;
    role: string;
    password: string;
}

interface Course {
    id: number;
    name: string;
    description: string;
    studyDirection: string;
    resultCompetence: string;
    hoursCount: string;
    status: string;
    category: string;
    startDate: string;
    endDate: string;
    groups?: Group[]
}

const AdminPage = () => {
    const navigate = useNavigate();
    const {user} = useAuth();
    const [activeTab, setActiveTab] = useState('all-requests');
    const [requests, setRequests] = useState<Request[]>([]);
    const [statusOptions, setStatusOptions] = useState<RequestStatus[]>([]);
    const [groupOptions, setGroupOptions] = useState<Group[]>([]);
    const [groupsLoading, setGroupsLoading] = useState<{ [key: number]: boolean }>({});
    const [loading, setLoading] = useState({
        requests: true,
        statuses: true,
        groups: true,
        students: false,
        worker: false,
        courses: false
    });
    const [error, setError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState<number | null>(null);
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [currentRequest, setCurrentRequest] = useState<Request | null>(null);
    const [newComment, setNewComment] = useState('');
    const [editableRequests, setEditableRequests] = useState<{ [key: number]: Partial<Request> }>({});

    const [students, setStudents] = useState<Student[]>([]);
    const [employees, setEmployees] = useState<Worker[]>([]);
    const [usersTab, setUsersTab] = useState('students');

    const [editStudentDialogOpen, setEditStudentDialogOpen] = useState(false);
    const [editWorkerDialogOpen, setEditWorkerDialogOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
    const [currentWorker, setCurrentWorker] = useState<Worker | null>(null);
    const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
    const [availableRoles, setAvailableRoles] = useState<string[]>(['Администратор', 'Преподаватель']);

    const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
    const [loadingGroups, setLoadingGroups] = useState<{[key: number]: boolean}>({});

    const [courses, setCourses] = useState<Course[]>([]);
    const [deleteCourseDialogOpen, setDeleteCourseDialogOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<number | null>(null);

    // Фильтры и поиск
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');

    const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false);
    const [addWorkerDialogOpen, setAddWorkerDialogOpen] = useState(false);
    const [newStudent, setNewStudent] = useState<Omit<Student, 'id'>>({
        lastName: '',
        firstName: '',
        middleName: '',
        email: '',
        password: ''
    });
    const [newWorker, setNewWorker] = useState<Omit<Worker, 'id'>>({
        lastName: '',
        firstName: '',
        middleName: '',
        email: '',
        role: 'Преподаватель',
        password: ''
    });

    useEffect(() => {
        if (activeTab === 'all-requests') {
            fetchData();
        } else if (activeTab === 'users') {
            fetchStudents();
            fetchWorkers();
        } else if (activeTab === 'course-managing') {
            fetchCourses();
        }
    }, [activeTab]);

    // Функция для фильтрации заявок
    const filterRequests = (requests: Request[]) => {
        return requests.filter(request => {
            // Фильтр по поисковому запросу (студент или курс)
            const matchesSearch = searchTerm === '' ||
                request.studentLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.studentFirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.courseName.toLowerCase().includes(searchTerm.toLowerCase());

            // Фильтр по статусу
            const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

            // Фильтр по дате
            const now = new Date();
            const requestDate = new Date(request.createTime);
            let matchesDate = true;

            if (dateFilter === 'today') {
                matchesDate = requestDate.toDateString() === now.toDateString();
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(now);
                weekAgo.setDate(weekAgo.getDate() - 7);
                matchesDate = requestDate >= weekAgo;
            } else if (dateFilter === 'month') {
                const monthAgo = new Date(now);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                matchesDate = requestDate >= monthAgo;
            }

            return matchesSearch && matchesStatus && matchesDate;
        });
    };

    // Загрузка заявок
    const fetchData = async () => {
        try {
            setLoading({requests: true, statuses: true, groups: true, students: false, worker: false, courses: false});
            setError(null);

            const [requestsResponse, statusesResponse] = await Promise.all([
                axios.get<Request[]>('http://localhost:8080/api/requests'),
                axios.get<RequestStatus[]>('http://localhost:8080/api/request/status'),
            ]);

            setRequests(requestsResponse.data);
            setStatusOptions(statusesResponse.data);
        } catch (err) {
            setError('Не удалось загрузить данные');
            console.error('Error:', err);
        } finally {
            setLoading({
                requests: false,
                statuses: false,
                groups: false,
                students: false,
                worker: false,
                courses: false
            });
        }
    };

    // Загрузка студентов
    const fetchStudents = async () => {
        try {
            setLoading(prev => ({...prev, students: true}));
            setError(null);
            const response = await axios.get<Student[]>('http://localhost:8080/api/students');
            setStudents(response.data);
        } catch (err) {
            setError('Не удалось загрузить список студентов');
            console.error('Error loading students:', err);
        } finally {
            setLoading(prev => ({...prev, students: false}));
        }
    };

    // Загрузка работников
    const fetchWorkers = async () => {
        try {
            setLoading(prev => ({...prev, employees: true}));
            setError(null);
            const response = await axios.get<Worker[]>('http://localhost:8080/api/workers');
            setEmployees(response.data);
        } catch (err) {
            setError('Не удалось загрузить список работников');
            console.error('Error loading employees:', err);
        } finally {
            setLoading(prev => ({...prev, employees: false}));
        }
    };

    // Загрузка курсов
    const fetchCourses = async () => {
        try {
            setLoading(prev => ({...prev, courses: true}));
            setError(null);
            const response = await axios.get<Course[]>('http://localhost:8080/api/courses/details');
            setCourses(response.data);
        } catch (err) {
            setError('Не удалось загрузить список курсов');
            console.error('Error loading courses:', err);
        } finally {
            setLoading(prev => ({...prev, courses: false}));
        }
    };

    const handleDeleteCourseClick = (courseId: number) => {
        setCourseToDelete(courseId);
        setDeleteCourseDialogOpen(true);
    };

    // Удаление курса
    const handleDeleteCourseConfirm = async () => {
        if (!courseToDelete) return;

        try {
            await axios.delete(
                `http://localhost:8080/api/courses/${courseToDelete}`,
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`
                    }
                }
            );
            setCourses(prev => prev.filter(course => course.id !== courseToDelete));
        } catch (err) {
            setError('Ошибка при удалении курса');
            console.error(err);
        } finally {
            setDeleteCourseDialogOpen(false);
            setCourseToDelete(null);
        }
    };

    //Загрузка групп для таблицы курсов
    const fetchCourseGroups  = async (courseId: number) => {
        try {
            setGroupsLoading(prev => ({...prev, [courseId]: true}));
            const response = await axios.get<Group[]>(`http://localhost:8080/api/groups/${courseId}`);
            setCourses(prev => prev.map(course =>
                course.id === courseId ? {...course, groups: response.data} : course
            ));
        } catch (err) {
            console.error('Error loading groups:', err);
            setError('Не удалось загрузить группы курса');
        } finally {
            setGroupsLoading(prev => ({...prev, [courseId]: false}));
        }
    };

    // Загрузка групп конкретного курса
    const fetchGroupsForCourse = async (courseId: number, requestId: number) => {
        try {
            setGroupsLoading(prev => ({...prev, [requestId]: true}));
            setError(null);

            const response = await axios.get<Group[]>(`http://localhost:8080/api/groups/${courseId}`);
            setGroupOptions(response.data);
        } catch (err) {
            setError('Не удалось загрузить группы для курса');
            console.error('Error loading groups:', err);
        } finally {
            setGroupsLoading(prev => ({...prev, [requestId]: false}));
        }
    };

    const handleFieldChange = (requestId: number, field: keyof Request, value: any) => {
        setEditableRequests(prev => ({
            ...prev,
            [requestId]: {
                ...prev[requestId],
                [field]: value
            }
        }));
    };

    const handleExpandCourse = (courseId: number) => {
        if (expandedCourseId === courseId) {
            setExpandedCourseId(null);
        } else {
            setExpandedCourseId(courseId);
            // Если группы еще не загружены - загружаем их
            const course = courses.find(c => c.id === courseId);
            if (course && !course.groups) {
                fetchCourseGroups(courseId);
            }
        }
    };

    // Обработка заявки
    const handleSaveChanges = async (requestId: number) => {
        try {
            const changes = editableRequests[requestId];
            if (!changes || Object.keys(changes).length === 0) return;

            const requestData: any = {};

            if (changes.status) {
                const status = statusOptions.find(s => s.name === changes.status);
                if (status) {
                    requestData.statusId = status.id;
                }
            }

            if (changes.groupId !== undefined) {
                requestData.groupId = changes.groupId;
            }

            if (Object.keys(requestData).length === 0) return;

            const response = await axios.put(
                `http://localhost:8080/api/requests/${requestId}/status`,
                requestData,
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Обновляем локальное состояние
            setRequests(prev => prev.map(req =>
                req.id === requestId ? {
                    ...req,
                    ...changes,
                    statusId: requestData.statusId ? requestData.statusId : req.statusId
                } : req
            ));

            // Удаляем сохраненные изменения
            setEditableRequests(prev => {
                const newState = {...prev};
                delete newState[requestId];
                return newState;
            });

        } catch (err) {
            setError('Ошибка при сохранении изменений');
            console.error(err);
        }
    };

    const handleAddComment = (request: Request) => {
        setCurrentRequest(request);
        setNewComment(request.requestText || '');
        setCommentDialogOpen(true);
    };

    // Добавление комментария
    const handleSaveComment = async () => {
        if (!currentRequest) return;

        try {
            await axios.put(
                `http://localhost:8080/api/requests/${currentRequest.id}/comment`,
                {requestText: newComment},
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setRequests(prev => prev.map(req =>
                req.id === currentRequest.id ? {...req, requestText: newComment} : req
            ));

            setCommentDialogOpen(false);
        } catch (err) {
            setError('Ошибка при сохранении комментария');
            console.error(err);
        }
    };

    // Удаление заявки
    const handleDeleteConfirm = async () => {
        if (!requestToDelete) return;

        try {
            await axios.delete(
                `http://localhost:8080/api/requests/${requestToDelete}/delete`,
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`
                    }
                }
            );
            setRequests(prev => prev.filter(req => req.id !== requestToDelete));
        } catch (err) {
            setError('Ошибка при удалении заявки');
            console.error(err);
        } finally {
            setDeleteDialogOpen(false);
            setRequestToDelete(null);
        }
    };

    const handleDeleteClick = (requestId: number) => {
        setRequestToDelete(requestId);
        setDeleteDialogOpen(true);
    };

    const handleNavigateToEmployee = (workerId: number) => {
        navigate(`/profile/employee/${workerId}`);
    };

    const handleNavigateToStudent = (studentId: number) => {
        navigate(`/profile/student/${studentId}`);
    };

    const handleNavigateCourseManage = (courseId: number) => {
        navigate(`/courses/${courseId}/manage`);
    };

    // Диалог редактирования студента
    const handleEditStudentClick = (student: Student) => {
        setCurrentStudent(student);
        setEditStudentDialogOpen(true);
    };

    // Диалог редактирования работника
    const handleEditWorkerClick = (worker: Worker) => {
        setCurrentWorker(worker);
        setEditWorkerDialogOpen(true);
    };

    // Сохранить студента
    const handleSaveStudent = async () => {
        if (!currentStudent) return;

        try {
            await axios.put(
                `http://localhost:8080/api/students/${currentStudent.id}/update`,
                {
                    lastName: currentStudent.lastName,
                    firstName: currentStudent.firstName,
                    middleName: currentStudent.middleName,
                    email: currentStudent.email,
                    password: currentStudent.password,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setStudents(prev => prev.map(s =>
                s.id === currentStudent.id ? currentStudent : s
            ));
            setEditStudentDialogOpen(false);
        } catch (err) {
            setError('Ошибка при сохранении изменений студента');
            console.error(err);
        }
    };

    // Сохранить работника
    const handleSaveWorker = async () => {
        if (!currentWorker) return;

        try {
            await axios.put(
                `http://localhost:8080/api/workers/${currentWorker.id}/update`,
                {
                    lastName: currentWorker.lastName,
                    firstName: currentWorker.firstName,
                    middleName: currentWorker.middleName,
                    email: currentWorker.email,
                    role: currentWorker.role,
                    password: currentWorker.password
                },
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setEmployees(prev => prev.map(w =>
                w.id === currentWorker.id ? currentWorker : w
            ));
            setEditWorkerDialogOpen(false);
        } catch (err) {
            setError('Ошибка при сохранении изменений работника');
            console.error(err);
        }
    };

    // Добавление нового студента
    const handleAddStudent = async () => {
        try {
            const response = await axios.post(
                'http://localhost:8080/api/students/create',
                newStudent,
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setStudents([...students, response.data]);
            setAddStudentDialogOpen(false);
            setNewStudent({lastName: '', firstName: '', middleName: '', email: '', password: ''});
        } catch (err) {
            setError('Ошибка при добавлении студента');
            console.error(err);
        }
    };

    // Добавление нового работника
    const handleAddWorker = async () => {
        try {
            const response = await axios.post(
                'http://localhost:8080/api/workers/create',
                newWorker,
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setEmployees([...employees, response.data]);
            setAddWorkerDialogOpen(false);
            setNewWorker({lastName: '', firstName: '', middleName: '', email: '', role: 'Преподаватель', password: ''});
        } catch (err) {
            setError('Ошибка при добавлении работника');
            console.error(err);
        }
    };

    if (loading.requests || loading.statuses || loading.groups) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <Box sx={{display: 'flex', minHeight: 'calc(100vh - 64px)'}}>
            {/* Боковое меню */}
            <Paper elevation={3} sx={{
                width: 300,
                p: 2,
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column'
            }}>
                <List>
                    <ListItem disablePadding>
                        <ListItemButton
                            selected={activeTab === 'all-requests'}
                            onClick={() => setActiveTab('all-requests')}
                        >
                            <ListItemIcon>
                                <Book/>
                            </ListItemIcon>
                            <ListItemText primary="Обработка заявок"/>
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton
                            selected={activeTab === 'users'}
                            onClick={() => setActiveTab('users')}
                        >
                            <ListItemIcon>
                                <Assignment/>
                            </ListItemIcon>
                            <ListItemText primary="Пользователи"/>
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton
                            selected={activeTab === 'course-managing'}
                            onClick={() => setActiveTab('course-managing')}
                        >
                            <ListItemIcon>
                                <Group/>
                            </ListItemIcon>
                            <ListItemText primary="Курсы"/>
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={() => navigate('/admin/references')}
                        >
                            <ListItemText primary="Справочники" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Paper>

            <Container maxWidth="xl" sx={{mt: 4, mb: 4}}>
                {activeTab === 'all-requests' && (
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            Обработка заявок
                        </Typography>

                        <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <TextField
                                label="Поиск (студент или курс)"
                                variant="outlined"
                                size="small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                sx={{ minWidth: 200 }}
                            />

                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                size="small"
                                sx={{ minWidth: 200 }}
                            >
                                <MenuItem value="all">Все статусы</MenuItem>
                                {statusOptions.map((status) => (
                                    <MenuItem key={status.id} value={status.name}>
                                        {status.name}
                                    </MenuItem>
                                ))}
                            </Select>

                            <Select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                size="small"
                                sx={{ minWidth: 200 }}
                            >
                                <MenuItem value="all">Все даты</MenuItem>
                                <MenuItem value="today">Сегодня</MenuItem>
                                <MenuItem value="week">За неделю</MenuItem>
                                <MenuItem value="month">За месяц</MenuItem>
                            </Select>

                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                    setDateFilter('all');
                                }}
                            >
                                Сбросить фильтры
                            </Button>
                        </Paper>

                        {error && (
                            <Alert severity="error" sx={{mb: 2}} onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        )}

                        <TableContainer component={Paper} sx={{
                            width: '100%',
                            overflowX: 'auto'
                        }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Студент</TableCell>
                                        <TableCell>Курс</TableCell>
                                        <TableCell>Дата создания</TableCell>
                                        <TableCell>Статус</TableCell>
                                        <TableCell>Группа</TableCell>
                                        <TableCell>Комментарий</TableCell>
                                        <TableCell>Действия</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filterRequests(requests).map((request) => {
                                        const editedRequest = editableRequests[request.id] || {};
                                        const currentStatus = editedRequest.status !== undefined ? editedRequest.status : request.status;
                                        const currentGroupId = editedRequest.groupId !== undefined ? editedRequest.groupId : request.groupId;

                                        return (
                                            <TableRow key={request.id}>
                                                <TableCell>
                                                    <Link
                                                        component="button"
                                                        onClick={() => handleNavigateToStudent(request.studentId)}
                                                        sx={{display: 'flex', alignItems: 'center'}}
                                                    >
                                                        <Person sx={{mr: 1}}/>
                                                        {request.studentLastName} {request.studentFirstName} {request.studentMiddleName}
                                                    </Link>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {request.studentEmail}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Link
                                                        component="button"
                                                        onClick={() => handleNavigateCourseManage(request.courseId)}
                                                        sx={{display: 'flex', alignItems: 'center'}}
                                                    >
                                                        {request.courseName}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(request.createTime).toLocaleString()}
                                                    {request.processingTime && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            Обработано: {new Date(request.processingTime).toLocaleString()}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={currentStatus || ''}
                                                        onChange={(e) => handleFieldChange(request.id, 'status', e.target.value)}
                                                        size="small"
                                                        sx={{minWidth: 120}}
                                                    >
                                                        {statusOptions.map((status) => (
                                                            <MenuItem key={status.id} value={status.name}>
                                                                {status.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={currentGroupId || ''}
                                                        onChange={(e) => handleFieldChange(request.id, 'groupId', Number(e.target.value))}
                                                        onOpen={() => fetchGroupsForCourse(request.courseId, request.id)}
                                                        size="small"
                                                        sx={{minWidth: 120}}
                                                        MenuProps={{
                                                            disablePortal: true,
                                                            TransitionProps: {timeout: 0}
                                                        }}
                                                        IconComponent={groupsLoading[request.id] ? () =>
                                                            <CircularProgress size={24}/> : undefined}
                                                    >
                                                        <MenuItem value="">Не выбрана</MenuItem>
                                                        {groupOptions.map((group) => (
                                                            <MenuItem key={group.id} value={group.id}>
                                                                {group.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </TableCell>
                                                <TableCell sx={{maxWidth: 200}}>
                                                    {request.requestText || 'Нет комментария'}
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleAddComment(request)}
                                                    >
                                                        <Comment/>
                                                    </IconButton>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleDeleteClick(request.id)}
                                                    >
                                                        <Delete/>
                                                    </IconButton>
                                                    <IconButton
                                                        color="success"
                                                        onClick={() => handleSaveChanges(request.id)}
                                                        disabled={!editableRequests[request.id]}
                                                    >
                                                        <Check/>
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                <Dialog
                    open={commentDialogOpen}
                    onClose={() => setCommentDialogOpen(false)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Добавить комментарий к заявке</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Комментарий администратора"
                            fullWidth
                            multiline
                            rows={4}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCommentDialogOpen(false)}>Отмена</Button>
                        <Button
                            onClick={handleSaveComment}
                            variant="contained"
                            disabled={!newComment.trim()}
                        >
                            Сохранить
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Диалог подтверждения удаления */}
                <Dialog
                    open={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}
                >
                    <DialogTitle>Подтверждение удаления</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Вы уверены, что хотите удалить эту заявку? Это действие нельзя отменить.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
                        <Button
                            onClick={handleDeleteConfirm}
                            color="error"
                            variant="contained"
                        >
                            Удалить
                        </Button>
                    </DialogActions>
                </Dialog>

                {activeTab === 'users' && (
                    <Box>
                        <Tabs
                            value={usersTab}
                            onChange={(e, newValue) => setUsersTab(newValue)}
                            sx={{mb: 3}}
                        >
                            <Tab label="Студенты" value="students" icon={<StudentIcon/>}/>
                            <Tab label="Работники" value="workers" icon={<TeacherIcon/>}/>
                        </Tabs>

                        {error && (
                            <Alert severity="error" sx={{mb: 2}} onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        )}

                        {usersTab === 'students' ? (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon/>}
                                onClick={() => setAddStudentDialogOpen(true)}
                            >
                                Добавить студента
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon/>}
                                onClick={() => setAddWorkerDialogOpen(true)}
                            >
                                Добавить работника
                            </Button>
                        )}

                        {usersTab === 'students' ? (
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ФИО</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Действия</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loading.students ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">
                                                    <CircularProgress/>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            students.map(student => (
                                                <TableRow key={student.id}>
                                                    <TableCell>
                                                        <Link
                                                            component="button"
                                                            onClick={() => handleNavigateToStudent(student.id)}
                                                            sx={{display: 'flex', alignItems: 'center'}}
                                                        >
                                                            <Person sx={{mr: 1}}/>
                                                            {student.lastName} {student.firstName} {student.middleName}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>{student.email}</TableCell>
                                                    <TableCell>
                                                        <IconButton color="primary"
                                                                    onClick={() => handleEditStudentClick(student)}>
                                                            <EditIcon/>
                                                        </IconButton>
                                                        <IconButton color="error">
                                                            <Delete/>
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ФИО</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Роль</TableCell>
                                            <TableCell>Действия</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loading.worker ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">
                                                    <CircularProgress/>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            employees.map(worker => (
                                                <TableRow key={worker.id}>
                                                    <TableCell>
                                                        <Link
                                                            component="button"
                                                            onClick={() => handleNavigateToEmployee(worker.id)}
                                                            sx={{display: 'flex', alignItems: 'center'}}
                                                        >
                                                            <Person sx={{mr: 1}}/>
                                                            {worker.lastName} {worker.firstName} {worker.middleName}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>{worker.email}</TableCell>
                                                    <TableCell>{worker.role}</TableCell>
                                                    <TableCell>
                                                        <IconButton color="primary"
                                                                    onClick={() => handleEditWorkerClick(worker)}>
                                                            <EditIcon/>
                                                        </IconButton>
                                                        <IconButton color="error">
                                                            <Delete/>
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                )}

                {activeTab === 'course-managing' && (
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            Управление курсами
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{mb: 2}} onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        )}


                        <Button
                            variant="contained"
                            startIcon={<AddIcon/>}
                            onClick={() => navigate('/teaching/create-course')}
                            sx={{mb: 2}}
                        >
                            Создать курс
                        </Button>

                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell />
                                        <TableCell>Название</TableCell>
                                        <TableCell>Статус</TableCell>
                                        <TableCell>Описание</TableCell>
                                        <TableCell>Кол-во часов</TableCell>
                                        <TableCell>Категория</TableCell>
                                        <TableCell>Дата начала</TableCell>
                                        <TableCell>Дата окончания</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading.courses ? (
                                        <TableRow>
                                            <TableCell colSpan={9} align="center">
                                                <CircularProgress />
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        courses.map((course) => (
                                            <React.Fragment key={course.id}>
                                                <TableRow>
                                                    <TableCell>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleExpandCourse(course.id)}
                                                        >
                                                            {expandedCourseId === course.id ?
                                                                <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                                        </IconButton>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link
                                                            component="button"
                                                            onClick={() => navigate(`/courses/${course.id}/manage`)}
                                                        >
                                                            {course.name}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>{course.status}</TableCell>
                                                    <TableCell>
                                                        {course.description ?
                                                            (course.description.length > 50
                                                                ? `${course.description.substring(0, 50)}...`
                                                                : course.description)
                                                            : 'Нет описания'}
                                                    </TableCell>
                                                    <TableCell>{course.hoursCount}</TableCell>
                                                    <TableCell>{course.category}</TableCell>
                                                    <TableCell>{course.startDate}</TableCell>
                                                    <TableCell>{course.endDate}</TableCell>
                                                </TableRow>
                                                {expandedCourseId === course.id && (
                                                    <TableRow>
                                                        <TableCell colSpan={9} sx={{ py: 0 }}>
                                                            <Box sx={{ margin: 1 }}>
                                                                <Typography variant="h6" gutterBottom component="div">
                                                                    Группы курса
                                                                </Typography>
                                                                {groupsLoading[course.id] ? (
                                                                    <CircularProgress size={24} />
                                                                ) : course.groups && course.groups.length > 0 ? (
                                                                    <Table size="small">
                                                                        <TableHead>
                                                                            <TableRow>
                                                                                <TableCell>Название</TableCell>
                                                                                <TableCell>Действия</TableCell>
                                                                            </TableRow>
                                                                        </TableHead>
                                                                        <TableBody>
                                                                            {course.groups.map((group) => (
                                                                                <TableRow key={group.id}>
                                                                                    <TableCell>{group.name}</TableCell>
                                                                                     <TableCell>
                                                                                        <IconButton size="small">
                                                                                            <EditIcon fontSize="small" />
                                                                                        </IconButton>
                                                                                        <IconButton size="small" color="error">
                                                                                            <Delete fontSize="small" />
                                                                                        </IconButton>
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                        </TableBody>
                                                                    </Table>
                                                                ) : (
                                                                    <Typography variant="body2">
                                                                        У этого курса пока нет групп
                                                                    </Typography>
                                                                )}
                                                                {/*<Button*/}
                                                                {/*    variant="outlined"*/}
                                                                {/*    size="small"*/}
                                                                {/*    startIcon={<AddIcon />}*/}
                                                                {/*    sx={{ mt: 1 }}*/}
                                                                {/*    onClick={() => navigate(`/courses/${course.id}/groups/create`)}*/}
                                                                {/*>*/}
                                                                {/*    Добавить группу*/}
                                                                {/*</Button>*/}
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Диалог подтверждения удаления курса */}
                        <Dialog
                            open={deleteCourseDialogOpen}
                            onClose={() => setDeleteCourseDialogOpen(false)}
                        >
                            <DialogTitle>Подтверждение удаления</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    Вы уверены, что хотите удалить этот курс? Это действие нельзя отменить.
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setDeleteCourseDialogOpen(false)}>Отмена</Button>
                                <Button
                                    onClick={handleDeleteCourseConfirm}
                                    color="error"
                                    variant="contained"
                                >
                                    Удалить
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Box>
                )}

                <Dialog
                    open={editStudentDialogOpen}
                    onClose={() => setEditStudentDialogOpen(false)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Редактировать студента</DialogTitle>
                    <DialogContent>
                        {currentStudent && (
                            <>
                                <TextField
                                    margin="dense"
                                    label="Фамилия"
                                    fullWidth
                                    value={currentStudent.lastName}
                                    onChange={(e) => setCurrentStudent({
                                        ...currentStudent,
                                        lastName: e.target.value
                                    })}
                                    sx={{mt: 2}}
                                />
                                <TextField
                                    margin="dense"
                                    label="Имя"
                                    fullWidth
                                    value={currentStudent.firstName}
                                    onChange={(e) => setCurrentStudent({
                                        ...currentStudent,
                                        firstName: e.target.value
                                    })}
                                />
                                <TextField
                                    margin="dense"
                                    label="Отчество"
                                    fullWidth
                                    value={currentStudent.middleName}
                                    onChange={(e) => setCurrentStudent({
                                        ...currentStudent,
                                        middleName: e.target.value
                                    })}
                                />
                                <TextField
                                    margin="dense"
                                    label="Email"
                                    fullWidth
                                    value={currentStudent.email}
                                    onChange={(e) => setCurrentStudent({
                                        ...currentStudent,
                                        email: e.target.value
                                    })}
                                />
                                <TextField
                                    margin="dense"
                                    label="Пароль"
                                    fullWidth
                                    value={currentStudent.password}
                                    onChange={(e) => setCurrentStudent({
                                        ...currentStudent,
                                        password: e.target.value
                                    })}
                                />
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditStudentDialogOpen(false)}>Отмена</Button>
                        <Button
                            onClick={handleSaveStudent}
                            variant="contained"
                            color="primary"
                        >
                            Сохранить
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Диалог добавления студента */}
                <Dialog
                    open={addStudentDialogOpen}
                    onClose={() => setAddStudentDialogOpen(false)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Добавить нового студента</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            label="Фамилия"
                            fullWidth
                            value={newStudent.lastName}
                            onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                            sx={{mt: 2}}
                        />
                        <TextField
                            margin="dense"
                            label="Имя"
                            fullWidth
                            value={newStudent.firstName}
                            onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                        />
                        <TextField
                            margin="dense"
                            label="Отчество"
                            fullWidth
                            value={newStudent.middleName}
                            onChange={(e) => setNewStudent({...newStudent, middleName: e.target.value})}
                        />
                        <TextField
                            margin="dense"
                            label="Email"
                            fullWidth
                            type="email"
                            value={newStudent.email}
                            onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                        />
                        <TextField
                            margin="dense"
                            label="Пароль"
                            fullWidth
                            type="password"
                            value={newStudent.password}
                            onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAddStudentDialogOpen(false)}>Отмена</Button>
                        <Button
                            onClick={handleAddStudent}
                            variant="contained"
                            color="primary"
                            disabled={!newStudent.lastName || !newStudent.firstName || !newStudent.email || !newStudent.password}
                        >
                            Добавить
                        </Button>
                    </DialogActions>
                </Dialog>


                {/* Диалог добавления работника */}
                <Dialog
                    open={addWorkerDialogOpen}
                    onClose={() => setAddWorkerDialogOpen(false)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Добавить нового работника</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            label="Фамилия"
                            fullWidth
                            value={newWorker.lastName}
                            onChange={(e) => setNewWorker({...newWorker, lastName: e.target.value})}
                            sx={{mt: 2}}
                        />
                        <TextField
                            margin="dense"
                            label="Имя"
                            fullWidth
                            value={newWorker.firstName}
                            onChange={(e) => setNewWorker({...newWorker, firstName: e.target.value})}
                        />
                        <TextField
                            margin="dense"
                            label="Отчество"
                            fullWidth
                            value={newWorker.middleName}
                            onChange={(e) => setNewWorker({...newWorker, middleName: e.target.value})}
                        />
                        <TextField
                            margin="dense"
                            label="Email"
                            fullWidth
                            type="email"
                            value={newWorker.email}
                            onChange={(e) => setNewWorker({...newWorker, email: e.target.value})}
                        />
                        <TextField
                            margin="dense"
                            label="Пароль"
                            fullWidth
                            type="password"
                            value={newWorker.password}
                            onChange={(e) => setNewWorker({...newWorker, password: e.target.value})}
                        />
                        <Select
                            value={newWorker.role}
                            onChange={(e) => setNewWorker({...newWorker, role: e.target.value})}
                            fullWidth
                            sx={{mt: 2}}
                        >
                            {availableRoles.map(role => (
                                <MenuItem key={role} value={role}>
                                    {role}
                                </MenuItem>
                            ))}
                        </Select>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAddWorkerDialogOpen(false)}>Отмена</Button>
                        <Button
                            onClick={handleAddWorker}
                            variant="contained"
                            color="primary"
                            disabled={!newWorker.lastName || !newWorker.firstName || !newWorker.email || !newWorker.password}
                        >
                            Добавить
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Worker Edit Dialog */}
                <Dialog
                    open={editWorkerDialogOpen}
                    onClose={() => setEditWorkerDialogOpen(false)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Редактировать работника</DialogTitle>
                    <DialogContent>
                        {currentWorker && (
                            <>
                                <TextField
                                    margin="dense"
                                    label="Фамилия"
                                    fullWidth
                                    value={currentWorker.lastName}
                                    onChange={(e) => setCurrentWorker({
                                        ...currentWorker,
                                        lastName: e.target.value
                                    })}
                                    sx={{mt: 2}}
                                />
                                <TextField
                                    margin="dense"
                                    label="Имя"
                                    fullWidth
                                    value={currentWorker.firstName}
                                    onChange={(e) => setCurrentWorker({
                                        ...currentWorker,
                                        firstName: e.target.value
                                    })}
                                />
                                <TextField
                                    margin="dense"
                                    label="Отчество"
                                    fullWidth
                                    value={currentWorker.middleName}
                                    onChange={(e) => setCurrentWorker({
                                        ...currentWorker,
                                        middleName: e.target.value
                                    })}
                                />
                                <TextField
                                    margin="dense"
                                    label="Email"
                                    fullWidth
                                    value={currentWorker.email}
                                    onChange={(e) => setCurrentWorker({
                                        ...currentWorker,
                                        email: e.target.value
                                    })}
                                />
                                <TextField
                                    margin="dense"
                                    label="Пароль"
                                    fullWidth
                                    value={currentWorker.password}
                                    onChange={(e) => setCurrentWorker({
                                        ...currentWorker,
                                        password: e.target.value
                                    })}
                                />
                                <Select
                                    value={currentWorker.role}
                                    onChange={(e) => setCurrentWorker({
                                        ...currentWorker,
                                        role: e.target.value
                                    })}
                                    fullWidth
                                    sx={{mt: 2}}
                                >
                                    {availableRoles.map(role => (
                                        <MenuItem key={role} value={role}>
                                            {role}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditWorkerDialogOpen(false)}>Отмена</Button>
                        <Button
                            onClick={handleSaveWorker}
                            variant="contained"
                            color="primary"
                        >
                            Сохранить
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default AdminPage;