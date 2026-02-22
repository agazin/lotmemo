'use client';

import { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Divider,
    Box,
} from '@mui/material';
import { useNumbers } from '../contexts/NumberContext';
import { useLimits } from '../contexts/LimitContext';
import { formatBetType } from '../utils/betParser';

export default function ResultEntry() {
    const [results, setResults] = useState({
        threeTop: '',       // 3 ตัวบน
        threeBottom: '',    // 3 ตัวล่าง สองตัวท้าย 2 bottom
        twoTop: '',         // 2 ตัวบน สองตัวหน้า
        threeFront: '',     // 3 ตัวหน้า
    });
    const { numbers, applyGrading, latestResults } = useNumbers();
    const { settings } = useLimits();

    // Sync input fields with latestResults on load
    useEffect(() => {
        if (latestResults) {
            setResults(latestResults);
        }
    }, [latestResults]);

    // Derive winner summary from numbers state directly
    const winners = numbers.filter(n => n.status === 'WIN');
    const totalPayout = winners.reduce((sum, n) => sum + n.payout, 0);
    const hasResults = !!latestResults;

    const handleChange = (field, value) => {
        // Only allow digits
        const clean = value.replace(/\D/g, '');
        setResults(prev => ({ ...prev, [field]: clean }));
    };

    const handleGrade = () => {
        if (!results.threeTop || results.threeTop.length !== 3) {
            alert('กรุณากรอก 3 ตัวบน (3 หลัก)');
            return;
        }

        const threeTop = results.threeTop;
        const twoBottom = threeTop.slice(-2);       // 2 ตัวล่าง = 2 หลักท้ายของ 3 ตัวบน
        const twoTop = results.twoTop || '';        // 2 ตัวบน (ป้อนแยก)
        const threeFront = results.threeFront || '';
        const runTop = threeTop[2];                 // เลขวิ่งบน = หลักหน่วยของ 3 ตัวบน
        const runBottom = twoBottom[1];             // เลขวิ่งล่าง = หลักหน่วยของ 2 ตัวล่าง

        // Generate toad permutations of threeTop
        const toadPerms = new Set();
        const digits = threeTop.split('');
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 3; k++) {
                    if (i !== j && j !== k && i !== k) {
                        toadPerms.add(digits[i] + digits[j] + digits[k]);
                    }
                }
            }
        }

        // Re-grade ALL records (except REJECTED)
        const gradedNumbers = numbers.map(record => {
            if (record.status === 'REJECTED') return record;

            let isWin = false;
            let odds = settings.defaultOdds[record.type] || 0;

            // Check if this number has half-price (เลขอั้น)
            const closed = settings.closedNumbers[record.number];
            if (closed?.type === 'HALF') {
                odds = odds / 2;
            }

            switch (record.type) {
                case '3TOP':
                    isWin = record.number === threeTop;
                    break;
                case '3TOAD':
                    isWin = toadPerms.has(record.number);
                    break;
                case '3BOTTOM':
                    isWin = record.number === (results.threeBottom || '');
                    break;
                case '3FRONT':
                    isWin = record.number === threeFront;
                    break;
                case '2TOP':
                    isWin = record.number === twoTop;
                    break;
                case '2BOTTOM':
                    isWin = record.number === twoBottom;
                    break;
                case 'RUNNING_TOP':
                    isWin = record.number === runTop;
                    break;
                case 'RUNNING_BOTTOM':
                    isWin = record.number === runBottom;
                    break;
                default:
                    break;
            }

            if (isWin) {
                const payout = record.amount * odds;
                return { ...record, status: 'WIN', odds, payout };
            } else {
                return { ...record, status: 'LOSE', odds: null, payout: 0 };
            }
        });

        // Apply bulk update and save the results
        applyGrading(gradedNumbers, results);
    };

    const totalBetAmount = numbers.filter(n => n.status === 'PENDING').reduce((s, n) => s + n.amount, 0);

    return (
        <div className="space-y-4">
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                    🎰 กรอกผลรางวัล
                </Typography>

                <div className="grid grid-cols-2 gap-3">
                    <TextField
                        label="3 ตัวบน"
                        value={results.threeTop}
                        onChange={(e) => handleChange('threeTop', e.target.value)}
                        inputProps={{ maxLength: 3 }}
                        fullWidth
                        required
                        sx={{ '& input': { fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.2em' } }}
                    />
                    <TextField
                        label="3 ตัวล่าง"
                        value={results.threeBottom}
                        onChange={(e) => handleChange('threeBottom', e.target.value)}
                        inputProps={{ maxLength: 3 }}
                        fullWidth
                        sx={{ '& input': { fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.2em' } }}
                    />
                    <TextField
                        label="2 ตัวบน"
                        value={results.twoTop}
                        onChange={(e) => handleChange('twoTop', e.target.value)}
                        inputProps={{ maxLength: 2 }}
                        fullWidth
                        sx={{ '& input': { fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.2em' } }}
                    />
                    <TextField
                        label="3 ตัวหน้า"
                        value={results.threeFront}
                        onChange={(e) => handleChange('threeFront', e.target.value)}
                        inputProps={{ maxLength: 3 }}
                        fullWidth
                        sx={{ '& input': { fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.2em' } }}
                    />
                </div>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        รายการรอผล: {numbers.filter(n => n.status === 'PENDING').length} รายการ
                        ({totalBetAmount.toLocaleString()} ฿)
                    </Typography>
                    <Button
                        variant="contained"
                        color={hasResults ? "warning" : "primary"}
                        onClick={handleGrade}
                        size="large"
                        sx={{ px: 4, fontWeight: 700 }}
                    >
                        {hasResults ? '💾 บันทึกและคำนวณใหม่' : '🔍 ตรวจผล'}
                    </Button>
                </Box>
            </Paper>

            {/* Winners */}
            {hasResults && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: winners.length > 0 ? 'success.300' : 'divider',
                        background: winners.length > 0
                            ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)'
                            : undefined,
                    }}
                >
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                        🏆 ผลการตรวจ (ยอดล่าสุด)
                    </Typography>

                    {winners.length > 0 ? (
                        <>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>เลข</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>ประเภท</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700 }}>แทง</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700 }}>อัตราจ่าย</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700 }}>เงินรางวัล</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {winners.map((w) => (
                                            <TableRow key={w.id}>
                                                <TableCell>
                                                    <Typography sx={{ fontFamily: 'monospace', fontWeight: 800 }}>
                                                        {w.number}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={formatBetType(w.type)} size="small" color="success" />
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                                                    {w.amount.toLocaleString()} ฿
                                                </TableCell>
                                                <TableCell align="right">x{w.odds}</TableCell>
                                                <TableCell align="right">
                                                    <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'success.dark' }}>
                                                        {w.payout.toLocaleString()} ฿
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body1" fontWeight={700}>
                                    ต้องจ่ายทั้งหมด
                                </Typography>
                                <Typography variant="h5" fontWeight={800} color="error.main">
                                    {totalPayout.toLocaleString()} ฿
                                </Typography>
                            </Box>
                        </>
                    ) : (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            ไม่มีรายการที่ถูกรางวัล 🎉 ล่ะผลกำไร!
                        </Alert>
                    )}
                </Paper>
            )}
        </div>
    );
}
