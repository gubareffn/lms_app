import { useState, useEffect } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Button,
    Paper,
    CircularProgress,
    Card,
    CardContent,
    CardActions,
    Chip,
    Alert, Grid
} from '@mui/material';
import { Add, Book, Group, Assignment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

interface Course {
    id: number;
    name: string;
    studyDirection: string;
    status: string;
    studentCount: number;
}

const TeachingPage = () => {
    const [activeTab, setActiveTab] = useState('my-courses');
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (activeTab === 'my-courses') {
            fetchTeacherCourses();
        }
    }, [activeTab]);

    const fetchTeacherCourses = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://localhost:8080/api/courses/my', {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });

            if (!response.ok) throw new Error('Ошибка загрузки курсов');

            const data = await response.json();
            setCourses(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCourse = () => {
        navigate('/teaching/create-course');
    };

    const handleCourseClick = (courseId: number) => {
        navigate(`/courses/${courseId}/manage`);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
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
                            selected={activeTab === 'my-courses'}
                            onClick={() => setActiveTab('my-courses')}
                        >
                            <ListItemIcon>
                                <Book />
                            </ListItemIcon>
                            <ListItemText primary="Мои курсы" />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton
                            selected={activeTab === 'students'}
                            onClick={() => setActiveTab('students')}
                        >
                            <ListItemIcon>
                                <Group />
                            </ListItemIcon>
                            <ListItemText primary="Студенты" />
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
                            <ListItemText primary="Задания" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Paper>

            {/* Основное содержимое */}
            <Box sx={{ flex: 1, p: 4 }}>
                {activeTab === 'my-courses' && (
                    <>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 4
                        }}>
                            <Typography variant="h4">Мои курсы</Typography>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleAddCourse}
                            >
                                Добавить курс
                            </Button>
                        </Box>

                        {loading && <CircularProgress />}

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        {!loading && !error && courses.length === 0 && (
                            <Paper sx={{ p: 4, textAlign: 'center' }}>
                                <Typography variant="h6" gutterBottom>
                                    У вас пока нет курсов
                                </Typography>
                                <Typography sx={{ mb: 3 }}>
                                    Создайте свой первый курс, нажав кнопку "Добавить курс"
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={handleAddCourse}
                                >
                                    Создать курс
                                </Button>
                            </Paper>
                        )}

                        <Grid container spacing={3}>
                            {courses.map((course) => (
                                <Grid key={course.id}>
                                    <Card
                                        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                                        onClick={() => handleCourseClick(course.id)}
                                    >
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography variant="h5" gutterBottom>
                                                {course.name}
                                            </Typography>
                                            <Chip
                                                label={course.studyDirection}
                                                color="primary"
                                                size="small"
                                                sx={{ mb: 2 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Статус: {course.status}
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                                            <Typography variant="body2">
                                                Студентов: {course.studentCount}
                                            </Typography>
                                            <Button size="small">Управление</Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </>
                )}

                {activeTab === 'students' && (
                    <Typography variant="h4" sx={{ mb: 3 }}>
                        Управление студентами
                    </Typography>
                )}

                {activeTab === 'assignments' && (
                    <Typography variant="h4" sx={{ mb: 3 }}>
                        Задания и материалы
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default TeachingPage;