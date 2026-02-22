'use client';

import { useState } from 'react';
import {
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    Divider,
    Chip,
    Box,
    Tabs,
    Tab,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLimits } from '../contexts/LimitContext';
import { useNumbers } from '../contexts/NumberContext';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { formatBetType, BET_TYPES } from '../utils/betParser';

function TabPanel({ children, value, index }) {
    return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

export default function SettingsPage() {
    const {
        settings,
        updateSettings,
        addClosedNumber,
        removeClosedNumber,
        setNumberLimit,
        removeNumberLimit,
    } = useLimits();
    const { clearAll, exportData } = useNumbers();
    const { user } = useAuth();
    const router = useRouter();

    const [tab, setTab] = useState(0);
    const [newClosedNumber, setNewClosedNumber] = useState('');
    const [closedType, setClosedType] = useState('CLOSED');
    const [odds, setOdds] = useState(settings.defaultOdds);
    const [ceilings, setCeilings] = useState(settings.ceilingLimits);
    const [timeSetting, setTimeSetting] = useState(settings.timeSetting || { open: '06:00', close: '14:30' });
    const [announcements, setAnnouncements] = useState(settings.announcements || '');
    const [newLimitNumber, setNewLimitNumber] = useState('');
    const [newLimitAmount, setNewLimitAmount] = useState('');
    const [saved, setSaved] = useState(false);

    if (!user || user.role === 'user') {
        return (
            <Container sx={{ py: 8 }}>
                <Alert severity="error">ไม่มีสิทธิ์เข้าถึง</Alert>
            </Container>
        );
    }

    const handleSave = () => {
        updateSettings({
            defaultOdds: odds,
            ceilingLimits: ceilings,
            timeSetting,
            announcements,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleAddClosed = () => {
        if (newClosedNumber) {
            addClosedNumber(newClosedNumber, closedType);
            setNewClosedNumber('');
        }
    };

    const handleAddNumberLimit = () => {
        if (newLimitNumber && newLimitAmount) {
            setNumberLimit(newLimitNumber, parseInt(newLimitAmount));
            setNewLimitNumber('');
            setNewLimitAmount('');
        }
    };

    const handleExport = async () => {
        const data = exportData();
        const fileName = `lottotrack-export-${new Date().toISOString().slice(0, 10)}.json`;

        // Modern browsers: use File System Access API
        if (window.showSaveFilePicker) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{
                        description: 'JSON File',
                        accept: { 'application/json': ['.json'] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(data);
                await writable.close();
                return;
            } catch (err) {
                if (err.name === 'AbortError') return; // User cancelled
            }
        }

        // Fallback: open blob URL in new window
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const handleClearAll = () => {
        if (confirm('⚠️ ต้องการล้างข้อมูลทั้งหมดจริงหรือไม่? ข้อมูลนี้จะไม่สามารถกู้คืนได้')) {
            clearAll();
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
            <Paper
                elevation={0}
                sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                <Container>
                    <Box sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={() => router.push('/')}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6" fontWeight={800}>
                            ⚙️ ตั้งค่าระบบ
                        </Typography>
                    </Box>
                </Container>
            </Paper>

            <Container sx={{ py: 3 }}>
                <Paper
                    elevation={0}
                    sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}
                >
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ '& .MuiTab-root': { fontWeight: 600, textTransform: 'none' } }}
                    >
                        <Tab label="💰 อัตราจ่าย" />
                        <Tab label="🚫 เลขอั้น/ปิด" />
                        <Tab label="📊 เพดานรับ" />
                        <Tab label="⏰ เวลา/ประกาศ" />
                        <Tab label="🔧 ข้อมูล" />
                    </Tabs>
                </Paper>

                {/* Tab 0: Odds */}
                <TabPanel value={tab} index={0}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 3 }}>
                            อัตราจ่าย (Payout Rate)
                        </Typography>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(odds).map(([type, value]) => (
                                <TextField
                                    key={type}
                                    label={formatBetType(type)}
                                    type="number"
                                    value={value}
                                    onChange={(e) => setOdds(prev => ({ ...prev, [type]: parseFloat(e.target.value) || 0 }))}
                                    fullWidth
                                    size="small"
                                    InputProps={{
                                        startAdornment: <Typography variant="caption" sx={{ mr: 1, color: 'text.secondary' }}>x</Typography>,
                                    }}
                                />
                            ))}
                        </div>
                        <Button variant="contained" onClick={handleSave} fullWidth sx={{ mt: 3, fontWeight: 700 }}>
                            💾 บันทึก
                        </Button>
                    </Paper>
                </TabPanel>

                {/* Tab 1: Closed/Half Numbers */}
                <TabPanel value={tab} index={1}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 3 }}>
                            เลขอั้น / เลขปิด
                        </Typography>
                        <div className="flex gap-2 mb-4 flex-wrap">
                            <TextField
                                label="เลขที่ต้องการ"
                                value={newClosedNumber}
                                onChange={(e) => setNewClosedNumber(e.target.value)}
                                size="small"
                                sx={{ flex: 1, minWidth: 100 }}
                            />
                            <FormControl size="small" sx={{ minWidth: 130 }}>
                                <InputLabel>ประเภท</InputLabel>
                                <Select value={closedType} label="ประเภท" onChange={(e) => setClosedType(e.target.value)}>
                                    <MenuItem value="CLOSED">🔴 ปิด (ไม่รับ)</MenuItem>
                                    <MenuItem value="HALF">🟡 อั้น (จ่ายครึ่ง)</MenuItem>
                                </Select>
                            </FormControl>
                            <Button variant="contained" onClick={handleAddClosed} sx={{ fontWeight: 700 }}>
                                เพิ่ม
                            </Button>
                        </div>

                        <List>
                            {Object.entries(settings.closedNumbers).map(([num, info]) => (
                                <ListItem
                                    key={num}
                                    sx={{
                                        borderRadius: 2,
                                        mb: 0.5,
                                        backgroundColor: info.type === 'CLOSED' ? 'error.50' : 'warning.50',
                                        border: '1px solid',
                                        borderColor: info.type === 'CLOSED' ? 'error.200' : 'warning.200',
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{num}</Typography>
                                        }
                                        secondary={info.type === 'CLOSED' ? '🔴 ปิด (ไม่รับแทง)' : '🟡 อั้น (จ่ายครึ่งราคา)'}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" onClick={() => removeClosedNumber(num)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                            {Object.keys(settings.closedNumbers).length === 0 && (
                                <Typography color="text.disabled" sx={{ textAlign: 'center', py: 3 }}>
                                    ยังไม่มีเลขอั้น/ปิด
                                </Typography>
                            )}
                        </List>
                    </Paper>
                </TabPanel>

                {/* Tab 2: Ceiling Limits */}
                <TabPanel value={tab} index={2}>
                    <div className="space-y-4">
                        {/* Default limits per type */}
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 3 }}>
                                เพดานรับตามประเภท (ค่าเริ่มต้น)
                            </Typography>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {Object.entries(ceilings).map(([type, value]) => (
                                    <TextField
                                        key={type}
                                        label={formatBetType(type)}
                                        type="number"
                                        value={value}
                                        onChange={(e) => setCeilings(prev => ({ ...prev, [type]: parseInt(e.target.value) || 0 }))}
                                        fullWidth
                                        size="small"
                                        InputProps={{
                                            endAdornment: <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>฿</Typography>,
                                        }}
                                    />
                                ))}
                            </div>
                            <Button variant="contained" onClick={handleSave} fullWidth sx={{ mt: 3, fontWeight: 700 }}>
                                💾 บันทึก
                            </Button>
                        </Paper>

                        {/* Per-number limits */}
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 3 }}>
                                เพดานรับรายเลข (เฉพาะเลข)
                            </Typography>
                            <div className="flex gap-2 mb-4 flex-wrap">
                                <TextField
                                    label="เลข"
                                    value={newLimitNumber}
                                    onChange={(e) => setNewLimitNumber(e.target.value)}
                                    size="small"
                                    sx={{ flex: 1, minWidth: 80 }}
                                />
                                <TextField
                                    label="วงเงินสูงสุด (฿)"
                                    type="number"
                                    value={newLimitAmount}
                                    onChange={(e) => setNewLimitAmount(e.target.value)}
                                    size="small"
                                    sx={{ flex: 1, minWidth: 120 }}
                                />
                                <Button variant="contained" onClick={handleAddNumberLimit} sx={{ fontWeight: 700 }}>
                                    เพิ่ม
                                </Button>
                            </div>
                            <List>
                                {Object.entries(settings.numberLimits || {}).map(([num, info]) => (
                                    <ListItem
                                        key={num}
                                        sx={{
                                            borderRadius: 2,
                                            mb: 0.5,
                                            backgroundColor: 'info.50',
                                            border: '1px solid',
                                            borderColor: 'info.200',
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Typography sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{num}</Typography>
                                            }
                                            secondary={`สูงสุด: ${info.maxAmount?.toLocaleString()} ฿`}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton edge="end" onClick={() => removeNumberLimit(num)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                                {Object.keys(settings.numberLimits || {}).length === 0 && (
                                    <Typography color="text.disabled" sx={{ textAlign: 'center', py: 3 }}>
                                        ยังไม่มีเพดานรายเลข (ใช้ค่าเริ่มต้นตามประเภท)
                                    </Typography>
                                )}
                            </List>
                        </Paper>
                    </div>
                </TabPanel>

                {/* Tab 3: Time & Announcements */}
                <TabPanel value={tab} index={3}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 3 }}>
                            เวลาเปิด/ปิด รับแทง
                        </Typography>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <TextField
                                label="เวลาเปิดรับ"
                                type="time"
                                value={timeSetting.open}
                                onChange={(e) => setTimeSetting(prev => ({ ...prev, open: e.target.value }))}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="เวลาปิดรับ"
                                type="time"
                                value={timeSetting.close}
                                onChange={(e) => setTimeSetting(prev => ({ ...prev, close: e.target.value }))}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </div>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                            📢 ข้อความประกาศ
                        </Typography>
                        <TextField
                            label="ข้อความประกาศ (แสดงบน Dashboard)"
                            value={announcements}
                            onChange={(e) => setAnnouncements(e.target.value)}
                            fullWidth
                            multiline
                            rows={2}
                            sx={{ mb: 3 }}
                        />

                        <Button variant="contained" onClick={handleSave} fullWidth sx={{ fontWeight: 700 }}>
                            💾 บันทึก
                        </Button>
                    </Paper>
                </TabPanel>

                {/* Tab 4: Data Management */}
                <TabPanel value={tab} index={4}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 3 }}>
                            จัดการข้อมูล
                        </Typography>
                        <div className="space-y-3">
                            <Button
                                variant="outlined"
                                color="primary"
                                fullWidth
                                onClick={handleExport}
                                sx={{ fontWeight: 600, py: 1.5 }}
                            >
                                📥 Export ข้อมูล (JSON)
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                fullWidth
                                onClick={handleClearAll}
                                sx={{ fontWeight: 600, py: 1.5 }}
                            >
                                🗑️ ล้างข้อมูลทั้งหมด (เริ่มงวดใหม่)
                            </Button>
                        </div>
                    </Paper>
                </TabPanel>

                {saved && (
                    <Alert severity="success" sx={{ mt: 3, borderRadius: 2 }}>
                        ✅ บันทึกสำเร็จ!
                    </Alert>
                )}
            </Container>
        </Box>
    );
}
