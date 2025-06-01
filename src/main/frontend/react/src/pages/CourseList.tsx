import React, { useState, useEffect } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Container,
    CircularProgress,
    Chip,
    Box,
    Button,
    TextField,
    MenuItem,
    InputAdornment,
    Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
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
    const [filteredCourses, setFilteredCourses] = useState<CourseShort[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState({
        direction: '',
        status: ''
    });

    const studyDirections = Array.from(new Set(courses.map(course => course.studyDirection)));
    const statusOptions = Array.from(new Set(courses.map(course => course.status)));

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get<CourseShort[]>('http://localhost:8080/api/courses');
                setCourses(response.data);
                setFilteredCourses(response.data);
            } catch (err) {
                setError('Не удалось загрузить список курсов');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

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
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
                Доступные курсы
            </Typography>


            <Box sx={{ mb: 4 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Поиск курсов..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mb: 3 }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <FilterListIcon color="action" />
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
                            md: 'repeat(3, 1fr)'
                        },
                        gap: 3
                    }}
                >
                    {filteredCourses.map((course) => (
                        <Card
                            key={course.id}
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: 4
                                },
                                borderLeft: `4px solid ${
                                    course.status === 'Идёт набор' ? '#4caf50' :
                                        course.status === 'Уже начался' ? '#ff9800' : '#f44336'
                                }`
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 600 }}>
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
                                                course.status === 'Идёт набор' ? '#e8f5e9' :
                                                    course.status === 'Уже начался' ? '#fff3e0' : '#ffebee',
                                            color:
                                                course.status === 'Идёт набор' ? '#2e7d32' :
                                                    course.status === 'Уже начался' ? '#e65100' : '#c62828',
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
                                    component={Link}
                                    to={`/courses/${course.id}`}
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        backgroundColor: '#1976d2',
                                        '&:hover': {
                                            backgroundColor: '#1565c0'
                                        }
                                    }}
                                >
                                    Подробнее
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
                    textAlign: 'center'
                }}>
                    <Typography variant="h5" color="textSecondary" sx={{ mb: 2 }}>
                        Курсы не найдены
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        Попробуйте изменить параметры поиска или фильтры
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={clearFilters}
                        sx={{ px: 4 }}
                    >
                        Сбросить фильтры
                    </Button>
                </Box>
            )}
        </Container>
    );
};

export default CourseList;