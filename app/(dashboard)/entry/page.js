'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useNumbers } from '../../contexts/NumberContext';
import {
    Typography,
    TextField,
    Paper,
    Box,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import HistoryIcon from '@mui/icons-material/History';
import NumberRecordForm from '../../components/NumberRecordForm';
import { formatBetType } from '../../utils/betParser';

export default function EntryPage() {
    const { user } = useAuth();
    const { addNumber, numbers } = useNumbers();
    const router = useRouter();
    const searchParams = useSearchParams();
    const customerFromUrl = searchParams.get('customer') || '';
    const [customerId, setCustomerId] = useState(user?.role === 'user' ? user.username : customerFromUrl);

    // Draft state
    const [draftBets, setDraftBets] = useState([]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [savedOpen, setSavedOpen] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isCreatingNew, setIsCreatingNew] = useState(false);

    if (!user) return null;

    const isAdmin = user.role === 'admin' || user.role === 'superuser';

    // Existing saved bets for this customer
    const savedBets = useMemo(() =>
        numbers.filter(n => n.customerId === customerId),
        [numbers, customerId]
    );

    // Draft total
    const draftTotal = draftBets.reduce((sum, b) => sum + b.amount, 0);

    // Called by NumberRecordForm when user presses ✓ on keypad
    const handleAddToDraft = (bets) => {
        const newBets = bets.map((bet, i) => ({
            ...bet,
            _draftId: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
        }));
        setDraftBets(prev => [...prev, ...newBets]);
    };

    const handleDeleteDraft = (draftId) => {
        setDraftBets(prev => prev.filter(b => b._draftId !== draftId));
    };

    // Save: commit all drafts to the main store
    const handleSave = () => {
        draftBets.forEach(bet => {
            addNumber({
                number: bet.number,
                type: bet.type,
                amount: bet.amount,
                customerId: bet.customerId,
                userId: user.username,
            });
        });
        setDraftBets([]);
        setConfirmOpen(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    // Cancel: discard all drafts
    const handleCancel = () => {
        setDraftBets([]);
    };

    return (
        <>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 3, color: 'text.primary' }}>
                ⌨️ คีย์ข้อมูล
            </Typography>

            {/* Customer selector */}
            {isAdmin && (
                <Paper
                    elevation={0}
                    sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}
                >
                    <TextField
                        label="Customer ID / ชื่อลูกค้า"
                        value={customerId}
                        onChange={(e) => {
                            setCustomerId(e.target.value);
                            setDraftBets([]);
                            setIsCreatingNew(false);
                        }}
                        fullWidth
                        size="small"
                        sx={{ '& input': { fontWeight: 600 } }}
                    />
                </Paper>
            )}

            {customerId ? (
                <div className="space-y-4">
                    {/* Keypad + parser */}
                    {savedBets.length > 0 || isCreatingNew || user?.role === 'user' ? (
                        <>
                            <NumberRecordForm customerId={customerId} onSubmitBets={handleAddToDraft} />

                            {/* ─── Draft staging area ─── */}
                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: 3,
                                    border: '2px solid',
                                    borderColor: draftBets.length > 0 ? 'warning.main' : 'divider',
                                    overflow: 'hidden',
                                    backgroundColor: 'background.paper',
                                    transition: 'border-color 0.3s ease',
                                }}
                            >
                                <Box sx={{
                                    p: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: draftBets.length > 0 ? 'rgba(251,191,36,0.08)' : 'transparent',
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="subtitle1" fontWeight={700}>
                                            📝 รายการรอบันทึก
                                        </Typography>
                                        {draftBets.length > 0 && (
                                            <Chip
                                                label={`${draftBets.length} รายการ`}
                                                size="small"
                                                color="warning"
                                                sx={{ fontWeight: 700 }}
                                            />
                                        )}
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {savedBets.length > 0 && (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<HistoryIcon />}
                                                onClick={() => setSavedOpen(true)}
                                                sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'none' }}
                                            >
                                                ดูที่บันทึกแล้ว ({savedBets.length})
                                            </Button>
                                        )}
                                        {draftBets.length > 0 && (
                                            <Typography variant="h6" fontWeight={800} sx={{ fontFamily: 'monospace', color: 'warning.dark' }}>
                                                {draftTotal.toLocaleString()} ฿
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                {draftBets.length > 0 ? (
                                    <>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                                        <TableCell sx={{ fontWeight: 700 }}>เลข</TableCell>
                                                        <TableCell sx={{ fontWeight: 700 }}>ประเภท</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 700 }}>จำนวนเงิน</TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: 700, width: 60 }}>ลบ</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {draftBets.map((bet) => (
                                                        <TableRow key={bet._draftId} sx={{
                                                            '&:hover': { backgroundColor: 'action.hover' },
                                                            animation: 'fadeIn 0.3s ease',
                                                            '@keyframes fadeIn': { from: { opacity: 0, transform: 'translateY(-4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
                                                        }}>
                                                            <TableCell>
                                                                <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1rem' }}>
                                                                    {bet.number}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={formatBetType(bet.type)}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="primary"
                                                                    sx={{ fontSize: '0.7rem', height: 22 }}
                                                                />
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Typography sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                                                    {bet.amount.toLocaleString()} ฿
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleDeleteDraft(bet._draftId)}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>

                                        {/* Save / Cancel buttons */}
                                        <Box sx={{ p: 2, display: 'flex', gap: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                startIcon={<SaveIcon />}
                                                onClick={() => setConfirmOpen(true)}
                                                fullWidth
                                                sx={{ fontWeight: 700, py: 1.2 }}
                                            >
                                                � บันทึกลงโพย
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                startIcon={<CancelIcon />}
                                                onClick={handleCancel}
                                                fullWidth
                                                sx={{ fontWeight: 700, py: 1.2 }}
                                            >
                                                ❌ ยกเลิก
                                            </Button>
                                        </Box>
                                    </>
                                ) : (
                                    <Box sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography color="text.disabled">
                                            ยังไม่มีรายการ — ใช้ keypad ด้านบนเพื่อเพิ่มเลข
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>
                        </>
                    ) : (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                borderRadius: 3,
                                border: '1px dashed',
                                borderColor: 'primary.main',
                                textAlign: 'center',
                                backgroundColor: 'primary.50',
                            }}
                        >
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => setIsCreatingNew(true)}
                                sx={{ fontWeight: 800, fontSize: '1.1rem', px: 4, py: 1.5, borderRadius: 2 }}
                            >
                                📝 สร้างโพยของ {customerId}
                            </Button>
                        </Paper>
                    )}

                    {saved && (
                        <Alert severity="success" sx={{ borderRadius: 2 }}>
                            ✅ บันทึกลงโพยเรียบร้อย!
                        </Alert>
                    )}


                </div>
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
                        กรุณาใส่ Customer ID เพื่อเริ่มคีย์ข้อมูล
                    </Typography>
                </Paper>
            )}

            {/* ─── Confirmation Dialog ─── */}
            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>
                    📋 ยืนยันบันทึกลงโพย
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            ลูกค้า: <strong>{customerId}</strong>
                        </Typography>
                    </Box>

                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                    <TableCell sx={{ fontWeight: 700 }}>เลข</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>ประเภท</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>จำนวนเงิน</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {draftBets.map((bet) => (
                                    <TableRow key={bet._draftId}>
                                        <TableCell>
                                            <Typography sx={{ fontFamily: 'monospace', fontWeight: 800 }}>
                                                {bet.number}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={formatBetType(bet.type)}
                                                size="small"
                                                variant="outlined"
                                                color="primary"
                                                sx={{ fontSize: '0.7rem', height: 22 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                                {bet.amount.toLocaleString()} ฿
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
                            รวม {draftBets.length} รายการ
                        </Typography>
                        <Typography variant="h5" fontWeight={900} color="primary.main" sx={{ fontFamily: 'monospace' }}>
                            {draftTotal.toLocaleString()} ฿
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setConfirmOpen(false)}
                        sx={{ fontWeight: 600 }}
                    >
                        กลับไปแก้ไข
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleSave}
                        startIcon={<SaveIcon />}
                        sx={{ fontWeight: 700, px: 4 }}
                    >
                        ✅ ยืนยัน — บันทึกลงโพย
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ─── Saved Records Modal ─── */}
            <Dialog
                open={savedOpen}
                onClose={() => setSavedOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    ✅ รายการที่บันทึกแล้ว
                    <Chip
                        label={`${savedBets.length} รายการ — ${savedBets.reduce((s, b) => s + b.amount, 0).toLocaleString()} ฿`}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                    />
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                    <TableCell sx={{ fontWeight: 700 }}>เลข</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>ประเภท</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>จำนวนเงิน</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>เวลา</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {savedBets.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>
                                            <Typography sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                                                {record.number}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={formatBetType(record.type)}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontSize: '0.7rem', height: 22 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                                {record.amount.toLocaleString()} ฿
                                            </Typography>
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
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setSavedOpen(false)}
                        sx={{ fontWeight: 600 }}
                    >
                        ปิด
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
