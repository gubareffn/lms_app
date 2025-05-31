import { Container, Box, Typography, Button, Paper, styled, Avatar, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import {
    School as SchoolIcon,
    Work as WorkIcon,
    TrendingUp as TrendingUpIcon,
    People as PeopleIcon,
    CheckCircle as CheckCircleIcon,
    AccessTime as AccessTimeIcon,
    Computer as ComputerIcon,
    Star as StarIcon
} from '@mui/icons-material';

const FeatureCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
        transform: 'translateY(-10px)',
        boxShadow: theme.shadows[8]
    },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: 80,
    height: 80,
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
}));

export const HomePage = () => {
    return (
        <Box sx={{ backgroundColor: 'background.default' }}>
            {/* Hero Section */}
            <Box sx={{
                pt: 12,
                pb: 8,
                background: 'linear-gradient(135deg, #1976d2 0%, #004ba0 100%)',
                color: 'white',
            }}>
                <Container maxWidth="lg">
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: 4,
                        alignItems: 'center'
                    }}>
                        <Box>
                            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                                Профессиональное развитие начинается здесь
                            </Typography>
                            <Typography variant="h5" gutterBottom sx={{ mb: 4, opacity: 0.9 }}>
                                Платформа для получения дополнительного профессионального образования
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 3, mt: 4 }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    component={Link}
                                    to="/courses"
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        backgroundColor: 'white',
                                        color: 'primary.main',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255,255,255,0.9)'
                                        }
                                    }}
                                >
                                    Найти курс
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    component={Link}
                                    to="/about"
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        color: 'white',
                                        borderColor: 'white',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255,255,255,0.1)'
                                        }
                                    }}
                                >
                                    О системе
                                </Button>
                            </Box>
                        </Box>
                        <Box sx={{
                            display: { xs: 'none', md: 'block' },
                            '& img': {
                                width: '100%',
                                borderRadius: '16px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                            }
                        }}>
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                alt="Обучение"
                            />
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 600, mb: 6 }}>
                    Почему выбирают нашу платформу
                </Typography>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 4
                }}>
                    <FeatureCard>
                        <StyledAvatar>
                            <SchoolIcon sx={{ fontSize: 40 }} />
                        </StyledAvatar>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                            Актуальные знания
                        </Typography>
                        <Typography>
                            Курсы разработаны практикующими экспертами с учетом современных требований рынка труда
                        </Typography>
                    </FeatureCard>
                    <FeatureCard>
                        <StyledAvatar>
                            <WorkIcon sx={{ fontSize: 40 }} />
                        </StyledAvatar>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                            Гибкий график
                        </Typography>
                        <Typography>
                            Возможность обучаться в удобное время без отрыва от основной деятельности
                        </Typography>
                    </FeatureCard>
                    <FeatureCard>
                        <StyledAvatar>
                            <TrendingUpIcon sx={{ fontSize: 40 }} />
                        </StyledAvatar>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                            Карьерный рост
                        </Typography>
                        <Typography>
                            Полученные навыки помогут вам продвинуться по карьерной лестнице
                        </Typography>
                    </FeatureCard>
                </Box>
            </Container>

            {/* How It Works Section */}
            <Box sx={{ backgroundColor: 'background.paper', py: 8 }}>
                <Container maxWidth="lg">
                    <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 600, mb: 6 }}>
                        Как это работает
                    </Typography>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: 6,
                        alignItems: 'center'
                    }}>
                        <List>
                            <ListItem sx={{ py: 2 }}>
                                <ListItemIcon>
                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                        <PeopleIcon />
                                    </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                    primary="Регистрация"
                                    secondary="Создайте личный кабинет и заполните профиль"
                                    primaryTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                                />
                            </ListItem>
                            <ListItem sx={{ py: 2 }}>
                                <ListItemIcon>
                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                        <ComputerIcon />
                                    </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                    primary="Выбор курса"
                                    secondary="Подберите программу обучения по вашим интересам"
                                    primaryTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                                />
                            </ListItem>
                            <ListItem sx={{ py: 2 }}>
                                <ListItemIcon>
                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                        <AccessTimeIcon />
                                    </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                    primary="Обучение"
                                    secondary="Осваивайте материалы в удобном темпе"
                                    primaryTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                                />
                            </ListItem>
                            <ListItem sx={{ py: 2 }}>
                                <ListItemIcon>
                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                        <CheckCircleIcon />
                                    </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                    primary="Сертификация"
                                    secondary="Получите документ об окончании курса"
                                    primaryTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                                />
                            </ListItem>
                        </List>
                        <Box sx={{
                            order: { xs: -1, md: 1 },
                            '& img': {
                                width: '100%',
                                borderRadius: '16px',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                            }
                        }}>
                            <img
                                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                alt="Процесс обучения"
                            />
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Testimonials Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 600, mb: 6 }}>
                    Отзывы наших слушателей
                </Typography>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 4
                }}>
                    {[
                        {
                            name: "Иван Петров",
                            role: "Менеджер проектов",
                            text: "Благодаря курсам смог систематизировать знания и получил повышение на работе."
                        },
                        {
                            name: "Елена Смирнова",
                            role: "Frontend разработчик",
                            text: "Отличная подача материала, особенно понравились практические задания."
                        },
                        {
                            name: "Алексей Козлов",
                            role: "HR специалист",
                            text: "Удобный формат обучения, можно совмещать с работой. Рекомендую коллегам."
                        }
                    ].map((testimonial, index) => (
                        <Paper sx={{ p: 3, height: '100%' }} key={index}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                                    {testimonial.name.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography fontWeight={600}>{testimonial.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">{testimonial.role}</Typography>
                                </Box>
                            </Box>
                            <Typography>
                                <StarIcon color="primary" sx={{ fontSize: 16 }} />
                                <StarIcon color="primary" sx={{ fontSize: 16 }} />
                                <StarIcon color="primary" sx={{ fontSize: 16 }} />
                                <StarIcon color="primary" sx={{ fontSize: 16 }} />
                                <StarIcon color="primary" sx={{ fontSize: 16 }} />
                            </Typography>
                            <Typography sx={{ mt: 2 }}>{testimonial.text}</Typography>
                        </Paper>
                    ))}
                </Box>
            </Container>

            {/* CTA Section */}
            <Box sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #004ba0 100%)',
                color: 'white',
                py: 8,
                textAlign: 'center'
            }}>
                <Container maxWidth="md">
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                        Готовы начать обучение?
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                        Присоединяйтесь к тысячам профессионалов, которые уже улучшили свои навыки с нашей платформой
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        component={Link}
                        to="/courses"
                        sx={{
                            px: 6,
                            py: 1.5,
                            fontSize: '1.1rem',
                            backgroundColor: 'white',
                            color: 'primary.main',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.9)'
                            }
                        }}
                    >
                        Начать сейчас
                    </Button>
                </Container>
            </Box>
        </Box>
    );
};