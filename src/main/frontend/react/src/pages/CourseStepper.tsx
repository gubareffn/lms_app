import { useState, useEffect } from 'react';
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
    LinearProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

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

const CourseStepper = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [activeStep, setActiveStep] = useState(0);
    const [materials, setMaterials] = useState<EducationMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
    const [isSavingProgress, setIsSavingProgress] = useState(false);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    // Загрузка данных
    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading(true);
                const [materialsResponse, progressResponse] = await Promise.all([
                    fetch(`http://localhost:8080/api/material/${courseId}`, {
                        headers: { 'Authorization': `Bearer ${user?.token}` }
                    }),
                    fetch(`http://localhost:8080/api/progress/${courseId}`, {
                        headers: { 'Authorization': `Bearer ${user?.token}` }
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
                    percent: Math.min(percent, 100), // Гарантируем не более 100%
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
            navigate('/courses', { state: { courseCompleted: true } });
        }
    };

    const handleBack = () => {
        setActiveStep(prev => Math.max(prev - 1, 0));
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (materials.length === 0) return <Alert severity="info">Материалы курса не найдены</Alert>;

    const currentProgress = courseProgress?.percent || 0;
    const isCourseCompleted = currentProgress === 100;

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
            {/* Боковая панель (не кликабельная) */}
            <Paper elevation={3} sx={{ width: 300, p: 2, overflowY: 'auto', borderRadius: 0 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Содержание курса</Typography>
                <Stepper activeStep={activeStep} orientation="vertical">
                    {materials.map((material, index) => (
                        <Step key={material.id} completed={completedSteps.includes(index)}>
                            <StepLabel>
                                <Typography variant="subtitle1">{material.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(material.adding_date).toLocaleDateString()}
                                </Typography>
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Paper>

            {/* Основное содержимое */}
            <Box sx={{ flex: 1, p: 4, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        {materials[activeStep]?.name}
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
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
                            sx={{ height: 10, borderRadius: 5 }}
                        />
                    </Box>
                </Box>

                <Paper elevation={2} sx={{ p: 4, mb: 3, flex: 1 }}>
                    <Typography variant="body1" whiteSpace="pre-wrap">
                        {materials[activeStep]?.text}
                    </Typography>
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button
                        disabled={activeStep === 0 || isSavingProgress}
                        onClick={handleBack}
                        variant="outlined"
                        sx={{ width: 120 }}
                    >
                        Назад
                    </Button>

                    {activeStep === materials.length - 1 ? (
                        <Button
                            onClick={handleNext}
                            variant="contained"
                            color="success"
                            disabled={isSavingProgress}
                            sx={{ width: 200 }}
                        >
                            {isCourseCompleted ? 'Курс завершен' : 'Завершить курс'}
                            {isSavingProgress && <CircularProgress size={24} sx={{ ml: 1 }} />}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            variant="contained"
                            disabled={isSavingProgress}
                            sx={{ width: 120 }}
                        >
                            Далее
                            {isSavingProgress && <CircularProgress size={24} sx={{ ml: 1 }} />}
                        </Button>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default CourseStepper;