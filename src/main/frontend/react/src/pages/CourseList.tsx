import React, {useState, useEffect} from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Container,
    CircularProgress,
    Chip,
    Box,
    Button
} from '@mui/material';
import {Link} from 'react-router-dom';
import AppBar from '../components/Layout/AppBar';
import axios from 'axios';

interface CourseShort {
    id: number;
    name: string;
    studyDirection: string;
    startDate: string;
    hoursCount: number;
    status: string;
    description?: string;
}

const CourseList = () => {
    const [courses, setCourses] = useState<CourseShort[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get<CourseShort[]>('http://localhost:8080/api/courses');
                setCourses(response.data);
            } catch (err) {
                setError('Не удалось загрузить список курсов');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (loading) {
        return (
            <Container sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                <CircularProgress/>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{mt: 4, textAlign: 'center'}}>
                <Typography color="error">{error}</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{py: 4}}>
            <Typography variant="h4" component="h1" gutterBottom sx={{mb: 4}}>
                Доступные курсы
            </Typography>

            <Grid container spacing={3}>
                {courses.map((course) => (
                    <Grid
                        key={course.id}
                        component="div"
                    >
                        <Card sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: 4
                            }
                        }}>
                            <CardContent sx={{flexGrow: 1}}>
                                <Typography gutterBottom variant="h5" component="h2">
                                    {course.name}
                                </Typography>

                                <Box sx={{display: 'flex', gap: 1, mb: 2}}>
                                    <Chip label={course.studyDirection} size="small" color="primary"/>
                                    <Chip label={`${course.hoursCount} ч.`} size="small"/>
                                </Box>

                                {course.description && (
                                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                                        {course.description.length > 100
                                            ? `${course.description.substring(0, 100)}...`
                                            : course.description}
                                    </Typography>
                                )}
                            </CardContent>

                            <CardContent sx={{pt: 0}}>
                                <Typography variant="caption" display="block" sx={{mb: 1}}>
                                    Старт: {new Date(course.startDate).toLocaleDateString()}
                                </Typography>
                            </CardContent>

                            <CardContent>
                                <Button
                                    component={Link}
                                    to={`/courses/${course.id}`}
                                    variant="outlined"
                                    fullWidth
                                >
                                    Подробнее
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default CourseList;