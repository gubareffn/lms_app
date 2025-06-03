import { useState } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Divider,
    Typography,
    Paper
} from '@mui/material';
import Applications from './MyRequestsList';
import ActiveCourses from './MyCoursesPage';

const MyEducationPage = () => {
    const [activeTab, setActiveTab] = useState<'courses' | 'applications'>('courses');

    return (
        <Box sx={{
            display: 'flex',
            minHeight: 'calc(100vh - 64px)',
            backgroundColor: '#f5f5f5'
        }}>
            {/* Боковое меню */}
            <Paper
                elevation={3}
                sx={{
                    width: 250,
                    minHeight: '100%',
                    borderRadius: 0
                }}
            >

                <List>
                    <ListItem disablePadding>
                        <ListItemButton
                            selected={activeTab === 'courses'}
                            onClick={() => setActiveTab('courses')}
                        >
                            <ListItemText primary="Активные курсы" />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton
                            selected={activeTab === 'applications'}
                            onClick={() => setActiveTab('applications')}
                        >
                            <ListItemText primary="Мои заявки" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Paper>

            {/* Основной контент */}
            <Box sx={{
                flexGrow: 1,
                p: 3,
                marginLeft: '16px'
            }}>
                <Typography variant="h4" gutterBottom>
                    {activeTab === 'applications' ? 'Мои заявки' : 'Активные курсы'}
                </Typography>

                <Divider sx={{ mb: 3 }} />

                {activeTab === 'applications' ? <Applications /> : <ActiveCourses />}
            </Box>
        </Box>
    );
};

export default MyEducationPage;