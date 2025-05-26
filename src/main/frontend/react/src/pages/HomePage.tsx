import {Container, Box, Typography, Button} from '@mui/material';
import {Link} from 'react-router-dom';
import AppBar from '../components/Layout/AppBar';

export const HomePage = () => {
    return (
        <Container maxWidth="lg">
            <Box sx={{my: 4, textAlign: 'center'}}>
                <Typography variant="h4" gutterBottom>
                    Система профессионального образования
                </Typography>
                <Typography variant="body1" paragraph>
                    Добро пожаловать в систему дополнительного профессионального образования.
                    Здесь вы можете найти подходящие курсы для повышения квалификации.
                </Typography>
                <Box sx={{display: 'flex', justifyContent: 'center', gap: 2, mt: 4}}>
                    <Button
                        variant="contained"
                        size="large"
                        component={Link}
                        to="/courses"
                    >
                        Все курсы
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};