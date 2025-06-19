import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Divider, Paper, TextField, Button,
    Stack, IconButton, CircularProgress, Alert, List, ListItem,
    Tabs, Tab, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, Select, MenuItem, LinearProgress, Modal, ListItemText
} from '@mui/material';
import {
    Add,
    Delete,
    Edit,
    Save,
    Cancel,
    People,
    Book,
    Group,
    Check,
    Close,
    ExpandLess,
    ExpandMore,
    InsertDriveFile as FileIcon,
} from '@mui/icons-material';
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

interface TaskFile {
    id: number;
    name: string;
    url: string;
    uploadDate: string;
}

interface AttachedFileDto {
    id: number;
    fileName: string;
    filePath: string;
    uploadDate: string;
}

interface Task {
    id?: number;
    assignmentName: string;
    assignmentDescription: string;
    deadline?: string;
    isNew?: boolean;
    fileUrl?: string;
    files?: TaskFile[];
}

interface Solution {
    id: number;
    sendingDate: string;
    solutionComment: string;
    solutionScore: number | null;
    workerId: number;
    assignmentId: number;
    studentId: number;
    statusId: number;
    studentName?: string;
    studentMiddleName: string
    studentLastName: string
}

interface ExpandedTask {
    taskId: number;
    isExpanded: boolean;
    solutions: Solution[];
    loading: boolean;
    error: string | null;
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

interface Document {
    id: number;
    urlAddress: string;
    createDate: string;
}

interface DocumentType {
    id: number;
    name: string;
}

interface GradeSolutionRequest {
    solutionScore: number;
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
        tasks: true,
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

    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [studentDocuments, setStudentDocuments] = useState<Record<number, Document[]>>({});

    const isAdmin = localStorage.getItem("userType") === 'ADMIN';

    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [selectedDocType, setSelectedDocType] = useState<number | null>(null);
    const [loadingDocTypes, setLoadingDocTypes] = useState(false)

    // задания
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [editTasksMode, setEditTasksMode] = useState(false);
    const [taskFile, setTaskFile] = useState<File | null>(null);
    const [solutions, setSolutions] = useState<Solution[]>([]);

    const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
    const [newGroup, setNewGroup] = useState({
        name: '',
        maxStudentCount: 20,
        courseId: Number(id)
    });

    interface SolutionsTableProps {
        solutions: Solution[];
        onGradeSolution: (solutionId: number, score: number) => Promise<void>;
        loading: boolean;
    }

    const SolutionsTable: React.FC<SolutionsTableProps> = ({
                                                               solutions,
                                                               onGradeSolution,
                                                               loading
                                                           }) => {
        const [editingSolutionId, setEditingSolutionId] = useState<number | null>(null);
        const [scoreInputs, setScoreInputs] = useState<Record<number, number>>({});

        const handleScoreChange = (solutionId: number, value: string) => {
            const numValue = parseInt(value);
            setScoreInputs(prev => ({
                ...prev,
                [solutionId]: isNaN(numValue) ? 0 : numValue
            }));
        };

        const handleSaveScore = async (solutionId: number) => {
            try {
                const score = scoreInputs[solutionId];
                if (score === undefined || score < 0 || score > 100) {
                    alert('Оценка должна быть от 0 до 100');
                    return;
                }

                await onGradeSolution(solutionId, score);
                setEditingSolutionId(null);
            } catch (error) {
                console.error('Error saving score:', error);
            }
        };

        if (loading) {
            return <CircularProgress />;
        }

        if (solutions.length === 0) {
            return <Typography>Нет отправленных решений</Typography>;
        }

        return (
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Студент</TableCell>
                            <TableCell>Дата отправки</TableCell>
                            <TableCell>Решение</TableCell>
                            <TableCell>Текущая оценка</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {solutions.map((solution: Solution) => (
                            <TableRow key={solution.id}>
                                <TableCell>
                                    {solution.studentName + ' ' + solution.studentMiddleName + ' ' + solution.studentLastName || `Студент ${solution.studentId}`}
                                </TableCell>
                                <TableCell>
                                    {new Date(solution.sendingDate).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    {solution.solutionComment || '-'}
                                </TableCell>
                                <TableCell>
                                    {solution.solutionScore !== null ?
                                        solution.solutionScore :
                                        'Не оценено'}
                                </TableCell>
                                <TableCell>
                                    {editingSolutionId === solution.id ? (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={scoreInputs[solution.id] ?? (solution.solutionScore || 0)}
                                                onChange={(e) => handleScoreChange(solution.id, e.target.value)}
                                                inputProps={{
                                                    min: 0,
                                                    max: 100,
                                                    style: { width: '60px' }
                                                }}
                                            />
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleSaveScore(solution.id)}
                                            >
                                                <Check />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => setEditingSolutionId(null)}
                                            >
                                                <Close />
                                            </IconButton>
                                        </Stack>
                                    ) : (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => {
                                                setEditingSolutionId(solution.id);
                                                setScoreInputs(prev => ({
                                                    ...prev,
                                                    [solution.id]: solution.solutionScore || 0
                                                }));
                                            }}
                                        >
                                            {solution.solutionScore !== null ? 'Изменить' : 'Оценить'}
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    const [expandedTasks, setExpandedTasks] = useState<Record<number, ExpandedTask>>({});

    const downloadFile = async (filename: string) => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/files/download/${encodeURIComponent(filename)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`
                    },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Ошибка при скачивании файла:', err);
            setError('Не удалось скачать файл');
        }
    };

    const TaskFilesList = ({ files }: { files: TaskFile[] }) => {
        if (!files || files.length === 0) {
            return <Typography variant="body2" color="text.secondary">Нет прикрепленных файлов</Typography>;
        }

        return (
            <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                    Прикрепленные файлы:
                </Typography>
                <List dense sx={{ bgcolor: 'action.hover', borderRadius: 1 }}>
                    {files.map(file => {
                        // Извлекаем оригинальное имя файла (без пути)
                        const originalFileName = file.name.split('_').pop() || file.name;

                        return (
                            <ListItem
                                key={file.id}
                                sx={{ py: 1, cursor: 'pointer' }}
                                onClick={() => downloadFile(file.name)}
                            >

                                <ListItemText
                                    primary={originalFileName}
                                />
                            </ListItem>
                        );
                    })}
                </List>
            </Box>
        );
    };

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading({
                    course: true,
                    materials: true,
                    groups: true,
                    statuses: true,
                    tasks: true,
                    submit: false,
                    materialSaving: false
                });
                setError(null);
                const [courseResponse, materialsResponse, groupsResponse, statusesResponse, tasksResponse] = await Promise.all([
                    axios.get(`http://localhost:8080/api/courses/${id}`),
                    axios.get(`http://localhost:8080/api/material/${id}`),
                    axios.get(`http://localhost:8080/api/groups/${id}`),
                    axios.get(`http://localhost:8080/api/progress/status`),
                    axios.get(`http://localhost:8080/api/assignments/${id}`)
                ]);

                const tasksWithFiles = await Promise.all(
                    tasksResponse.data.map(async (task: Task) => {
                        try {
                            const filesResponse = await axios.get<AttachedFileDto[]>(
                                `http://localhost:8080/api/files/assignment/${task.id}`,
                                {
                                    headers: {
                                        'Authorization': `Bearer ${user?.token}`
                                    }
                                }
                            );
                            return {
                                ...task,
                                files: filesResponse.data.map(file => ({
                                    id: file.id,
                                    name: file.fileName,
                                    url: file.filePath,
                                    uploadDate: file.uploadDate
                                }))
                            };
                        } catch (err) {
                            console.error(`Ошибка при загрузке файлов для задания ${task.id}:`, err);
                            return {
                                ...task,
                                files: []
                            };
                        }
                    })
                );

                setCourse(courseResponse.data);
                setMaterials(materialsResponse.data || []);
                setGroups(groupsResponse.data || []);
                setLearningStatuses(statusesResponse.data || []);
                setTasks(tasksWithFiles || []);
            } catch (err) {
                setError('Не удалось загрузить данные курса');
                console.error(err);
            } finally {
                setLoading(prev => ({
                    ...prev,
                    course: false,
                    materials: false,
                    groups: false,
                    statuses: false,
                    tasks: false
                }));
            }
        };

        fetchCourseData();
    }, [id]);

    // Обработчики для заданий
    const handleTaskChange = (index: number, field: keyof Task, value: string) => {
        const newTasks = [...tasks];
        newTasks[index] = { ...newTasks[index], [field]: value };
        setTasks(newTasks);
    };

    const handleAddTask = () => {
        setTasks([...tasks, { assignmentName: '', assignmentDescription: '', isNew: true }]);
    };


    const handleRemoveTask = async (index: number) => {
        const task = tasks[index];

        if (task.id) {
            try {
                await axios.delete(
                    `http://localhost:8080/api/tasks/${task.id}/delete`,
                    {
                        headers: {
                            'Authorization': `Bearer ${user?.token}`
                        }
                    }
                );

                const newTasks = tasks.filter((_, i) => i !== index);
                setTasks(newTasks);
            } catch (err) {
                setError('Ошибка при удалении задания');
                console.error(err);
            }
        } else {
            const newTasks = tasks.filter((_, i) => i !== index);
            setTasks(newTasks);
        }
    };

    const handleTaskFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (e.target.files && e.target.files[0]) {
            setTaskFile(e.target.files[0]);
        }
    };


    const handleCreateGroup = async () => {
        try {
            setLoading(prev => ({ ...prev, submit: true }));
            setError(null);

            const response = await axios.post(
                `http://localhost:8080/api/groups/create`,
                newGroup,
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`
                    }
                }
            );

            // Обновляем список групп
            const groupsResponse = await axios.get(`http://localhost:8080/api/groups/${id}`);
            setGroups(groupsResponse.data);

            setCreateGroupModalOpen(false);
            setNewGroup({
                name: '',
                maxStudentCount: 20,
                courseId: Number(id)
            });
        } catch (err) {
            setError('Ошибка при создании группы');
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    const handleRemoveStudentFromGroup = async (requestId: number) => {
        try {
            setLoading(prev => ({ ...prev, submit: true }));
            setError(null);

            await axios.put(
                `http://localhost:8080/api/requests/${requestId}/group`,
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`
                    }
                }
            );

            // Обновляем список студентов в группе
            if (selectedGroup) {
                const [studentsResponse] = await Promise.all([
                    axios.get(`http://localhost:8080/api/progress/groups/${selectedGroup}/students`),
                ]);
                setStudents(studentsResponse.data);
            }

            setStudents(prev => prev.filter(student => student.requestId !== requestId));
        } catch (err) {
            setError('Ошибка при удалении студента из группы');
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

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

    const handleOpenUploadModal = (studentId: number) => {
        setSelectedStudentId(studentId);
        setUploadModalOpen(true);
        fetchDocumentTypes();
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

    // Загрузка файла
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
                `http://localhost:8080/api/documents/upload/${selectedStudentId}`,
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

    const handleTaskClick = (taskId: number) => {
        setExpandedTasks(prev => {
            const isCurrentlyExpanded = prev[taskId]?.isExpanded || false;

            return {
                ...prev,
                [taskId]: {
                    ...prev[taskId],
                    isExpanded: !isCurrentlyExpanded,
                    solutions: !isCurrentlyExpanded ? [] : prev[taskId]?.solutions || [],
                    loading: !isCurrentlyExpanded,
                    error: null
                }
            };
        });

        if (!expandedTasks[taskId]?.isExpanded) {
            fetchSolutions(taskId);
        }
    };

    const fetchSolutions = async (assignmentId: number) => {
        try {
            setExpandedTasks(prev => ({
                ...prev,
                [assignmentId]: {
                    ...prev[assignmentId],
                    loading: true,
                    error: null
                }
            }));

            const response = await axios.get(
                `http://localhost:8080/api/solutions/${assignmentId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`
                    }
                }
            );

            setExpandedTasks(prev => ({
                ...prev,
                [assignmentId]: {
                    ...prev[assignmentId],
                    solutions: response.data,
                    loading: false
                }
            }));
        } catch (err) {
            setExpandedTasks(prev => ({
                ...prev,
                [assignmentId]: {
                    ...prev[assignmentId],
                    loading: false,
                    error: 'Не удалось загрузить решения'
                }
            }));
            console.error(err);
        }
    };

    const handleGradeSolution = async (solutionId: number, score: number) => {
        try {
            setExpandedTasks(prev => {
                const taskId = Object.keys(prev).find(key =>
                    prev[Number(key)].solutions.some(s => s.id === solutionId)
                );

                if (!taskId) return prev;

                return {
                    ...prev,
                    [taskId]: {
                        ...prev[Number(taskId)],
                        solutions: prev[Number(taskId)].solutions.map(sol =>
                            sol.id === solutionId ? { ...sol, solutionScore: score } : sol
                        )
                    }
                };
            });

            const requestData: GradeSolutionRequest = {
                solutionScore: score
            };

            const response = await axios.put(
                `http://localhost:8080/api/solutions/${solutionId}/grade`,
                requestData,
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

        } catch (err) {
            console.error('Ошибка при оценке решения:', err);
            setExpandedTasks(prev => ({ ...prev }));
            throw err;
        }
    };

    const handleUploadTaskFile = async (taskId: number) => {
        if (!taskFile) return;

        try {
            const formData = new FormData();
            formData.append('file', taskFile);
            formData.append('taskId', taskId.toString());

            await axios.post(
                `http://localhost:8080/api/files/upload/task/${taskId}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`,
                    }
                }
            );

            setTaskFile(null);
            alert('Файл задания успешно загружен!');

        } catch (err) {
            setError('Ошибка при загрузке файла задания');
            console.error(err);
        }
    };

    const handleSaveTask = async (index: number) => {
        const task = tasks[index];

        if (!task.assignmentName || !task.assignmentDescription) {
            setError('Название и описание задания обязательны');
            return;
        }

        try {
            setLoading(prev => ({ ...prev, submit: true }));
            setError(null);

            const requestData = {
                assignmentName: task.assignmentName,
                assignmentDescription: task.assignmentDescription,
                deadline: task.deadline || null,
                courseId: id,
            };
            let savedTask;

            if (task.isNew) {
                const response = await axios.post(
                    `http://localhost:8080/api/assignments/${id}/add`,
                    requestData,
                    {
                        headers: {
                            'Authorization': `Bearer ${user?.token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                savedTask = response.data;
            } else {
                const response = await axios.put(
                    `http://localhost:8080/api/assignments/${task.id}/update`,
                    requestData,
                    {
                        headers: {
                            'Authorization': `Bearer ${user?.token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                savedTask = response.data;
            }

            const newTasks = [...tasks];
            newTasks[index] = { ...savedTask };
            setTasks(newTasks);

            if (taskFile) {
                await handleUploadTaskFile(savedTask.id);
            }

        } catch (err) {
            setError('Ошибка при сохранении задания');
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
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

    const handleRemoveGroup = async (groupId: number) => {
        try {
            await axios.delete(
                `http://localhost:8080/api/groups/${groupId}/delete`,
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`
                    }
                }
            );

            const response = await axios.get(`http://localhost:8080/api/groups/${id}`);
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
                <Tab label="Задания" value="tasks"/>
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
                            <>
                                <Button
                                    variant="contained"
                                    startIcon={<Edit/>}
                                    onClick={() => setEditGroupsMode(true)}
                                >
                                    Управлять группами
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<Group/>}
                                    onClick={() => setCreateGroupModalOpen(true)}
                                    sx={{ml: 2}}
                                >
                                    Создать новую группу
                                </Button>
                            </>
                        )}
                    </Box>

                    <Stack spacing={3}>
                        <Typography variant="h6">Группы курса</Typography>
                        <Divider />

                        {groups.length === 0 ? (
                            <Typography>Нет назначенных групп</Typography>
                        ) : (
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Название группы</TableCell>
                                            {/*<TableCell>Студентов</TableCell>*/}
                                            {/*<TableCell>Статус</TableCell>*/}
                                            {/*{editGroupsMode && isAdmin && <TableCell>Действия</TableCell>}*/}
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
                                                {/*<TableCell>*/}
                                                {/*    {group.studentCount}/{group.maxStudentCount}*/}
                                                {/*</TableCell>*/}
                                                {/*<TableCell>*/}
                                                {/*    <Chip*/}
                                                {/*        label={group.studentCount < group.maxStudentCount ? 'Доступна' : 'Заполнена'}*/}
                                                {/*        color={group.studentCount < group.maxStudentCount ? 'success' : 'error'}*/}
                                                {/*        size="small"*/}
                                                {/*    />*/}
                                                {/*</TableCell>*/}
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
                                                    <TableCell>Документы</TableCell>
                                                    {isAdmin && <TableCell>Действия</TableCell>}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {students.map((student) => {
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
                                                            <TableCell>
                                                                <Button
                                                                    size="small"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleOpenUploadModal(student.requestId);
                                                                    }}
                                                                >
                                                                    Загрузить
                                                                </Button>
                                                            </TableCell>
                                                            {isAdmin && (
                                                                <TableCell>
                                                                    <IconButton
                                                                        color="error"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleRemoveStudentFromGroup(student.requestId);
                                                                        }}
                                                                        disabled={loading.submit}
                                                                    >
                                                                        <Delete />
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
            {activeTab === 'tasks' && (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        {editTasksMode ? (
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="outlined"
                                    startIcon={<Cancel />}
                                    onClick={() => setEditTasksMode(false)}
                                >
                                    Завершить редактирование
                                </Button>
                            </Stack>
                        ) : (
                            <Button
                                variant="contained"
                                startIcon={<Edit />}
                                onClick={() => setEditTasksMode(true)}
                            >
                                Редактировать задания
                            </Button>
                        )}
                    </Box>

                    {editTasksMode ? (
                        <>
                            <Typography variant="h6">Задания курса</Typography>
                            <Divider sx={{ my: 2 }} />

                            {tasks.map((task, index) => (
                                <Paper key={index} elevation={2} sx={{ p: 2, mb: 2 }}>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 2
                                    }}>
                                        <Typography>
                                            {task.isNew ? 'Новое задание' : `Задание ${task.id}`}
                                        </Typography>
                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => handleSaveTask(index)}
                                                disabled={loading.submit || !task.assignmentName || !task.assignmentDescription}
                                                startIcon={loading.submit ? <CircularProgress size={20} /> : <Save />}
                                            >
                                                Сохранить
                                            </Button>
                                            <IconButton
                                                onClick={() => handleRemoveTask(index)}
                                                color="error"
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Stack>
                                    </Box>

                                    <Stack spacing={2}>
                                        <TextField
                                            label="Название задания"
                                            value={task.assignmentName}
                                            onChange={(e) => handleTaskChange(index, 'assignmentName', e.target.value)}
                                            fullWidth
                                            required
                                            error={!task.assignmentName}
                                            helperText={!task.assignmentName ? 'Обязательное поле' : ''}
                                        />

                                        <TextField
                                            label="Описание"
                                            value={task.assignmentDescription}
                                            onChange={(e) => handleTaskChange(index, 'assignmentDescription', e.target.value)}
                                            multiline
                                            rows={4}
                                            fullWidth
                                            required
                                            error={!task.assignmentDescription}
                                            helperText={!task.assignmentDescription ? 'Обязательное поле' : ''}
                                        />

                                        <TextField
                                            label="Срок выполнения"
                                            type="datetime-local"
                                            value={task.deadline || ''}
                                            onChange={(e) => handleTaskChange(index, 'deadline', e.target.value)}
                                            fullWidth
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />

                                        <Box>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Прикрепленный файл:
                                            </Typography>
                                            {task.fileUrl ? (
                                                <Typography>
                                                    <a href={task.fileUrl} target="_blank" rel="noopener noreferrer">
                                                        Скачать файл
                                                    </a>
                                                </Typography>
                                            ) : (
                                                <Typography>Файл не прикреплен</Typography>
                                            )}
                                            <Button
                                                variant="outlined"
                                                component="label"
                                                size="small"
                                                sx={{ mt: 1 }}
                                            >
                                                Заменить файл
                                                <input
                                                    type="file"
                                                    hidden
                                                    onChange={(e) => handleTaskFileChange(e, index)}
                                                />
                                            </Button>
                                            {taskFile && (
                                                <Typography variant="caption" sx={{ ml: 1 }}>
                                                    {taskFile.name}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Stack>
                                </Paper>
                            ))}

                            <Button
                                variant="outlined"
                                startIcon={<Add />}
                                onClick={handleAddTask}
                                sx={{ alignSelf: 'flex-start', mt: 2 }}
                            >
                                Добавить задание
                            </Button>
                        </>
                    ) : (
                        <>
                            <Typography variant="h6">Задания курса</Typography>
                            <Divider sx={{my: 2}}/>

                            {tasks.length === 0 ? (
                                <Typography>Задания курса отсутствуют</Typography>
                            ) : (
                                <List>
                                    {tasks.map((task, index) => (
                                        <Paper key={task.id} elevation={2} sx={{p: 2, mb: 2}}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => task.id && handleTaskClick(task.id)}
                                            >
                                                <Box sx={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                                                    <Box>
                                                        <Typography variant="h6">{task.assignmentName}</Typography>
                                                        <Typography variant="subtitle2" color="text.secondary"
                                                                    gutterBottom>
                                                            {task.deadline && `Срок выполнения: ${new Date(task.deadline).toLocaleString()}`}
                                                        </Typography>
                                                    </Box>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            task.id && handleTaskClick(task.id);
                                                        }}
                                                    >
                                                        {expandedTasks[task.id!]?.isExpanded ? <ExpandLess/> :
                                                            <ExpandMore/>}
                                                    </IconButton>
                                                </Box>
                                            </Box>

                                            <Typography paragraph>{task.assignmentDescription}</Typography>

                                            {/* Добавляем отображение файлов задания */}
                                            <TaskFilesList files={task.files || []} />

                                            {task.id && expandedTasks[task.id]?.isExpanded && (
                                                <Box sx={{ mt: 2 }}>
                                                    <SolutionsTable
                                                        solutions={expandedTasks[task.id].solutions}
                                                        onGradeSolution={handleGradeSolution}
                                                        loading={expandedTasks[task.id].loading}
                                                    />
                                                </Box>
                                            )}
                                        </Paper>
                                    ))}
                                </List>
                            )}
                        </>
                    )}
                </Box>
            )}

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
                        <CircularProgress />
                    ) : (
                        <>
                            <Select
                                value={selectedDocType || ''}
                                onChange={(e) => setSelectedDocType(Number(e.target.value))}
                                displayEmpty
                                fullWidth
                                sx={{ mb: 2 }}
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
                                style={{ marginBottom: '16px' }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    variant="contained"
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
            <Modal open={createGroupModalOpen} onClose={() => setCreateGroupModalOpen(false)}>
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
                        Создать новую группу
                    </Typography>

                    <Stack spacing={2}>
                        <TextField
                            label="Название группы"
                            value={newGroup.name}
                            onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                            fullWidth
                            required
                        />

                        <TextField
                            label="Максимальное количество студентов"
                            type="number"
                            value={newGroup.maxStudentCount}
                            onChange={(e) => setNewGroup({...newGroup, maxStudentCount: Number(e.target.value)})}
                            fullWidth
                            required
                            inputProps={{ min: 1 }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => setCreateGroupModalOpen(false)}
                                sx={{ mr: 2 }}
                            >
                                Отмена
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleCreateGroup}
                                disabled={!newGroup.name || loading.submit}
                            >
                                {loading.submit ? <CircularProgress size={24} /> : 'Создать'}
                            </Button>
                        </Box>
                    </Stack>
                </Box>
            </Modal>
        </Box>
    );
};

export default CourseManagePage;