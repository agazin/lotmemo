'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Typography,
    TextField,
    Paper,
    Box,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    InputAdornment,
    Collapse,
    IconButton,
    Button,
    Tooltip,
    Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import { useNumbers } from '../../contexts/NumberContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatBetType } from '../../utils/betParser';

export default function TicketsPage() {
    const router = useRouter();
    const { numbers } = useNumbers();
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [expandedCustomer, setExpandedCustomer] = useState(null);

    // Filter numbers by user
    const isAdmin = user?.role === 'admin' || user?.role === 'superuser';
    const filteredNumbers = isAdmin ? numbers : numbers.filter(n => n.userId === user?.username);

    // Group records by customerId
    const customers = useMemo(() => {
        const map = {};
        filteredNumbers.forEach(record => {
            const cid = record.customerId || 'unknown';
            if (!map[cid]) {
                map[cid] = { customerId: cid, records: [], totalAmount: 0, totalWinAmount: 0 };
            }
            map[cid].records.push(record);
            map[cid].totalAmount += record.amount;
            if (record.status === 'WIN' && record.payout) {
                map[cid].totalWinAmount += record.payout;
            }
        });
        return Object.values(map).sort((a, b) => b.totalAmount - a.totalAmount);
    }, [filteredNumbers]);

    // Filter by search
    const filtered = useMemo(() => {
        if (!search.trim()) return customers;
        const q = search.trim().toLowerCase();
        return customers.filter(c =>
            String(c.customerId).toLowerCase().includes(q) ||
            c.records.some(r => String(r.number).includes(q))
        );
    }, [customers, search]);

    // Auto-expand single customer
    useEffect(() => {
        if (filtered.length === 1 && expandedCustomer !== filtered[0].customerId) {
            setExpandedCustomer(filtered[0].customerId);
        }
    }, [filtered, expandedCustomer]);

    const toggleExpand = (cid) => {
        setExpandedCustomer(prev => prev === cid ? null : cid);
    };

    return (
        <>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 3, color: 'text.primary' }}>
                📑 ใบโพย / ประวัติลูกค้า
            </Typography>

            {/* Search */}
            <Paper
                elevation={0}
                sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}
            >
                <TextField
                    placeholder="ค้นหา Customer ID หรือเลขที่แทง..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    fullWidth
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ '& input': { fontWeight: 500 } }}
                />
            </Paper>

            {/* Customer list */}
            {filtered.length > 0 ? (
                <div className="space-y-3">
                    {filtered.map((customer) => {
                        const isExpanded = expandedCustomer === customer.customerId;
                        const winCount = customer.records.filter(r => r.status === 'WIN').length;
                        const pendingCount = customer.records.filter(r => r.status === 'PENDING').length;

                        return (
                            <Paper
                                key={customer.customerId}
                                elevation={0}
                                sx={{
                                    borderRadius: 3,
                                    border: '1px solid',
                                    borderColor: isExpanded ? 'primary.300' : 'divider',
                                    overflow: 'hidden',
                                    transition: 'border-color 0.2s ease',
                                    backgroundColor: 'background.paper',
                                }}
                            >
                                {/* Customer header */}
                                <Box
                                    onClick={() => toggleExpand(customer.customerId)}
                                    sx={{
                                        p: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        '&:hover': { backgroundColor: 'action.hover' },
                                        transition: 'background-color 0.15s ease',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 800,
                                                fontSize: '0.9rem',
                                                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                                color: 'white',
                                            }}
                                        >
                                            {String(customer.customerId).slice(0, 2).toUpperCase()}
                                        </Box>
                                        <Box>
                                            <Typography variant="body1" fontWeight={700}>
                                                {customer.customerId}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                                <Chip
                                                    label={`${customer.records.length} รายการ`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ height: 20, fontSize: '0.65rem' }}
                                                />
                                                {winCount > 0 && (
                                                    <Chip
                                                        label={`ชนะ ${winCount}`}
                                                        size="small"
                                                        color="success"
                                                        sx={{ height: 20, fontSize: '0.65rem' }}
                                                    />
                                                )}
                                                {pendingCount > 0 && (
                                                    <Chip
                                                        label={`รอผล ${pendingCount}`}
                                                        size="small"
                                                        color="warning"
                                                        variant="outlined"
                                                        sx={{ height: 20, fontSize: '0.65rem' }}
                                                    />
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {customer.totalWinAmount > 0 && (
                                            <>
                                                <Box sx={{ textAlign: 'right', mr: 1 }}>
                                                    <Typography variant="body2" color="success.main" sx={{ lineHeight: 1, fontWeight: 700 }}>ถูกรางวัล</Typography>
                                                    <Typography variant="h6" fontWeight={800} color="success.dark" sx={{ fontFamily: 'monospace', lineHeight: 1.2 }}>
                                                        {customer.totalWinAmount.toLocaleString()} <span className="text-sm">฿</span>
                                                    </Typography>
                                                </Box>
                                                <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />
                                            </>
                                        )}
                                        <Box sx={{ textAlign: 'right', mr: 1 }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1 }}>ยอดแทง</Typography>
                                            <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ fontFamily: 'monospace', lineHeight: 1.2 }}>
                                                {customer.totalAmount.toLocaleString()} <span className="text-sm">฿</span>
                                            </Typography>
                                        </Box>

                                        {customer.totalWinAmount > 0 && (() => {
                                            const netBalance = customer.totalAmount - customer.totalWinAmount;
                                            const isLoss = netBalance < 0;
                                            const displayValue = netBalance > 0 ? `+${netBalance.toLocaleString()}` : netBalance.toLocaleString();
                                            const color = isLoss ? 'error.main' : 'success.main';
                                            return (
                                                <>
                                                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />
                                                    <Box sx={{ textAlign: 'right', mr: 1 }}>
                                                        <Typography variant="body2" color={color} sx={{ lineHeight: 1, fontWeight: 700 }}>ยอดสุทธิ</Typography>
                                                        <Typography variant="h6" fontWeight={800} color={color} sx={{ fontFamily: 'monospace', lineHeight: 1.2 }}>
                                                            {displayValue} <span className="text-sm">฿</span>
                                                        </Typography>
                                                    </Box>
                                                </>
                                            );
                                        })()}

                                        <Tooltip title="แก้ไข / เพิ่มรายการ">
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/entry?customer=${encodeURIComponent(customer.customerId)}`);
                                                }}
                                                sx={{
                                                    backgroundColor: 'primary.50',
                                                    '&:hover': { backgroundColor: 'primary.100' },
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <IconButton size="small">
                                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        </IconButton>
                                    </Box>
                                </Box>

                                {/* Expanded detail */}
                                <Collapse in={isExpanded}>
                                    <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                                        <TableCell sx={{ fontWeight: 700 }}>เลข</TableCell>
                                                        <TableCell sx={{ fontWeight: 700 }}>ประเภท</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 700 }}>จำนวนเงิน</TableCell>
                                                        <TableCell sx={{ fontWeight: 700 }}>สถานะ</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 700 }}>เวลา</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {customer.records.map((record) => (
                                                        <TableRow key={record.id} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                                                            <TableCell>
                                                                <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1rem' }}>
                                                                    {record.number}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={formatBetType(record.type)}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="primary"
                                                                    sx={{ fontSize: '0.7rem', height: 22 }}
                                                                />
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Typography sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                                                    {record.amount.toLocaleString()} ฿
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={
                                                                        record.status === 'WIN' ? '🏆 ชนะ' :
                                                                            record.status === 'LOSE' ? '❌ แพ้' :
                                                                                '⏳ รอผล'
                                                                    }
                                                                    size="small"
                                                                    color={
                                                                        record.status === 'WIN' ? 'success' :
                                                                            record.status === 'LOSE' ? 'error' :
                                                                                'default'
                                                                    }
                                                                    variant={record.status === 'PENDING' ? 'outlined' : 'filled'}
                                                                    sx={{ fontSize: '0.65rem', height: 22 }}
                                                                />
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {new Date(record.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>

                                        {/* Summary */}
                                        <Box
                                            sx={{
                                                p: 2,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                backgroundColor: 'action.hover',
                                            }}
                                        >
                                            <Typography variant="body2" fontWeight={600}>
                                                รวม {customer.records.length} รายการ
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                                <Typography variant="body1" fontWeight={800} color="primary.main" sx={{ fontFamily: 'monospace' }}>
                                                    ยอดแทง: {customer.totalAmount.toLocaleString()} ฿
                                                </Typography>
                                                {customer.totalWinAmount > 0 && (
                                                    <Typography variant="body1" fontWeight={800} color="success.dark" sx={{ fontFamily: 'monospace' }}>
                                                        ต้องจ่าย: {customer.totalWinAmount.toLocaleString()} ฿
                                                    </Typography>
                                                )}
                                                {customer.totalWinAmount > 0 && (() => {
                                                    const netBalance = customer.totalAmount - customer.totalWinAmount;
                                                    const isLoss = netBalance < 0;
                                                    const displayValue = netBalance > 0 ? `+${netBalance.toLocaleString()}` : netBalance.toLocaleString();
                                                    const color = isLoss ? 'error.main' : 'success.main';
                                                    return (
                                                        <Typography variant="body1" fontWeight={800} color={color} sx={{ fontFamily: 'monospace' }}>
                                                            ยอดสุทธิ: {displayValue} ฿
                                                        </Typography>
                                                    );
                                                })()}
                                            </Box>
                                        </Box>
                                    </Box>
                                </Collapse>
                            </Paper>
                        );
                    })}
                </div >
            ) : (
                <Paper
                    elevation={0}
                    sx={{
                        p: 6,
                        borderRadius: 3,
                        border: '1px dashed',
                        borderColor: 'divider',
                        textAlign: 'center',
                        backgroundColor: 'background.paper',
                    }}
                >
                    <Typography color="text.disabled">
                        {search ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูลใบโพย'}
                    </Typography>
                </Paper>
            )
            }
        </>
    );
}
