import * as React from 'react';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Button,

} from '@mui/material';
import { Link } from 'react-router-dom';
import LoginModal from "../../pages/SignInPage";
import {useState} from "react";

export default function AppBarWithDrawer() {
    const [loginOpen, setLoginOpen] = useState(false);

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{
                            mr: 2,
                            textDecoration: 'none',
                            color: 'inherit',
                            display: { xs: 'none', sm: 'block' }
                        }}
                    >
                        EDU
                    </Typography>

                    {/* Основные разделы (слева) */}
                    <Box sx={{
                        display: { xs: 'none', sm: 'flex' },
                        flexGrow: 1,
                        alignItems: 'center',
                        gap: 1
                    }}>
                        <Button
                            color="inherit"
                            component={Link}
                            to="/courses"
                            sx={{ textTransform: 'none' }}
                        >
                            Каталог
                        </Button>
                        <Button
                            color="inherit"
                            component={Link}
                            to="/my-courses"
                            sx={{ textTransform: 'none' }}
                        >
                            Мои курсы
                        </Button>
                    </Box>

                    {/* Кнопки авторизации (справа) */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            color="inherit"
                            onClick={() => setLoginOpen(true)}
                            sx={{ textTransform: 'none' }}
                        >
                            Вход
                        </Button>
                        <Button
                            color="inherit"
                            component={Link}
                            to="/sign-up"
                            sx={{
                                textTransform: 'none',
                                border: '1px solid rgba(255, 255, 255, 0.5)',
                                borderRadius: 1,
                                px: 2
                            }}
                        >
                            Регистрация
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
            <LoginModal
                open={loginOpen}
                onClose={() => setLoginOpen(false)}
            />
        </Box>
    );
}