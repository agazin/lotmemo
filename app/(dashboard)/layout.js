'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useLimits } from '../contexts/LimitContext';
import {
    Box,
    Typography,
    Chip,
    IconButton,
    Tooltip,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Avatar,
} from '@mui/material';
import {
    Logout,
    Settings,
    Edit,
    Dashboard as DashboardIcon,
    EmojiEvents,
    Assessment,
    ReceiptLong,
} from '@mui/icons-material';

const NAV_ITEMS = [
    { path: '/', label: 'รายงาน', icon: <Assessment />, adminOnly: false },
    { path: '/entry', label: 'คีย์ข้อมูล', icon: <Edit />, adminOnly: false },
    { path: '/tickets', label: 'ใบโพย', icon: <ReceiptLong />, adminOnly: false },
    { path: '/monitor', label: 'ตรวจติดตาม', icon: <DashboardIcon />, adminOnly: true },
    { path: '/results', label: 'ผลรางวัล', icon: <EmojiEvents />, adminOnly: true },
];

const SIDEBAR_WIDTH = 240;

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, isInitializing } = useAuth();
    const { settings, isWithinOpenHours } = useLimits();

    useEffect(() => {
        if (!isInitializing && !user) {
            router.push('/login');
        }
    }, [user, router, isInitializing]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (!user) return null;

    const isAdmin = user.role === 'admin' || user.role === 'superuser';
    const withinHours = isWithinOpenHours();
    const visibleNav = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4f8 0%, #dfe6ed 100%)' }}>
            {/* ─── Sidebar ─── */}
            <Box
                component="nav"
                sx={{
                    width: SIDEBAR_WIDTH,
                    flexShrink: 0,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                    color: 'white',
                    zIndex: 200,
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                    overflowY: 'auto',
                    // Mobile: bottom bar instead
                    '@media (max-width: 768px)': {
                        position: 'fixed',
                        top: 'auto',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100%',
                        height: 64,
                        flexDirection: 'row',
                        borderRight: 'none',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                    },
                }}
            >
                {/* Brand */}
                <Box
                    sx={{
                        p: 2.5,
                        '@media (max-width: 768px)': { display: 'none' },
                    }}
                >
                    <Typography
                        variant="h6"
                        fontWeight={900}
                        sx={{
                            background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        LottoTrack
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Chip
                            label={withinHours ? '🟢 เปิดรับ' : '🔴 ปิดรับ'}
                            size="small"
                            sx={{
                                height: 22,
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                backgroundColor: withinHours ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                color: withinHours ? '#4ade80' : '#f87171',
                                border: '1px solid',
                                borderColor: withinHours ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
                            }}
                        />
                    </Box>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', '@media (max-width: 768px)': { display: 'none' } }} />

                {/* Navigation items */}
                <List
                    sx={{
                        flex: 1,
                        px: 1,
                        py: 1,
                        '@media (max-width: 768px)': {
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-around',
                            p: 0,
                            width: '100%',
                        },
                    }}
                >
                    {visibleNav.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <ListItem
                                key={item.path}
                                disablePadding
                                sx={{
                                    mb: 0.5,
                                    '@media (max-width: 768px)': { mb: 0, flex: 1 },
                                }}
                            >
                                <ListItemButton
                                    onClick={() => router.push(item.path)}
                                    sx={{
                                        borderRadius: 2,
                                        mx: 0.5,
                                        py: 1.2,
                                        backgroundColor: isActive ? 'rgba(96,165,250,0.15)' : 'transparent',
                                        color: isActive ? '#93c5fd' : 'rgba(255,255,255,0.55)',
                                        '&:hover': {
                                            backgroundColor: isActive ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.05)',
                                            color: 'white',
                                        },
                                        transition: 'all 0.2s ease',
                                        '@media (max-width: 768px)': {
                                            flexDirection: 'column',
                                            py: 0.8,
                                            px: 0.5,
                                            mx: 0,
                                            borderRadius: 0,
                                            minWidth: 0,
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            color: 'inherit',
                                            minWidth: 36,
                                            '@media (max-width: 768px)': { minWidth: 0, mr: 0 },
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{
                                            sx: {
                                                fontSize: '0.85rem',
                                                fontWeight: isActive ? 700 : 500,
                                                '@media (max-width: 768px)': { fontSize: '0.6rem' },
                                            }
                                        }}
                                        sx={{
                                            '@media (max-width: 768px)': { mt: 0.2 },
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>

                {/* Bottom section: user info + settings */}
                <Box
                    sx={{
                        p: 2,
                        '@media (max-width: 768px)': { display: 'none' },
                    }}
                >
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Avatar
                            sx={{
                                width: 34,
                                height: 34,
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            }}
                        >
                            {user.name?.[0] || 'U'}
                        </Avatar>
                        <Box sx={{ flex: 1, overflow: 'hidden' }}>
                            <Typography variant="body2" fontWeight={700} noWrap sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                {user.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                {user.role}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {isAdmin && (
                            <Tooltip title="ตั้งค่าระบบ">
                                <IconButton
                                    size="small"
                                    onClick={() => router.push('/settings')}
                                    sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: 'white', backgroundColor: 'rgba(255,255,255,0.08)' } }}
                                >
                                    <Settings fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Tooltip title="ออกจากระบบ">
                            <IconButton
                                size="small"
                                onClick={handleLogout}
                                sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#f87171', backgroundColor: 'rgba(248,113,113,0.1)' } }}
                            >
                                <Logout fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>

            {/* ─── Main content ─── */}
            <Box
                component="main"
                sx={{
                    flex: 1,
                    ml: `${SIDEBAR_WIDTH}px`,
                    minHeight: '100vh',
                    '@media (max-width: 768px)': {
                        ml: 0,
                        pb: '80px', // space for bottom nav
                    },
                }}
            >
                {/* Announcement banner */}
                {settings.announcements && (
                    <Box
                        sx={{
                            backgroundColor: '#fbbf24',
                            color: '#78350f',
                            py: 0.5,
                            px: 3,
                        }}
                    >
                        <Typography variant="caption" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            📢 {settings.announcements}
                        </Typography>
                    </Box>
                )}

                {/* Page content */}
                <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200 }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
}
