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
    Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

interface EducationMaterial {
    id: number;
    name: string;
    text: string;
    adding_date: string;
}

const CourseStepper = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [materials, setMaterials] = useState<EducationMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Загрузка материалов курса
    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/material/${courseId}`, {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Ошибка загрузки материалов курса');
                }

                const data = await response.json();
                setMaterials(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
            } finally {
                setLoading(false);
            }
        };

        fetchMaterials();
    }, [courseId, user?.token]);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleComplete = () => {
        // Логика завершения курса
        navigate('/courses');
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (materials.length === 0) return <Alert severity="info">Материалы курса не найдены</Alert>;

    return (
        <Box sx={{ maxWidth: 800, margin: '0 auto', p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Прохождение курса
            </Typography>

            <Stepper activeStep={activeStep} orientation="vertical">
                {materials.map((material, index) => (
                    <Step key={material.id}>
                        <StepLabel>{material.name}</StepLabel>
                        {activeStep === index && (
                            <Box sx={{ p: 2 }}>
                                <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
                                    <Typography variant="body1" whiteSpace="pre-wrap">
                                        {material.text}
                                    </Typography>
                                </Paper>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Button
                                        disabled={activeStep === 0}
                                        onClick={handleBack}
                                        variant="outlined"
                                    >
                                        Назад
                                    </Button>

                                    {activeStep === materials.length - 1 ? (
                                        <Button
                                            onClick={handleComplete}
                                            variant="contained"
                                            color="success"
                                        >
                                            Завершить курс
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleNext}
                                            variant="contained"
                                        >
                                            Далее
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