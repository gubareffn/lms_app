import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    TextField,
    MenuItem,
    Divider,
    CircularProgress,
    Alert,
    IconButton,
    Stack
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface Category {
    id: number;
    name: string;
}

interface CourseStatus {
    id: number;
    name: string;
}

interface EducationMaterial {
    id?: number;
    name: string;
    text: string;
}

const CreateCoursePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        studyDirection: '',
        startDate: new Date() as Date | null,
        endDate: null as Date | null,
        hoursCount: 0,
        resultCompetence: '',
        categoryId: '',
        statusId: ''
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [statuses, setStatuses] = useState<CourseStatus[]>([]);
    const [loading, setLoading] = useState({
        page: true,
        submit: false
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(prev => ({ ...prev, page: true }));
                setError(null);

                const [categoriesRes, statusesRes] = await Promise.all([
                    fetch('http://localhost:8080/api/category'),
                    fetch('http://localhost:8080/api/status')
                ]);

                // Проверка статуса ответа и преобразование в JSON
                if (!categoriesRes.ok) throw new Error('Ошибка загрузки категорий');
                if (!statusesRes.ok) throw new Error('Ошибка загрузки статусов');

                const [categoriesData, statusesData] = await Promise.all([
                    categoriesRes.json(),
                    statusesRes.json()
                ]);

                // Проверка что данные являются массивами
                if (!Array.isArray(categoriesData)) throw new Error('Некорректный формат категорий');
                if (!Array.isArray(statusesData)) throw new Error('Некорректный формат статусов');

                setCategories(categoriesData);
                setStatuses(statusesData);

                // Установка статуса "Черновик" по умолчанию
                const draftStatus = statusesData.find((s: CourseStatus) => s.name === 'DRAFT');
                if (draftStatus) {
                    setFormData(prev => ({ ...prev, statusId: draftStatus.id.toString() }));
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
            } finally {
                setLoading(prev => ({ ...prev, page: false }));
            }
        };

        fetchInitialData();
    }, []);

    const handleFormChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(prev => ({ ...prev, submit: true }));
            setError(null);

            const response = await fetch('http://localhost:8080/api/courses/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    startDate: formData.startDate?.toISOString(),
                    endDate: formData.endDate?.toISOString(),
                    categoryId: Number(formData.categoryId),
                    statusId: Number(formData.statusId),
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Ошибка создания курса');
            }

            const createdCourse = await response.json();
            navigate(`/courses/${createdCourse.id}/manage`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    if (loading.page) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ maxWidth: 800, margin: '0 auto', p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Создание нового курса
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Paper elevation={3} sx={{ p: 3 }}>
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            <Typography variant="h6">Основная информация</Typography>
                            <Divider />

                            <TextField
                                label="Название курса"
                                value={formData.name}
                                onChange={(e) => handleFormChange('name', e.target.value)}
                                fullWidth
                                required
                                error={!formData.name}
                                helperText={!formData.name ? 'Обязательное поле' : ''}
                            />

                            <TextField
                                label="Направление обучения"
                                value={formData.studyDirection}
                                onChange={(e) => handleFormChange('studyDirection', e.target.value)}
                                fullWidth
                                required
                                error={!formData.studyDirection}
                                helperText={!formData.studyDirection ? 'Обязательное поле' : ''}
                            />

                            <TextField
                                label="Описание курса"
                                value={formData.description}
                                onChange={(e) => handleFormChange('description', e.target.value)}
                                multiline
                                rows={4}
                                fullWidth
                            />

                            <TextField
                                label="Результат (компетенции)"
                                value={formData.resultCompetence}
                                onChange={(e) => handleFormChange('resultCompetence', e.target.value)}
                                fullWidth
                                required
                                error={!formData.resultCompetence}
                                helperText={!formData.resultCompetence ? 'Обязательное поле' : ''}
                            />

                            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                                <TextField
                                    label="Количество часов"
                                    type="number"
                                    value={formData.hoursCount}
                                    onChange={(e) => handleFormChange('hoursCount', parseInt(e.target.value) || 0)}
                                    fullWidth
                                    required
                                    sx={{ minWidth: 200 }}
                                />

                                <TextField
                                    select
                                    label="Категория"
                                    value={formData.categoryId}
                                    onChange={(e) => handleFormChange('categoryId', e.target.value)}
                                    fullWidth
                                    required
                                    error={!formData.categoryId}
                                    helperText={!formData.categoryId ? 'Обязательное поле' : ''}
                                    sx={{ minWidth: 200 }}
                                >
                                    {categories?.map?.((category) => (
                                        <MenuItem key={category.id} value={category.id}>
                                            {category.name}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    select
                                    label="Статус"
                                    value={formData.statusId}
                                    onChange={(e) => handleFormChange('statusId', e.target.value)}
                                    fullWidth
                                    required
                                    error={!formData.statusId}
                                    helperText={!formData.statusId ? 'Обязательное поле' : ''}
                                    sx={{ minWidth: 200 }}
                                >
                                    {statuses?.map?.((status) => (
                                        <MenuItem key={status.id} value={status.id}>
                                            {status.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Stack>

                            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                                <DatePicker
                                    label="Дата начала"
                                    value={formData.startDate}
                                    onChange={(date) => handleFormChange('startDate', date)}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            required: true,
                                            error: !formData.startDate,
                                            helperText: !formData.startDate ? 'Обязательное поле' : ''
                                        }
                                    }}
                                    sx={{ minWidth: 200 }}
                                />

                                <DatePicker
                                    label="Дата окончания (опционально)"
                                    value={formData.endDate}
                                    onChange={(date) => handleFormChange('endDate', date)}
                                    slotProps={{ textField: { fullWidth: true } }}
                                    sx={{ minWidth: 200 }}
                                />
                            </Stack>

                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/teaching')}
                                    disabled={loading.submit}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading.submit}
                                    startIcon={loading.submit ? <CircularProgress size={20} /> : null}
                                >
                                    Создать курс
                                </Button>
                            </Stack>
                        </Stack>
                    </form>
                </Paper>
            </Box>
        </LocalizationProvider>
    );
};

export default CreateCoursePage;