import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import  AppBar  from '../components/Layout/AppBar';
import {
    Container,
    Typography,
    Box,
    Paper,
    Chip,
    Divider,
    Button,
    CircularProgress,
} from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Course {
    id: number;
    name: string;
    description: string;
    studyDirection: string;
    startDate: string;
    endDate: string | null;
    hoursCount: number;
    resultCompetence: string;
    category: string;
    status: string;
}

export default function CoursePage() {
    const { id } = useParams<{ id: string }>();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get<Course>(`http://localhost:8080/api/courses/${id}`);
                console.log(response);
                setCourse(response.data);
            } catch (err) {
                setError('Не удалось загрузить данные курса');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Typography color="error">{error}</Typography>
            </Container>
        );
    }

    if (!course) {
        return null;
    }

    const formatDate = (date: string) => {
        return format(new Date(date), 'dd MMMM yyyy', { locale: ru });
    };

    return (
        <>
            <AppBar/><Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {course.name}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Chip label={course.category} color="primary" />
                    <Chip label={course.status} variant="outlined" />
                </Box>

                <Typography variant="subtitle1" gutterBottom>
                    Направление: {course.studyDirection}
                </Typography>

                <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                    <Typography>
                        <strong>Начало:</strong> {formatDate(course.startDate)}
                    </Typography>
                    <Typography>
                        <strong>Окончание:</strong> {course.endDate ? formatDate(course.endDate) : 'не указано'}
                    </Typography>
                    <Typography>
                        <strong>Часов:</strong> {course.hoursCount}
                    </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                    Описание курса
                </Typography>
                <Typography paragraph>
                    {course.description || 'Описание отсутствует'}
                </Typography>

                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                    Результаты обучения
                </Typography>
                <Typography paragraph>
                    {course.resultCompetence}
                </Typography>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        component={Link}
                        to="/courses"
                        sx={{ mr: 2 }}
                    >
                        Назад к списку
                    </Button>
                    <Button variant="contained" color="primary">
                        Записаться на курс
                    </Button>
                </Box>
            </Paper>
        </Container></>
    );
}