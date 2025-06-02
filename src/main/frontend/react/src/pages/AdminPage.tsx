import React, { useState, useEffect } from 'react';
import {
    Box, List, ListItem, ListItemIcon, ListItemText, Typography, Divider,
    Container, ListItemButton, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Select, MenuItem, Button,
    CircularProgress, Alert, IconButton, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions, TextField, Chip, Link, Tabs, Tab
} from '@mui/material';
import { Book, Group, Assignment, Delete, Comment, Person, Check,
    Person as StudentIcon, School as TeacherIcon, AdminPanelSettings as AdminIcon,
    Add as AddIcon, Edit as EditIcon} from '@mui/icons-material';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../components/AuthContext";

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

const AdminPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('all-requests');
    const [requests, setRequests] = useState<Request[]>([]);
    const [statusOptions, setStatusOptions] = useState<RequestStatus[]>([]);
    const [groupOptions, setGroupOptions] = useState<Group[]>([]);
    const [groupsLoading, setGroupsLoading] = useState<{[key: number]: boolean}>({});
    const [loading, setLoading] = useState({
        requests: true,
        statuses: true,
        groups: true,
        students: false,
        worker: false
    });
    const [error, setError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState<number | null>(null);
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [currentRequest, setCurrentRequest] = useState<Request | null>(null);
    const [newComment, setNewComment] = useState('');
    const [editableRequests, setEditableRequests] = useState<{[key: number]: Partial<Request>}>({});

    const [students, setStudents] = useState<Student[]>([]);
    const [employees, setEmployees] = useState<Worker[]>([]);
    const [usersTab, setUsersTab] = useState('students');

    const [editStudentDialogOpen, setEditStudentDialogOpen] = useState(false);
    const [editWorkerDialogOpen, setEditWorkerDialogOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
    const [currentWorker, setCurrentWorker] = useState<Worker | null>(null);
    const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
    const [availableRoles, setAvailableRoles] = useState<string[]>(['Администратор', 'Преподаватель']);

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
        }
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading({ requests: true, statuses: true, groups: true, students: false, worker: false });
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
            setLoading({ requests: false, statuses: false, groups: false, students: false, worker: false });
        }
    };

    const fetchStudents = async () => {
        try {
            setLoading(prev => ({ ...prev, students: true }));
            setError(null);
            const response = await axios.get<Student[]>('http://localhost:8080/api/students');
            setStudents(response.data);
        } catch (err) {
            setError('Не удалось загрузить список студентов');
            console.error('Error loading students:', err);
        } finally {
            setLoading(prev => ({ ...prev, students: false }));
        }
    };

    const fetchWorkers = async () => {
        try {
            setLoading(prev => ({ ...prev, employees: true }));
            setError(null);
            const response = await axios.get<Worker[]>('http://localhost:8080/api/workers');
            setEmployees(response.data);
        } catch (err) {
            setError('Не удалось загрузить список работников');
            console.error('Error loading employees:', err);
        } finally {
            setLoading(prev => ({ ...prev, employees: false }));
        }
    };

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
                const newState = { ...prev };
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

    const handleSaveComment = async () => {
        if (!currentRequest) return;

        try {
            await axios.put(
                `http://localhost:8080/api/requests/${currentRequest.id}/comment`,
                { requestText: newComment },
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setRequests(prev => prev.map(req =>
                req.id === currentRequest.id ? { ...req, requestText: newComment } : req
            ));

            setCommentDialogOpen(false);
        } catch (err) {
            setError('Ошибка при сохранении комментария');
            console.error(err);
        }
    };

    const handleDeleteClick = (requestId: number) => {
        setRequestToDelete(requestId);
        setDeleteDialogOpen(true);
    };

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

    const handleNavigateToEmployee = (workerId: number) => {
        navigate(`/profile/employee/${workerId}`);
    };

    const handleNavigateToStudent = (studentId: number) => {
        navigate(`/profile/student/${studentId}`);
    };

    const handleNavigateCourseManage = (courseId: number) => {
        navigate(`/courses/${courseId}/manage`);
    };

    // Open student edit dialog
    const handleEditStudentClick = (student: Student) => {
        setCurrentStudent(student);
        setEditStudentDialogOpen(true);
    };

    // Open worker edit dialog
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
            setNewStudent({ lastName: '', firstName: '', middleName: '', email: '', password: '' });
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
            setNewWorker({ lastName: '', firstName: '', middleName: '', email: '', role: 'Преподаватель', password: '' });
        } catch (err) {
            setError('Ошибка при добавлении работника');
            console.error(err);
        }
    };

    if (loading.requests || loading.statuses || loading.groups) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)'}}>
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
                                <Book />
                            </ListItemIcon>
                            <ListItemText primary="Обработка заявок" />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton
                            selected={activeTab === 'users'}
                            onClick={() => setActiveTab('users')}
                        >
                            <ListItemIcon>
                                <Assignment />
                            </ListItemIcon>
                            <ListItemText primary="Пользователи" />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton
                            selected={activeTab === 'course-managing'}
                            onClick={() => setActiveTab('course-managing')}
                        >
                            <ListItemIcon>
                                <Group />
                            </ListItemIcon>
                            <ListItemText primary="Курсы" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Paper>

            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                {activeTab === 'all-requests' && (
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            Одобрение заявок
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
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
                                        {/*<TableCell>ID</TableCell>*/}
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
                                    {requests.map((request) => {
                                        const editedRequest = editableRequests[request.id] || {};
                                        const currentStatus = editedRequest.status !== undefined ? editedRequest.status : request.status;
                                        const currentGroupId = editedRequest.groupId !== undefined ? editedRequest.groupId : request.groupId;

                                        return (
                                            <TableRow key={request.id}>
                                                {/*<TableCell>{request.id}</TableCell>*/}
                                                <TableCell>
                                                    <Link
                                                        component="button"
                                                        onClick={() => handleNavigateToStudent(request.studentId)}
                                                        sx={{ display: 'flex', alignItems: 'center' }}
                                                    >
                                                        <Person sx={{ mr: 1 }} />
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
                                                        sx={{ display: 'flex', alignItems: 'center' }}
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
                                                        sx={{ minWidth: 120 }}
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
                                                        sx={{ minWidth: 120 }}
                                                        MenuProps={{
                                                            disablePortal: true,
                                                            TransitionProps: { timeout: 0 }
                                                        }}
                                                        IconComponent={groupsLoading[request.id] ? () => <CircularProgress size={24} /> : undefined}
                                                    >
                                                        <MenuItem value="">Не выбрана</MenuItem>
                                                        {groupOptions.map((group) => (
                                                            <MenuItem key={group.id} value={group.id}>
                                                                {group.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </TableCell>
                                                <TableCell sx={{ maxWidth: 200 }}>
                                                    {request.requestText || 'Нет комментария'}
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleAddComment(request)}
                                                    >
                                                        <Comment />
                                                    </IconButton>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleDeleteClick(request.id)}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                    <IconButton
                                                        color="success"
                                                        onClick={() => handleSaveChanges(request.id)}
                                                        disabled={!editableRequests[request.id]}
                                                    >
                                                        <Check />
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
                            sx={{ mb: 3 }}
                        >
                            <Tab label="Студенты" value="students" icon={<StudentIcon />} />
                            <Tab label="Работники" value="workers" icon={<TeacherIcon />} />
                        </Tabs>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        )}

                        {usersTab === 'students' ? (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setAddStudentDialogOpen(true)}
                            >
                                Добавить студента
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
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
                                            <TableCell>ID</TableCell>
                                            <TableCell>ФИО</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Действия</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loading.students ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">
                                                    <CircularProgress />
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            students.map(student => (
                                                <TableRow key={student.id}>
                                                    <TableCell>{student.id}</TableCell>
                                                    <TableCell>
                                                        <Link
                                                            component="button"
                                                            onClick={() => handleNavigateToStudent(student.id)}
                                                            sx={{ display: 'flex', alignItems: 'center' }}
                                                        >
                                                            <Person sx={{ mr: 1 }} />
                                                            {student.lastName} {student.firstName} {student.middleName}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>{student.email}</TableCell>
                                                    <TableCell>
                                                        <IconButton color="primary"
                                                                    onClick={() => handleEditStudentClick(student)}>
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton color="error">
                                                            <Delete />
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
                                            <TableCell>ID</TableCell>
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
                                                    <CircularProgress />
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            employees.map(worker => (
                                                <TableRow key={worker.id}>
                                                    <TableCell>{worker.id}</TableCell>
                                                    <TableCell>
                                                        <Link
                                                            component="button"
                                                            onClick={() => handleNavigateToEmployee(worker.id)}
                                                            sx={{ display: 'flex', alignItems: 'center' }}
                                                        >
                                                            <Person sx={{ mr: 1 }} />
                                                            {worker.lastName} {worker.firstName} {worker.middleName}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>{worker.email}</TableCell>
                                                    <TableCell>{worker.role}</TableCell>
                                                    <TableCell>
                                                        <IconButton color="primary"
                                                                    onClick={() => handleEditWorkerClick(worker)}>
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton color="error">
                                                            <Delete />
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
                                    sx={{ mt: 2 }}
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
                            sx={{ mt: 2 }}
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
                            sx={{ mt: 2 }}
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
                            sx={{ mt: 2 }}
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
                                    sx={{ mt: 2 }}
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
                                    sx={{ mt: 2 }}
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