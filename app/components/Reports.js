'use client';

import { useState } from 'react';

import {
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Box,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import { useNumbers } from '../contexts/NumberContext';
import { useLimits } from '../contexts/LimitContext';
import { useAuth } from '../contexts/AuthContext';
import { formatBetType } from '../utils/betParser';

export default function Reports() {
    const { numbers } = useNumbers();
    const { settings, checkLimit } = useLimits();
    const { user } = useAuth();
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Filter numbers by user
    const isAdmin = user?.role === 'admin' || user?.role === 'superuser';
    const filteredNumbers = isAdmin ? numbers : numbers.filter(n => n.userId === user?.username);

    // Get aggregated totals from filtered numbers
    const totals = (() => {
        const t = {};
        filteredNumbers.forEach(n => {
            const key = `${n.number}-${n.type}`;
            if (!t[key]) {
                t[key] = { number: n.number, type: n.type, total: 0, count: 0 };
            }
            t[key].total += n.amount;
            t[key].count += 1;
        });
        return Object.values(t).sort((a, b) => b.total - a.total);
    })();
    const topNumbers = totals.slice(0, 10);

    // Calculate win/loss
    const totalBets = filteredNumbers.reduce((sum, n) => sum + n.amount, 0);
    const winners = filteredNumbers.filter(n => n.status === 'WIN');
    const totalPayout = winners.reduce((sum, n) => {
        const odds = settings.defaultOdds[n.type] || 0;
        const closed = settings.closedNumbers[n.number];
        const effectiveOdds = closed?.type === 'HALF' ? odds / 2 : odds;
        return sum + n.amount * effectiveOdds;
    }, 0);
    const netProfit = totalBets - totalPayout;

    // Count by status
    const statusCounts = {
        PENDING: filteredNumbers.filter(n => n.status === 'PENDING').length,
        WIN: filteredNumbers.filter(n => n.status === 'WIN').length,
        LOSE: filteredNumbers.filter(n => n.status === 'LOSE').length,
    };

    const isAllPending = filteredNumbers.length > 0 && statusCounts.PENDING === filteredNumbers.length;

    // Count by type
    const typeCounts = {};
    filteredNumbers.forEach(n => {
        if (!typeCounts[n.type]) typeCounts[n.type] = { count: 0, total: 0 };
        typeCounts[n.type].count += 1;
        typeCounts[n.type].total += n.amount;
    });

    return (
        <div className="space-y-4">
            {/* Win/Loss Summary */}
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
                    <Typography variant="caption" color="text.secondary">ยอดรวมแทง</Typography>
                    <Typography variant="h6" fontWeight={800} color="primary.main">
                        {totalBets.toLocaleString()} ฿
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
                    <Typography variant="caption" color="text.secondary">เงินรางวัลจ่าย</Typography>
                    <Typography variant="h6" fontWeight={800} color="error.main">
                        {isAllPending ? '--' : `${totalPayout.toLocaleString()} ฿`}
                    </Typography>
                </Paper>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        textAlign: 'center',
                        background: netProfit >= 0
                            ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)'
                            : 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                        border: `1px solid ${netProfit >= 0 ? '#bbf7d0' : '#fecaca'}`,
                    }}
                >
                    <Typography variant="caption" color="text.secondary">กำไร/ขาดทุน</Typography>
                    <Typography
                        variant="h6"
                        fontWeight={800}
                        color={isAllPending ? 'text.secondary' : (netProfit >= 0 ? 'success.main' : 'error.main')}
                    >
                        {isAllPending ? '--' : `${netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString()} ฿`}
                    </Typography>
                </Paper>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
                        border: '1px solid #e9d5ff',
                    }}
                >
                    <Typography variant="caption" color="text.secondary">รายการทั้งหมด</Typography>
                    <Typography variant="h6" fontWeight={800} sx={{ color: '#7c3aed' }}>
                        {filteredNumbers.length}
                    </Typography>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 4 }}>
                        <Chip label={`ชนะ ${statusCounts.WIN}`} size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                        <Chip label={`แพ้ ${statusCounts.LOSE}`} size="small" color="error" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                        <Chip label={`รอ ${statusCounts.PENDING}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                    </div>
                </Paper>
            </div>

            {/* By type breakdown */}
            <Paper
                elevation={0}
                sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
            >
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                    📊 สรุปตามประเภท
                </Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>ประเภท</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>จำนวนรายการ</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>ยอดรวม</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries(typeCounts).sort((a, b) => b[1].total - a[1].total).map(([type, data]) => (
                                <TableRow key={type}>
                                    <TableCell>
                                        <Chip label={formatBetType(type)} size="small" variant="outlined" color="primary" />
                                    </TableCell>
                                    <TableCell align="right">{data.count}</TableCell>
                                    <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                        {data.total.toLocaleString()} ฿
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Top 10 Numbers */}
            <Paper
                elevation={0}
                sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
            >
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                    🔥 เลขยอดนิยม Top 10
                </Typography>
                {topNumbers.length > 0 ? (
                    <div className="space-y-2">
                        {topNumbers.map((item, idx) => {
                            const maxTotal = topNumbers[0]?.total || 1;
                            const pct = (item.total / maxTotal) * 100;
                            const limitResult = checkLimit(item.number, item.type, 0, item.total);
                            const isAtLimit = !limitResult.allowed;
                            const isClickable = isAdmin;

                            return (
                                <div
                                    key={`${item.number}-${item.type}`}
                                    onClick={() => {
                                        if (isClickable) {
                                            setSelectedNumber(item);
                                            setModalOpen(true);
                                        }
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        cursor: isClickable ? 'pointer' : 'default',
                                        padding: '4px',
                                        borderRadius: '8px',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onMouseOver={(e) => {
                                        if (isClickable) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)';
                                    }}
                                    onMouseOut={(e) => {
                                        if (isClickable) e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    {/* Limit warning indicator */}

                                    <Typography
                                        variant="body2"
                                        fontWeight={700}
                                        sx={{ width: 24, textAlign: 'center', color: idx < 3 ? 'warning.main' : 'text.secondary' }}
                                    >
                                        {idx + 1}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{ fontFamily: 'monospace', fontWeight: 800, width: 50 }}
                                    >
                                        {item.number}
                                    </Typography>
                                    <Chip
                                        label={formatBetType(item.type)}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.65rem', height: 20, minWidth: 60 }}
                                    />
                                    <Box sx={{ flex: 1, position: 'relative', height: 24, backgroundColor: 'grey.100', borderRadius: 2, overflow: 'hidden' }}>

                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                bottom: 0,
                                                width: `${pct}%`,
                                                background: isAtLimit
                                                    ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                                                    : idx < 3
                                                        ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                                                        : 'linear-gradient(90deg, #3b82f6, #6366f1)',
                                                borderRadius: 2,
                                                transition: 'width 0.5s ease',
                                            }}
                                        />
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                position: 'absolute',
                                                right: 8,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                fontWeight: 700,
                                                fontFamily: 'monospace',
                                                color: pct > 60 ? 'white' : 'text.primary',
                                                zIndex: 1,
                                            }}
                                        >
                                            {item.total.toLocaleString()} ฿
                                        </Typography>

                                    </Box>
                                    <Typography
                                        variant="body2"
                                        fontWeight={900}
                                        sx={{
                                            width: 18,
                                            textAlign: 'center',
                                            color: 'error.main',
                                            fontSize: '1rem',
                                            visibility: isAtLimit ? 'visible' : 'hidden',
                                        }}
                                    >
                                        !
                                    </Typography>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <Typography color="text.disabled" sx={{ textAlign: 'center', py: 3 }}>
                        ยังไม่มีข้อมูล
                    </Typography>
                )}
            </Paper>

            {/* Number Detail Modal */}
            <Dialog
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                    🔍 รายละเอียด: {selectedNumber?.number}
                    {selectedNumber && (
                        <Chip
                            label={formatBetType(selectedNumber.type)}
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{ fontSize: '0.75rem', height: 24, fontWeight: 700 }}
                        />
                    )}
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    {selectedNumber && (() => {
                        const specificNumbers = numbers.filter(n => n.number === selectedNumber.number && n.type === selectedNumber.type);
                        const totalBetAmount = specificNumbers.reduce((sum, n) => sum + n.amount, 0);
                        const totalPayoutAmount = specificNumbers.filter(n => n.status === 'WIN').reduce((sum, n) => {
                            const odds = settings.defaultOdds[n.type] || 0;
                            const closed = settings.closedNumbers[n.number];
                            const effectiveOdds = closed?.type === 'HALF' ? odds / 2 : odds;
                            return sum + n.amount * effectiveOdds;
                        }, 0);

                        // House perspective
                        const netProfit = totalBetAmount - totalPayoutAmount;
                        const isAllPending = specificNumbers.length > 0 && specificNumbers.every(n => n.status === 'PENDING');

                        return (
                            <>
                                <Box sx={{ p: 2, backgroundColor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {/* <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                        ยอดแทงรวม: {totalBetAmount.toLocaleString()} ฿
                                    </Typography> */}
                                    <Box sx={{ textAlign: 'left' }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>ยอดแทงรวม</Typography>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={800}
                                        >
                                            {totalBetAmount.toLocaleString()} ฿
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>กำไร/ขาดทุน (เจ้ามือ)</Typography>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={800}
                                            color={isAllPending ? 'text.secondary' : netProfit >= 0 ? 'success.main' : 'error.main'}
                                        >
                                            {isAllPending ? '--' : `${netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString()} ฿`}
                                        </Typography>
                                    </Box>
                                </Box>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                                <TableCell sx={{ fontWeight: 700 }}>ลูกค้า (User)</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>จำนวนเงิน</TableCell>
                                                {/* <TableCell align="center" sx={{ fontWeight: 700 }}>สถานะ</TableCell> */}
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>กำไร/ขาดทุน</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {specificNumbers
                                                .sort((a, b) => b.amount - a.amount)
                                                .map((bet, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell sx={{ fontWeight: 600 }}>{bet.userId || bet.customerId || 'Unknown'}</TableCell>
                                                        <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                                            {bet.amount.toLocaleString()} ฿
                                                        </TableCell>
                                                        {/* <TableCell align="center">
                                                            <Chip
                                                                label={bet.status === 'WIN' ? 'ชนะ' : bet.status === 'LOSE' ? 'แพ้' : 'รอผล'}
                                                                size="small"
                                                                color={bet.status === 'WIN' ? 'success' : bet.status === 'LOSE' ? 'error' : 'default'}
                                                                variant="outlined"
                                                                sx={{ fontSize: '0.65rem', height: 20 }}
                                                            />
                                                        </TableCell> */}
                                                        <TableCell align="right">
                                                            {(() => {
                                                                let profit = null;
                                                                if (bet.status === 'WIN') {
                                                                    const odds = settings.defaultOdds[bet.type] || 0;
                                                                    const closed = settings.closedNumbers[bet.number];
                                                                    const effectiveOdds = closed?.type === 'HALF' ? odds / 2 : odds;
                                                                    profit = bet.amount - (bet.amount * effectiveOdds);
                                                                } else if (bet.status === 'LOSE') {
                                                                    profit = bet.amount;
                                                                }

                                                                if (profit === null) {
                                                                    return <Typography variant="body2" color="text.secondary">--</Typography>;
                                                                }
                                                                return (
                                                                    <Typography variant="body2" fontWeight={700} color={profit >= 0 ? 'success.main' : 'error.main'} sx={{ fontFamily: 'monospace' }}>
                                                                        {profit >= 0 ? '+' : ''}{profit.toLocaleString()} ฿
                                                                    </Typography>
                                                                );
                                                            })()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        );
                    })()}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button variant="contained" onClick={() => setModalOpen(false)} sx={{ fontWeight: 700 }}>
                        ปิด
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
