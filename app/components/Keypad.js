'use client';

import { useState } from 'react';
import { Box, Button, Paper, Typography, Chip } from '@mui/material';
import { Backspace, Check, SwapHoriz, Casino } from '@mui/icons-material';

const SHORTCUT_MODES = [
    { key: 'normal', label: 'ปกติ', icon: null },
    { key: 'กลับ', label: 'กลับ', icon: <SwapHoriz fontSize="small" /> },
    { key: '19ประตู', label: '19 ประตู', icon: <Casino fontSize="small" /> },
    { key: 'รูดหน้า', label: 'รูดหน้า', icon: null },
    { key: 'รูดหลัง', label: 'รูดหลัง', icon: null },
];

export default function Keypad({ onKeyPress, onDelete, onSubmit, onClear, onShortcut }) {
    const [activeMode, setActiveMode] = useState('normal');

    const keys = [
        '1', '2', '3',
        '4', '5', '6',
        '7', '8', '9',
        '=', '0', 'x',
    ];

    const handleModeToggle = (mode) => {
        const newMode = activeMode === mode ? 'normal' : mode;
        setActiveMode(newMode);
        if (onShortcut) onShortcut(newMode);
    };

    return (
        <div className="space-y-3">
            {/* Shortcut mode chips */}
            <div className="flex flex-wrap gap-2">
                {SHORTCUT_MODES.filter(m => m.key !== 'normal').map((mode) => (
                    <Chip
                        key={mode.key}
                        label={mode.label}
                        icon={mode.icon}
                        size="medium"
                        variant={activeMode === mode.key ? 'filled' : 'outlined'}
                        color={activeMode === mode.key ? 'primary' : 'default'}
                        onClick={() => handleModeToggle(mode.key)}
                        sx={{
                            fontWeight: activeMode === mode.key ? 700 : 500,
                            fontSize: '0.85rem',
                            height: 36,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                transform: 'scale(1.05)',
                            },
                        }}
                    />
                ))}
            </div>

            {/* Active mode indicator */}
            {activeMode !== 'normal' && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 1,
                        backgroundColor: 'primary.main',
                        color: 'white',
                        borderRadius: 2,
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="body2" fontWeight={700}>
                        โหมด: {SHORTCUT_MODES.find(m => m.key === activeMode)?.label}
                    </Typography>
                </Paper>
            )}

            {/* Number pad */}
            <Paper
                elevation={0}
                sx={{
                    p: 1,
                    backgroundColor: 'grey.100',
                    borderRadius: 3,
                    '.dark &': { backgroundColor: 'grey.800' },
                }}
            >
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 6,
                    }}
                >
                    {keys.map((key) => {
                        const isSpecial = key === '=' || key === 'x';
                        return (
                            <Button
                                key={key}
                                variant="contained"
                                onClick={() => onKeyPress(key)}
                                sx={{
                                    height: 60,
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    borderRadius: 2,
                                    minWidth: 0,
                                    boxShadow: 'none',
                                    backgroundColor: isSpecial ? 'primary.main' : 'background.paper',
                                    color: isSpecial ? 'white' : 'text.primary',
                                    '&:hover': {
                                        backgroundColor: isSpecial ? 'primary.dark' : 'grey.200',
                                        boxShadow: 'none',
                                    },
                                    '&:active': {
                                        transform: 'scale(0.95)',
                                    },
                                    transition: 'transform 0.1s ease',
                                }}
                            >
                                {key}
                            </Button>
                        );
                    })}

                    {/* Bottom row: CLR / DEL / Submit */}
                    <Button
                        variant="contained"
                        onClick={onClear}
                        sx={{
                            height: 60,
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            borderRadius: 2,
                            boxShadow: 'none',
                            backgroundColor: 'error.main',
                            color: 'white',
                            '&:hover': { backgroundColor: 'error.dark', boxShadow: 'none' },
                            '&:active': { transform: 'scale(0.95)' },
                            transition: 'transform 0.1s ease',
                        }}
                    >
                        CLR
                    </Button>
                    <Button
                        variant="contained"
                        onClick={onDelete}
                        sx={{
                            height: 60,
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            borderRadius: 2,
                            boxShadow: 'none',
                            backgroundColor: 'warning.main',
                            color: 'white',
                            '&:hover': { backgroundColor: 'warning.dark', boxShadow: 'none' },
                            '&:active': { transform: 'scale(0.95)' },
                            transition: 'transform 0.1s ease',
                        }}
                    >
                        <Backspace />
                    </Button>
                    <Button
                        variant="contained"
                        onClick={onSubmit}
                        sx={{
                            height: 60,
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            borderRadius: 2,
                            boxShadow: 'none',
                            backgroundColor: 'success.main',
                            color: 'white',
                            '&:hover': { backgroundColor: 'success.dark', boxShadow: 'none' },
                            '&:active': { transform: 'scale(0.95)' },
                            transition: 'transform 0.1s ease',
                        }}
                    >
                        <Check />
                    </Button>
                </div>
            </Paper>
        </div>
    );
}
