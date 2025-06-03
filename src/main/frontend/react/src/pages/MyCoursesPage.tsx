import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Chip,
    useTheme,
    Divider,
    CardActions, Paper, LinearProgress
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from "../components/AuthContext";
import { School } from '@mui/icons-material';

interface Course {
    courseId: number;
    name: string;
    studyDirection: string;
    courseStartDate: string;
    hoursCount: number;
    status: string;
    description?: string;
    percent: number;
    statusName: string;
}

const ActiveCourses = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const theme = useTheme();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/progress/my-courses', {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Ошибка загрузки курсов');
                }

                const data = await response.json();
                setCourses(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [user?.token]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 3 }}>
                {error}
            </Alert>
        );
    }

    if (courses.length === 0) {
        return (
            <Paper sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 3,
                backgroundColor: theme.palette.background.paper,
                maxWidth: 600,
                mx: 'auto'
            }}>
                <School sx={{
                    fontSize: 60,
                    color: theme.palette.grey[400],
                    mb: 2
                }} />
                <Typography variant="h6" gutterBottom>
                    У вас нет активных курсов
                </Typography>
                <Typography color="text.secondary">
                    Запишитесь на курс, чтобы начать обучение
                </Typography>
            </Paper>
        );
    }

    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
                xl: 'repeat(5, 1fr)'
            },
            gap: 3,
            width: '100%'
        }}>
            {courses.map((course) => (
                <Card
                    key={course.courseId}
                    sx={{
                        borderRadius: 3,
                        boxShadow: theme.shadows[1],
                        transition: 'transform 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: theme.shadows[4],
                            cursor: 'pointer'
                        },
                        borderTop: `4px solid ${
                            course.statusName === 'Завершено'
                                ? theme.palette.success.main
                                : theme.palette.grey[500]
                        }`
                    }}
                >
                    <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mb: 2
                        }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    flex: 1,
                                    mr: 1
                                }}
                            >
                                {course.name}
                            </Typography>

                        </Box>

                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 'auto'
                        }}>
                            <Typography variant="caption" color="text.secondary">
                                {new Date(course.courseStartDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                часов: {course.hoursCount}
                            </Typography>
                        </Box>

                        <Box sx={{width: '100%', mr: 1}}>
                            <LinearProgress
                                variant="determinate"
                                value={course.percent}
                            />
                        </Box>
                        <Typography variant="body2">
                            Прогресс: {Math.round(course.percent)} %
                        </Typography>
                    </CardContent>

                    <Divider sx={{ mx: 2 }} />

                    <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                        <Button
                            component={course.percent === 100 ? 'div' : Link}
                            to={`/courses/materials/${course.courseId}`}
                            variant="contained"
                            size="small"
                            disabled={course.percent === 100}
                            sx={{
                                borderRadius: '8px',
                                px: 2,
                                textTransform: 'none',
                                fontWeight: 'medium',
                                backgroundColor: course.percent === 100
                                    ? theme.palette.grey[300]
                                    : theme.palette.primary.main,
                                color: course.percent === 100
                                    ? theme.palette.text.secondary
                                    : theme.palette.primary.contrastText,
                                '&:hover': {
                                    backgroundColor: course.percent === 100
                                        ? theme.palette.grey[300]
                                        : theme.palette.primary.dark
                                }
                            }}
                        >
                            {course.percent === 100 ? 'Завершено' :
                                course.percent && course.percent > 0 ? 'Продолжить' : 'Начать'}
                        </Button>
                    </CardActions>
                </Card>
            ))}
        </Box>
    );
};

export default ActiveCourses;