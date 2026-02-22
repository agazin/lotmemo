'use client';

import { useState, useMemo } from 'react';
import {
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    LinearProgress,
    Chip,
    Box,
} from '@mui/material';
import { useNumbers } from '../contexts/NumberContext';
import { useLimits } from '../contexts/LimitContext';
import { formatBetType } from '../utils/betParser';

export default function MonitorDashboard() {
    const { getAggregatedTotals } = useNumbers();
    const { settings } = useLimits();
    const [orderBy, setOrderBy] = useState('total');
    const [order, setOrder] = useState('desc');

    const totals = getAggregatedTotals();
    const grandTotal = totals.reduce((sum, item) => sum + item.total, 0);

    const getLimit = (number, type) => {
        const numLimit = settings.numberLimits?.[number]?.maxAmount;
        if (numLimit) return numLimit;
        return settings.ceilingLimits?.[type] || Infinity;
    };

    const getPercentage = (item) => {
        const limit = getLimit(item.number, item.type);
        if (limit === Infinity) return 0;
        return (item.total / limit) * 100;
    };

    const getRiskColor = (pct) => {
        if (pct >= 100) return 'error';
        if (pct >= 80) return 'warning';
        if (pct >= 50) return 'info';
        return 'success';
    };

    const handleSort = (column) => {
        if (orderBy === column) {
            setOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setOrderBy(column);
            setOrder('desc');
        }
    };

    const sortedTotals = useMemo(() => {
        return [...totals].sort((a, b) => {
            let valA, valB;
            switch (orderBy) {
                case 'number':
                    valA = a.number; valB = b.number;
                    return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                case 'type':
                    valA = a.type; valB = b.type;
                    return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                case 'total':
                    valA = a.total; valB = b.total;
                    break;
                case 'status':
                    valA = getPercentage(a); valB = getPercentage(b);
                    break;
                case 'limit':
                    valA = getLimit(a.number, a.type); valB = getLimit(b.number, b.type);
                    // Treat Infinity as largest
                    if (valA === Infinity) valA = Number.MAX_SAFE_INTEGER;
                    if (valB === Infinity) valB = Number.MAX_SAFE_INTEGER;
                    break;
                default:
                    valA = a.total; valB = b.total;
            }
            return order === 'asc' ? valA - valB : valB - valA;
        });
    }, [totals, orderBy, order]);

    return (
        <div className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                        border: '1px solid #bfdbfe',
                    }}
                >
                    <Typography variant="caption" color="text.secondary">ยอดรวมทั้งหมด</Typography>
                    <Typography variant="h5" fontWeight={800} color="primary.main">
                        {grandTotal.toLocaleString()} ฿
                    </Typography>
                </Paper>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                        border: '1px solid #bbf7d0',
                    }}
                >
                    <Typography variant="caption" color="text.secondary">จำนวนเลข</Typography>
                    <Typography variant="h5" fontWeight={800} color="success.main">
                        {totals.length}
                    </Typography>
                </Paper>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                        border: '1px solid #fde68a',
                    }}
                >
                    <Typography variant="caption" color="text.secondary">ใกล้เต็ม (≥80%)</Typography>
                    <Typography variant="h5" fontWeight={800} color="warning.main">
                        {totals.filter(t => getPercentage(t) >= 80 && getPercentage(t) < 100).length}
                    </Typography>
                </Paper>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                        border: '1px solid #fecaca',
                    }}
                >
                    <Typography variant="caption" color="text.secondary">เต็ม (100%)</Typography>
                    <Typography variant="h5" fontWeight={800} color="error.main">
                        {totals.filter(t => getPercentage(t) >= 100).length}
                    </Typography>
                </Paper>
            </div>

            {/* Detail table */}
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
            >
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'action.hover' }}>
                            <TableCell sx={{ fontWeight: 700, width: 80 }}>
                                <TableSortLabel active={orderBy === 'number'} direction={orderBy === 'number' ? order : 'asc'} onClick={() => handleSort('number')}>
                                    เลข
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>
                                <TableSortLabel active={orderBy === 'type'} direction={orderBy === 'type' ? order : 'asc'} onClick={() => handleSort('type')}>
                                    ประเภท
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                                <TableSortLabel active={orderBy === 'total'} direction={orderBy === 'total' ? order : 'asc'} onClick={() => handleSort('total')}>
                                    ยอดรวม
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>
                                <TableSortLabel active={orderBy === 'status'} direction={orderBy === 'status' ? order : 'asc'} onClick={() => handleSort('status')}>
                                    สถานะ
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                                <TableSortLabel active={orderBy === 'limit'} direction={orderBy === 'limit' ? order : 'asc'} onClick={() => handleSort('limit')}>
                                    เพดาน
                                </TableSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedTotals.map((item) => {
                            const pct = getPercentage(item);
                            const limit = getLimit(item.number, item.type);
                            const color = getRiskColor(pct);
                            return (
                                <TableRow
                                    key={`${item.number}-${item.type}`}
                                    sx={{
                                        backgroundColor:
                                            pct >= 100 ? 'error.50' : pct >= 80 ? 'warning.50' : 'inherit',
                                        '&:hover': { backgroundColor: 'action.hover' },
                                    }}
                                >
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1rem' }}>
                                            {item.number}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={formatBetType(item.type)}
                                            size="small"
                                            variant="outlined"
                                            color="primary"
                                            sx={{ fontSize: '0.7rem', height: 22 }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                                            {item.total.toLocaleString()} ฿
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={Math.min(pct, 100)}
                                                color={color}
                                                sx={{ flex: 1, height: 8, borderRadius: 4 }}
                                            />
                                            <Typography variant="caption" fontWeight={600} sx={{ minWidth: 40, textAlign: 'right' }}>
                                                {pct.toFixed(0)}%
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="caption" color="text.secondary">
                                            {limit === Infinity ? '∞' : `${limit.toLocaleString()} ฿`}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {totals.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: 'text.disabled' }}>
                                    ยังไม่มีข้อมูล
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}
