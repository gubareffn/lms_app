import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Container,
    CircularProgress,
    Chip,
    Button,
    TextField,
    MenuItem,
    InputAdornment,
    Divider,
    useTheme
} from '@mui/material';
import { Add, Search, FilterList, School } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

interface Course {
    id: number;
    name: string;
    studyDirection: string;
    status: string;
    startDate: string;
    hoursCount: number;
    description?: string;
}

const TeachingPage = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState({
        direction: '',
        status: ''
    });
    const { user } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();

    const studyDirections = Array.from(new Set(courses.map(course => course.studyDirection)));
    const statusOptions = Array.from(new Set(courses.map(course => course.status)));

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/courses/my', {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`
                    }
                });
                const data = await response.json();
                setCourses(data);
                setFilteredCourses(data);
            } catch (err) {
                setError('Не удалось загрузить список курсов');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [user?.token]);

    useEffect(() => {
        let result = courses.filter(course => {
            const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.description?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesDirection = filter.direction ? course.studyDirection === filter.direction : true;
            const matchesStatus = filter.status ? course.status === filter.status : true;

            return matchesSearch && matchesDirection && matchesStatus;
        });

        setFilteredCourses(result);
    }, [searchTerm, filter, courses]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter({
            ...filter,
            [e.target.name]: e.target.value
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilter({
            direction: '',
            status: ''
        });
    };

    const handleAddCourse = () => {
        navigate('/teaching/create-course');
    };

    const handleCourseClick = (courseId: number) => {
        navigate(`/courses/${courseId}/manage`);
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress size={60} />
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4, textAlign: 'center' }}>
                <Typography color="error" variant="h5">{error}</Typography>
                <Button variant="outlined" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
                    Попробовать снова
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                    Мои курсы
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAddCourse}
                    sx={{
                        borderRadius: '8px',
                        px: 3,
                        fontWeight: 'medium'
                    }}
                >
                    Добавить курс
                </Button>
            </Box>

            <Box sx={{ mb: 4 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Поиск по моим курсам..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mb: 3 }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <FilterList color="action" />
                    <TextField
                        select
                        label="Направление"
                        name="direction"
                        value={filter.direction}
                        onChange={handleFilterChange}
                        sx={{ minWidth: 200 }}
                        size="small"
                    >
                        <MenuItem value="">Все направления</MenuItem>
                        {studyDirections.map((direction) => (
                            <MenuItem key={direction} value={direction}>
                                {direction}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Статус"
                        name="status"
                        value={filter.status}
                        onChange={handleFilterChange}
                        sx={{ minWidth: 200 }}
                        size="small"
                    >
                        <MenuItem value="">Все статусы</MenuItem>
                        {statusOptions.map((status) => (
                            <MenuItem key={status} value={status}>
                                {status}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Button
                        variant="outlined"
                        onClick={clearFilters}
                        sx={{ ml: 'auto' }}
                    >
                        Сбросить
                    </Button>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Typography variant="subtitle1" color="text.secondary">
                    Найдено курсов: {filteredCourses.length}
                </Typography>
            </Box>

            {filteredCourses.length > 0 ? (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(3, 1fr)',
                            lg: 'repeat(4, 1fr)'
                        },
                        gap: 3
                    }}
                >
                    {filteredCourses.map((course) => (
                        <Card
                            key={course.id}
                            onClick={() => handleCourseClick(course.id)}
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: 4,
                                    cursor: 'pointer'
                                },
                                borderLeft: `4px solid ${
                                    course.status === 'Идёт набор' ? theme.palette.success.main :
                                        course.status === 'Завершен' ? theme.palette.warning.main :
                                            theme.palette.error.main
                                }`
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                                    {course.name}
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                    <Chip
                                        label={course.studyDirection}
                                        size="small"
                                        color="primary"
                                        sx={{ fontWeight: 500 }}
                                    />
                                    <Chip
                                        label={`${course.hoursCount} ч.`}
                                        size="small"
                                        variant="outlined"
                                    />
                                    <Chip
                                        label={course.status}
                                        size="small"
                                        sx={{
                                            backgroundColor:
                                                course.status === 'Идёт набор' ? theme.palette.success.light :
                                                    course.status === 'Завершен' ? theme.palette.warning.light :
                                                        theme.palette.error.light,
                                            color:
                                                course.status === 'Идёт набор' ? theme.palette.success.dark :
                                                    course.status === 'Завершен' ? theme.palette.warning.dark :
                                                        theme.palette.error.dark,
                                            fontWeight: 500
                                        }}
                                    />
                                </Box>

                                {course.description && (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            mb: 2,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {course.description}
                                    </Typography>
                                )}
                            </CardContent>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, pb: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Старт: {new Date(course.startDate).toLocaleDateString()}
                                </Typography>
                            </Box>

                            <CardContent sx={{ pt: 0 }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        backgroundColor: theme.palette.primary.main,
                                        '&:hover': {
                                            backgroundColor: theme.palette.primary.dark
                                        }
                                    }}
                                >
                                    Управление
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            ) : (
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '300px',
                    textAlign: 'center',
                    p: 4
                }}>
                    <School sx={{
                        fontSize: 60,
                        color: theme.palette.grey[400],
                        mb: 2
                    }} />
                    <Typography variant="h5" sx={{ mb: 2 }}>
                        {searchTerm || filter.direction || filter.status
                            ? "Курсы не найдены"
                            : "У вас пока нет курсов"}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        {searchTerm || filter.direction || filter.status
                            ? "Попробуйте изменить параметры поиска"
                            : "Создайте свой первый курс"}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={searchTerm || filter.direction || filter.status ? clearFilters : handleAddCourse}
                        sx={{ px: 4 }}
                    >
                        {searchTerm || filter.direction || filter.status ? "Сбросить фильтры" : "Создать курс"}
                    </Button>
                </Box>
            )}
        </Container>
    );
};

export default TeachingPage;