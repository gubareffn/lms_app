import React, { useState, useEffect } from 'react';
import {
    Box, List, ListItem, ListItemIcon, ListItemText, Typography, Divider,
    Container, ListItemButton, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Select, MenuItem, Button,
    CircularProgress, Alert, IconButton, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions, TextField, Chip, Link
} from '@mui/material';
import { Book, Group, Assignment, Delete, Comment, Person, Check } from '@mui/icons-material';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../components/AuthContext";

interface Request {
    id: number;
    studentId: number;
    studentName: string;
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
        groups: true
    });
    const [error, setError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState<number | null>(null);
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [currentRequest, setCurrentRequest] = useState<Request | null>(null);
    const [newComment, setNewComment] = useState('');
    const [editableRequests, setEditableRequests] = useState<{[key: number]: Partial<Request>}>({});

    useEffect(() => {
        if (activeTab === 'all-requests') {
            fetchData();

        }
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading({ requests: true, statuses: true, groups: true });
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
            setLoading({ requests: false, statuses: false, groups: false });
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

    const handleNavigateToStudent = (studentId: number) => {
        navigate(`/students/${studentId}`);
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
                            <ListItemText primary="Одобрение заявок" />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton
                            selected={activeTab === 'assignments'}
                            onClick={() => setActiveTab('assignments')}
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

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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

                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
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
                                                <TableCell>{request.id}</TableCell>
                                                <TableCell>
                                                    <Link
                                                        component="button"
                                                        onClick={() => handleNavigateToStudent(request.studentId)}
                                                        sx={{ display: 'flex', alignItems: 'center' }}
                                                    >
                                                        <Person sx={{ mr: 1 }} />
                                                        {request.studentName}
                                                    </Link>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {request.studentEmail}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{request.courseName}</TableCell>
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

                {activeTab === 'course-managing' && (
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            Управление пользователями
                        </Typography>
                        <Typography paragraph>
                            Список пользователей и инструменты управления будут отображаться здесь.
                        </Typography>
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default AdminPage;