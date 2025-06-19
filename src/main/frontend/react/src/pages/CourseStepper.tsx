import {useState, useEffect} from 'react';
import {
    Stepper,
    Step,
    StepLabel,
    Button,
    Typography,
    Box,
    Paper,
    CircularProgress,
    Alert,
    LinearProgress,
    Tabs,
    Tab,
    ListItem,
    List, Modal, TextField, Card, CardActions, CardContent, Chip, Avatar, Divider, ListItemText
} from '@mui/material';
import {useParams, useNavigate} from 'react-router-dom';
import {useAuth} from '../components/AuthContext';
import {id} from "date-fns/locale";
import axios from "axios";
import {
    Assignment as AssignmentIcon,
    Send as SendIcon,
    AttachFile as AttachFileIcon,
    CheckCircle as CheckCircleIcon,
    Pending as PendingIcon,
    Grade as GradeIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

interface EducationMaterial {
    id: number;
    name: string;
    text: string;
    adding_date: string;
}

interface CourseProgress {
    percent: number;
    educationStartDate: string;
    graduationDate: string | null;
}

interface AttachedFileDto {
    id: number;
    fileName: string;
    filePath: string;
    uploadDate: string;
}

interface Assignment {
    id: number;
    assignmentName: string;
    assignmentDescription: string;
    deadline: string | null;
    courseId: number;
    solutions: Solution[];
    attachedFiles?: AttachedFileDto[];
}

interface Solution {
    id: number;
    sendingDate: string;
    solutionComment: string;
    solutionScore: number | null;
    studentId: number;
    assignmentId: number;
    statusId: number;
}

interface AssignmentWithSolutions extends Assignment {
    solutions: Solution[];
}

const CourseStepper = () => {
    const {courseId} = useParams<{ courseId: string }>();
    const {user} = useAuth();
    const navigate = useNavigate();

    const [activeStep, setActiveStep] = useState(0);
    const [materials, setMaterials] = useState<EducationMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
    const [isSavingProgress, setIsSavingProgress] = useState(false);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('materials');

    const [solutionModalOpen, setSolutionModalOpen] = useState(false);
    const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);
    const [solutionComment, setSolutionComment] = useState('');
    const [solutionFile, setSolutionFile] = useState<File | null>(null);

    const handleAddSolution = (assignment: Assignment) => {
        setCurrentAssignment(assignment);
        setSolutionModalOpen(true);
    };

    const assignmentCardStyle = {
        borderRadius: 2,
        width: '100%',
        minWidth: 1100,
        maxWidth: 'none',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.15)'
        }
    };

    const statusChipStyle = (statusId: number) => ({
        ml: 1,
        backgroundColor: statusId === 2 ? '#4caf50' : statusId === 3 ? '#f44336' : '#ff9800',
        color: 'white'
    });

    const calculateProgress = () => {
        const totalMaterials = materials.length;
        const totalAssignments = assignments.length;
        const totalItems = totalMaterials + totalAssignments;

        if (totalItems === 0) return 0;

        let completed = 0;

        completed += materials.length; // или другая логика для материалов

        // Учитываем выполненные задания
        assignments.forEach(assignment => {
            if (assignment.solutions?.some(s => s.solutionScore !== null)) {
                completed++;
            }
        });

        return Math.round((completed / totalItems) * 100);
    };

    const fetchAssignments = async () => {
        try {
            setLoadingAssignments(true);

            const assignmentsResponse = await axios.get<Assignment[]>(
                `http://localhost:8080/api/assignments/${courseId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`
                    }
                }
            );

            // Загружаем прикрепленные файлы для каждого задания
            const assignmentsWithFiles = await Promise.all(
                assignmentsResponse.data.map(async assignment => {
                    try {
                        const filesResponse = await axios.get<AttachedFileDto[]>(
                            `http://localhost:8080/api/files/assignment/${assignment.id}`,
                            {
                                headers: {
                                    'Authorization': `Bearer ${user?.token}`
                                }
                            }
                        );
                        return {
                            ...assignment,
                            attachedFiles: filesResponse.data
                        };
                    } catch (err) {
                        console.error(`Ошибка при загрузке файлов для задания ${assignment.id}:`, err);
                        return {
                            ...assignment,
                            attachedFiles: []
                        };
                    }
                })
            );

            // 2. Загружаем решения текущего пользователя
            const solutionsResponse = await axios.get<Solution[]>(
                `http://localhost:8080/api/solutions/my`,
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`
                    }
                }
            );

            const assignmentsWithSolutions: AssignmentWithSolutions[] = assignmentsWithFiles.map(assignment => {
                const assignmentSolutions = solutionsResponse.data.filter(
                    solution => solution.assignmentId === assignment.id
                );
                return {
                    ...assignment,
                    solutions: assignmentSolutions
                };
            });

            setAssignments(assignmentsWithSolutions);
        } catch (err) {
            console.error('Ошибка при загрузке данных:', err);
            setError('Не удалось загрузить задания');
        } finally {
            setLoadingAssignments(false);
        }
    };

    useEffect(() => {
        if (id && user?.token) {
            fetchAssignments();
        }
    }, [id, user?.token]);

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

    // Отправка решения
    const submitSolution = async () => {
        if (!currentAssignment || !solutionComment) {
            setError('Заполните текст решения');
            return;
        }

        try {
            const solutionData = {
                solutionComment: solutionComment,
                assignmentId: currentAssignment.id
            };

            const response = await axios.post(
                `http://localhost:8080/api/solutions/add`,
                solutionData,
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Обновляем список решений
            const updatedSolutions = await fetchAssignmentSolutions(currentAssignment.id);
            setAssignments(prev =>
                prev.map(a =>
                    a.id === currentAssignment.id
                        ? {...a, solutions: updatedSolutions}
                        : a
                )
            );

            setSolutionModalOpen(false);
            setSolutionComment('');
            setSolutionFile(null);
        } catch (err) {
            setError('Ошибка при отправке решения');
            console.error(err);
        }
    };

    // Получение решений для задания
    const fetchAssignmentSolutions = async (assignmentId: number): Promise<Solution[]> => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/assignments/${assignmentId}/solutions`,
                {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`
                    }
                }
            );
            return response.data;
        } catch (err) {
            console.error('Ошибка при загрузке решений:', err);
            return [];
        }
    };

    // Загрузка данных
    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading(true);
                const [materialsResponse, progressResponse] = await Promise.all([
                    fetch(`http://localhost:8080/api/material/${courseId}`, {
                        headers: {'Authorization': `Bearer ${user?.token}`}
                    }),
                    fetch(`http://localhost:8080/api/progress/${courseId}`, {
                        headers: {'Authorization': `Bearer ${user?.token}`}
                    })
                ]);

                if (!materialsResponse.ok) throw new Error('Ошибка загрузки материалов');
                const materialsData = await materialsResponse.json();
                setMaterials(materialsData);

                if (progressResponse.ok) {
                    const progressData = await progressResponse.json();
                    setCourseProgress(progressData);
                    // Инициализация пройденных шагов из БД
                    const completedFromServer = progressData.completedSteps || [];
                    setCompletedSteps(completedFromServer);
                    // Установка активного шага как последнего пройденного или первого
                    setActiveStep(
                        completedFromServer.length > 0
                            ? Math.min(Math.max(...completedFromServer) + 1, materialsData.length - 1)
                            : 0
                    );
                } else {
                    setCourseProgress({
                        percent: 0,
                        educationStartDate: new Date().toISOString(),
                        graduationDate: null
                    });
                    setCompletedSteps([]);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
            } finally {
                setLoading(false);
            }
        };
        fetchCourseData();
    }, [courseId, user?.token]);

    const updateProgress = async (newCompletedSteps: number[]) => {
        try {
            setIsSavingProgress(true);
            // Уникальные пройденные шаги
            const uniqueCompleted = Array.from(new Set(newCompletedSteps));
            const percent = Math.floor((uniqueCompleted.length / materials.length) * 100);

            const response = await fetch('http://localhost:8080/api/progress', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    courseId: parseInt(courseId || '0'),
                    percent: Math.min(percent, 100),
                    completedSteps: uniqueCompleted
                })
            });

            if (!response.ok) throw new Error('Ошибка сохранения прогресса');

            setCourseProgress(prev => ({
                ...prev!,
                percent: Math.min(percent, 100),
                graduationDate: percent >= 100 ? new Date().toISOString() : prev?.graduationDate || null
            }));

            return uniqueCompleted;
        } catch (err) {
            console.error('Ошибка сохранения прогресса:', err);
            throw err;
        } finally {
            setIsSavingProgress(false);
        }
    };

    const handleNext = async () => {
        // Добавляем текущий шаг в пройденные только если он еще не пройден
        if (!completedSteps.includes(activeStep)) {
            const newCompleted = [...completedSteps, activeStep];
            const updatedCompleted = await updateProgress(newCompleted);
            setCompletedSteps(updatedCompleted);
        }

        // Переход на следующий шаг если не последний
        if (activeStep < materials.length - 1) {
            setActiveStep(prev => prev + 1);
        } else {
            navigate('/courses', {state: {courseCompleted: true}});
        }
    };

    const handleBack = () => {
        setActiveStep(prev => Math.max(prev - 1, 0));
    };

    if (loading) return <CircularProgress/>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (materials.length === 0) return <Alert severity="info">Материалы курса не найдены</Alert>;

    const currentProgress = courseProgress?.percent || 0;
    const isCourseCompleted = currentProgress === 100;

    return (
        <Box sx={{display: 'flex', height: 'calc(100vh - 64px)'}}>
            {/* Боковая панель  */}
            <Paper elevation={3} sx={{width: 300, p: 2, overflowY: 'auto', borderRadius: 0}}>
                <Typography variant="h6" sx={{mb: 2}}>Содержание курса</Typography>
                <Stepper activeStep={activeStep} orientation="vertical">
                    {materials.map((material, index) => (
                        <Step key={material.id} completed={completedSteps.includes(index)}>
                            <StepLabel>
                                <Typography variant="subtitle1">{material.name}</Typography>
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Paper>

            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                <Tab label="Материалы" value="materials"/>
                <Tab label="Задания" value="assignments"/>
            </Tabs>

            {activeTab === 'materials' && (
                <Box sx={{flex: 1, p: 4, overflowY: 'auto', display: 'flex', flexDirection: 'column'}}>
                    <Box sx={{mb: 4}}>
                        <Typography variant="h4" gutterBottom>
                            {materials[activeStep]?.name}
                        </Typography>
                        <Box sx={{mb: 3}}>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                <Typography variant="body1">
                                    Прогресс: {currentProgress}%
                                </Typography>
                                {isCourseCompleted && (
                                    <Typography color="success.main">
                                        Курс завершен {new Date(courseProgress!.graduationDate!).toLocaleDateString()}
                                    </Typography>
                                )}
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={currentProgress}
                                sx={{height: 10, borderRadius: 5}}
                            />
                        </Box>
                    </Box>

                    <Paper elevation={2} sx={{p: 4, mb: 3, flex: 1}}>
                        <Typography variant="body1" whiteSpace="pre-wrap">
                            {materials[activeStep]?.text}
                        </Typography>
                    </Paper>

                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        pt: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider'
                    }}>
                        <Button
                            disabled={activeStep === 0 || isSavingProgress}
                            onClick={handleBack}
                            variant="outlined"
                            sx={{width: 120}}
                        >
                            Назад
                        </Button>

                        {activeStep === materials.length - 1 ? (
                            <Button
                                onClick={handleNext}
                                variant="contained"
                                color="success"
                                disabled={isSavingProgress}
                                sx={{width: 200}}
                            >
                                {isCourseCompleted ? 'Курс завершен' : 'Завершить курс'}
                                {isSavingProgress && <CircularProgress size={24} sx={{ml: 1}}/>}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                variant="contained"
                                disabled={isSavingProgress}
                                sx={{width: 120}}
                            >
                                Далее
                                {isSavingProgress && <CircularProgress size={24} sx={{ml: 1}}/>}
                            </Button>
                        )}
                    </Box>
                </Box>
            )}

            {activeTab === 'assignments' && (
                <Box sx={{p: 3, maxWidth: 1700, margin: '0'}}>
                    <Typography variant="h4" gutterBottom sx={{fontWeight: 600}}>
                        Задания курса
                    </Typography>

                    {loadingAssignments ? (
                        <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                            <CircularProgress size={60}/>
                        </Box>
                    ) : error ? (
                        <Alert severity="error" sx={{mb: 3}}>
                            {error}
                        </Alert>
                    ) : assignments.length === 0 ? (
                        <Paper sx={{p: 3, textAlign: 'center'}}>
                            <Typography variant="h6" color="text.secondary">
                                Пока нет заданий для этого курса
                            </Typography>
                        </Paper>
                    ) : (
                        assignments.map(assignment => (
                            <Card key={assignment.id} sx={assignmentCardStyle}>
                                <CardContent>
                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                        <AssignmentIcon color="primary" sx={{mr: 1}}/>
                                        <Typography variant="h6" sx={{fontWeight: 600}}>
                                            {assignment.assignmentName}
                                        </Typography>

                                        {assignment.deadline && (
                                            <Chip
                                                label={`До ${new Date(assignment.deadline).toLocaleDateString()}`}
                                                color={new Date(assignment.deadline) < new Date() ? 'error' : 'primary'}
                                                sx={{ml: 2}}
                                            />
                                        )}
                                    </Box>

                                    <Typography variant="body1" paragraph sx={{color: 'text.secondary'}}>
                                        {assignment.assignmentDescription}
                                    </Typography>

                                    {/* Отображение прикрепленных файлов */}
                                    {assignment.attachedFiles && assignment.attachedFiles.length > 0 && (
                                        <Box sx={{mb: 2}}>
                                            <Typography variant="subtitle2" sx={{mb: 1, fontWeight: 500}}>
                                                Прикрепленные файлы:
                                            </Typography>
                                            <List sx={{bgcolor: 'action.hover', borderRadius: 1}}>
                                                {assignment.attachedFiles.map(file => (
                                                    <ListItem
                                                        key={file.id}
                                                        sx={{py: 1, cursor: 'pointer'}}
                                                        onClick={() => downloadFile(file.fileName)}
                                                    >
                                                        
                                                        <ListItemText
                                                            primary={file.fileName.split('_').pop()}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    )}

                                    <Divider sx={{my: 2}}/>

                                    {assignment.solutions?.length > 0 ? (
                                        <Box>
                                            <Typography variant="subtitle2" sx={{mb: 1, fontWeight: 500}}>
                                                Ваши решения:
                                            </Typography>
                                            <List sx={{bgcolor: 'action.hover', borderRadius: 1}}>
                                                {assignment.solutions.map(solution => (
                                                    <ListItem key={solution.id} sx={{py: 2}}>
                                                        <Box sx={{width: '100%'}}>
                                                            <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                                                <Typography variant="body2">
                                                                    Отправлено: {new Date(solution.sendingDate).toLocaleString()}
                                                                </Typography>
                                                                <Chip
                                                                    label={solution.solutionScore !== null ?
                                                                        `Оценка: ${solution.solutionScore}/100` : 'На проверке'}
                                                                    sx={statusChipStyle(solution.statusId)}
                                                                    size="small"
                                                                />
                                                            </Box>

                                                            {solution.solutionComment && (
                                                                <Paper
                                                                    sx={{p: 2, mt: 1, bgcolor: 'background.default'}}>
                                                                    <Typography variant="body2">
                                                                        {solution.solutionComment}
                                                                    </Typography>
                                                                </Paper>
                                                            )}
                                                        </Box>
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{fontStyle: 'italic'}}>
                                            Вы еще не отправляли решение для этого задания
                                        </Typography>
                                    )}
                                </CardContent>

                                <CardActions sx={{justifyContent: 'flex-end', p: 2}}>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleAddSolution(assignment)}
                                        sx={{borderRadius: 2}}
                                    >
                                        {assignment.solutions?.length ? 'Отправить новое решение' : 'Отправить решение'}
                                    </Button>
                                </CardActions>
                            </Card>
                        ))
                    )}
                    <Modal open={solutionModalOpen} onClose={() => setSolutionModalOpen(false)}>
                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: {xs: '90%', sm: 600},
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            borderRadius: 2,
                            p: 4,
                            outline: 'none'
                        }}>
                            <Typography variant="h5" gutterBottom sx={{fontWeight: 600}}>
                                Отправить решение
                            </Typography>
                            <Typography variant="subtitle1" color="primary" gutterBottom>
                                {currentAssignment?.assignmentName}
                            </Typography>

                            <TextField
                                label="Текст решения"
                                multiline
                                rows={4}
                                fullWidth
                                value={solutionComment}
                                onChange={(e) => setSolutionComment(e.target.value)}
                                sx={{mt: 2, mb: 3}}
                                variant="outlined"
                            />

                            <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                                <Button
                                    onClick={() => setSolutionModalOpen(false)}
                                    sx={{mr: 2}}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={submitSolution}
                                    disabled={!solutionComment}
                                    sx={{px: 3}}
                                >
                                    Отправить
                                </Button>
                            </Box>
                        </Box>
                    </Modal>
                </Box>
            )}
        </Box>
    );
};
export default CourseStepper;