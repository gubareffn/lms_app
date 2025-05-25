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

    // Загрузка материалов курса и прогресса
    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading(true);

                // Параллельная загрузка материалов и прогресса
                const [materialsResponse, progressResponse] = await Promise.all([
                    fetch(`http://localhost:8080/api/material/${courseId}`, {
                        headers: {
                            'Authorization': `Bearer ${user?.token}`
                        }
                    }),
                    fetch(`http://localhost:8080/api/progress/${courseId}`, {
                        headers: {
                            'Authorization': `Bearer ${user?.token}`
                        }
                    })
                ]);

                if (!materialsResponse.ok) throw new Error('Ошибка загрузки материалов');
                if (!progressResponse.ok && progressResponse.status !== 404) {
                    throw new Error('Ошибка загрузки прогресса');
                }

                const materialsData = await materialsResponse.json();
                setMaterials(materialsData);

                if (progressResponse.status === 200) {
                    const progressData = await progressResponse.json();
                    setCourseProgress(progressData);

                    // Устанавливаем активный шаг на основе прогресса
                    if (materialsData.length > 0) {
                        const calculatedStep = Math.floor((progressData.percent / 100) * materialsData.length);
                        setActiveStep(Math.min(calculatedStep, materialsData.length - 1));
                    }
                } else {
                    setCourseProgress({
                        percent: 0,
                        educationStartDate: new Date().toISOString(),
                        graduationDate: null
                    });
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [courseId, user?.token]);

    // Обновление прогресса при изменении активного шага
    useEffect(() => {
        if (materials.length === 0 || !courseProgress) return;

        const newPercent = Math.floor(((activeStep + 1) / materials.length) * 100);
        if (newPercent > courseProgress.percent) {
            updateProgress(newPercent);
        }
    }, [activeStep, materials.length]);

    const updateProgress = async (percent: number) => {
        try {
            setIsSavingProgress(true);
            const response = await fetch('http://localhost:8080/api/progress', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    courseId: parseInt(courseId || '0'),
                    percent: percent
                })
            });

            if (!response.ok) throw new Error('Ошибка сохранения прогресса');

            setCourseProgress(prev => ({
                ...prev!,
                percent: percent,
                graduationDate: percent === 100 ? new Date().toISOString() : prev?.graduationDate || null
            }));
        } catch (err) {
            console.error('Ошибка сохранения прогресса:', err);
        } finally {
            setIsSavingProgress(false);
        }
    };

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleCompleteCourse = async () => {
        await updateProgress(100);
        navigate('/courses', { state: { courseCompleted: true } });
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (materials.length === 0) return <Alert severity="info">Материалы курса не найдены</Alert>;

    const currentProgress = courseProgress?.percent || 0;
    const isCourseCompleted = currentProgress === 100;

    return (
        <Box sx={{ maxWidth: 800, margin: '0 auto', p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Прохождение курса
            </Typography>

            {courseProgress && (
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1">
                            Прогресс: {currentProgress}%
                        </Typography>
                        {isCourseCompleted && (
                            <Typography color="success.main">
                                Курс завершен {new Date(courseProgress.graduationDate!).toLocaleDateString()}
                            </Typography>
                        )}
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={currentProgress}
                        sx={{ height: 10, borderRadius: 5 }}
                    />
                </Box>
            )}

            <Stepper activeStep={activeStep} orientation="vertical">
                {materials.map((material, index) => (
                    <Step key={material.id} completed={index < activeStep}>
                        <StepLabel>
                            <Typography variant="h6">{material.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                Добавлен: {new Date(material.adding_date).toLocaleDateString()}
                            </Typography>
                        </StepLabel>

                        {activeStep === index && (
                            <Box sx={{ p: 2 }}>
                                <Paper elevation={3} sx={{ p: 3, mb: 2, minHeight: 200 }}>
                                    <Typography variant="body1" whiteSpace="pre-wrap">
                                        {material.text}
                                    </Typography>
                                </Paper>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Button
                                        disabled={activeStep === 0 || isSavingProgress}
                                        onClick={handleBack}
                                        variant="outlined"
                                        sx={{ mr: 2 }}
                                    >
                                        Назад
                                    </Button>

                                    {activeStep === materials.length - 1 ? (
                                        <Button
                                            onClick={handleCompleteCourse}
                                            variant="contained"
                                            color="success"
                                            disabled={isSavingProgress}
                                        >
                                            {isCourseCompleted ? 'Курс завершен' : 'Завершить курс'}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleNext}
                                            variant="contained"
                                            disabled={isSavingProgress}
                                        >
                                            Далее
                                            {isSavingProgress && (
                                                <CircularProgress size={24} sx={{ ml: 1 }} />
                                            )}
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        )}
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
};

export default CourseStepper;