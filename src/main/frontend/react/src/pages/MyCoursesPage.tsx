import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Grid,
    Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import {useAuth} from "../components/AuthContext";


interface Course {
    id: number;
    name: string;
    studyDirection: string;
    startDate: string;
    hoursCount: number;
    status: string;
    description?: string;
    progress?: number;

}

// id: number;
// name: string;
// description: string;
// progress: number;
// startDate: string;
// endDate: string;
// status: 'ACTIVE' | 'COMPLETED';

const ActiveCourses = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const {user} = useAuth();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/requests/my-courses', {
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

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (courses.length === 0) return <Alert severity="info">У вас нет активных курсов</Alert>;

    return (
        <Grid container spacing={3}>
            {courses.map((course) => (
                <Grid key={course.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h5" component="h2">
                                    {course.name}
                                </Typography>
                                <Chip
                                    label={course.status === 'ACTIVE' ? 'Активен' : 'Завершен'}
                                    color={course.status === 'ACTIVE' ? 'success' : 'default'}
                                    size="small"
                                />
                            </Box>

                            {/*<Typography color="textSecondary" gutterBottom>*/}
                            {/*    {new Date(course.startDate).toLocaleDateString()} - {new Date(course. endDate).toLocaleDateString()}*/}
                            {/*</Typography>*/}

                            <Typography variant="body2" paragraph sx={{ mt: 1 }}>
                                {course.description}
                            </Typography>

                            <Box sx={{ mt: 2 }}>
                                {/*<Typography display="inline">Прогресс: </Typography>*/}
                                {/*<Typography display="inline" fontWeight="bold">*/}
                                {/*    {course.progress}%*/}
                                {/*</Typography>*/}
                                {/*<Box sx={{ width: '100%', height: 8, bgcolor: '#e0e0e0', mt: 1, borderRadius: 4 }}>*/}
                                {/*    <Box*/}
                                {/*        sx={{*/}
                                {/*            width: `${course.progress}%`,*/}
                                {/*            height: '100%',*/}
                                {/*            bgcolor: course.progress === 100 ? 'success.main' : 'primary.main',*/}
                                {/*            borderRadius: 4*/}
                                {/*        }}*/}
                                {/*    />*/}
                                {/*</Box>*/}
                            </Box>
                        </CardContent>

                        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                            <Button
                                component={Link}
                                to={`/courses/${course.id}`}
                                variant="contained"
                                size="small"
                                disabled={course.status !== 'ACTIVE'}
                            >
                                Продолжить
                                {/*{course.progress > 0 ? 'Продолжить' : 'Начать'}*/}
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default ActiveCourses;