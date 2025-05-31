import * as React from 'react';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Button, MenuItem, Menu, Tooltip, Avatar, IconButton,

} from '@mui/material';
import { Link } from 'react-router-dom';
import LoginModal from "../../pages/SignInPage";
import {useState} from "react";
import {useAuth} from "../AuthContext";
import { AccountCircle } from '@mui/icons-material';

export default function NavigationBar() {
    const [loginOpen, setLoginOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const settings = ['Профиль', 'Выход'];
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const decodeJwt = (token: string | null) => {
        if (!token) return null;

        try {
            // JWT состоит из 3 частей, разделенных точками: header.payload.signature
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );

            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('Failed to decode JWT', e);
            return null;
        }
    };

    const getProfilePath = () => {
        const userType = localStorage.getItem("userType");
        const token = localStorage.getItem("token");

        const decodedToken = decodeJwt(token);
        const userId = decodedToken.id;


        if (userType === "STUDENT") {
            return `/profile/student/${userId}`;
        } else if (userType === "TEACHER" || userType === "ADMIN") {
            return `/profile/worker/${userId}`;
        }
        return "/profile";
    };


    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="fixed">
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
                        {isAuthenticated && (
                                localStorage.getItem("userType") === "STUDENT" && (
                                    <Button
                                        color="inherit"
                                        component={Link}
                                        to="/my-education"
                                        sx={{textTransform: 'none'}}
                                    >
                                        Моё обучение
                                    </Button>
                                )
                            )

                        }

                        {isAuthenticated && (
                                localStorage.getItem("userType") === "TEACHER" && (
                                    <Button
                                        color="inherit"
                                        component={Link}
                                        to="/teaching"
                                        sx={{textTransform: 'none'}}
                                    >
                                        Преподавание
                                    </Button>
                                )
                            )
                        }

                        {isAuthenticated && (
                            localStorage.getItem("userType") === "ADMIN" && (
                                <Button
                                    color="inherit"
                                    component={Link}
                                    to="/admin"
                                    sx={{textTransform: 'none'}}
                                >
                                    Администрирование
                                </Button>
                            )
                        )
                        }
                    </Box>

                    {/* Кнопки авторизации (справа) */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {isAuthenticated ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Tooltip title="Профиль">
                                    <IconButton
                                        size="large"
                                        aria-label={user?.email}
                                        aria-controls="menu-appbar"
                                        aria-haspopup="true"
                                        onClick={handleOpenUserMenu}
                                        color="inherit"
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'row-reverse',
                                            gap: 1,
                                            p: 0,
                                            "&:hover": {
                                                backgroundColor: 'transparent'
                                            }
                                        }}
                                    >
                                        <AccountCircle />
                                        <Typography variant="body1" sx={{ color: 'inherit' }}>
                                            {user?.email}
                                        </Typography>
                                    </IconButton>
                                </Tooltip>

                                <Menu
                                    id="menu-appbar"
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                >
                                    <MenuItem component={Link} to={getProfilePath()}>Профиль</MenuItem>
                                    <MenuItem onClick={logout}>Выйти</MenuItem>
                                </Menu>
                            </Box>
                        ) : (
                            <>
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
                            </>
                        )}
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