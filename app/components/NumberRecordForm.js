'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  Paper,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNumbers } from '../contexts/NumberContext';
import { useLimits } from '../contexts/LimitContext';
import { useAuth } from '../contexts/AuthContext';
import Keypad from './Keypad';
import { parseBet, formatBetType } from '../utils/betParser';

export default function NumberRecordForm({ customerId, onSubmitBets }) {
  const [input, setInput] = useState('');
  const [shortcutMode, setShortcutMode] = useState('normal');
  const [parsedBets, setParsedBets] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [limitConfirmOpen, setLimitConfirmOpen] = useState(false);
  const [pendingBets, setPendingBets] = useState([]);
  const [limitErrors, setLimitErrors] = useState([]);
  const { addNumber, numbers } = useNumbers();
  const { checkLimit, settings } = useLimits();
  const { user } = useAuth();
  const inputRef = useRef(null);

  // Build the effective input by combining shortcut prefix + raw input
  const getEffectiveInput = (rawInput, mode) => {
    if (mode === 'normal') return rawInput;
    return `*${mode}${rawInput}`;
  };

  // Auto-parse on input change
  useEffect(() => {
    const effective = getEffectiveInput(input, shortcutMode);
    const bets = parseBet(effective);

    if (bets && bets.length > 0) {
      setParsedBets(bets);
      setError('');

      // Real-time validation: check each bet
      const newWarnings = [];
      for (const bet of bets) {
        // Calculate current total for this number+type
        const currentTotal = numbers
          .filter(n => n.number === bet.number && n.type === bet.type)
          .reduce((sum, n) => sum + n.amount, 0);

        const result = checkLimit(bet.number, bet.type, bet.amount, currentTotal);
        if (!result.allowed) {
          newWarnings.push({ number: bet.number, type: bet.type, message: result.reason, severity: 'error' });
        } else if (result.warning) {
          newWarnings.push({ number: bet.number, type: bet.type, message: result.warning, severity: 'warning' });
        }
      }
      setWarnings(newWarnings);
    } else {
      setParsedBets([]);
      setWarnings([]);
    }
  }, [input, shortcutMode, numbers, settings]);

  const handleKeyPress = (key) => {
    setInput(prev => prev + key);
    setSuccess(false);
  };

  const handleDelete = () => {
    setInput(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setInput('');
    setParsedBets([]);
    setWarnings([]);
    setError('');
    setShortcutMode('normal');
  };

  const handleShortcutChange = (mode) => {
    setShortcutMode(mode);
  };

  // Shared logic to actually commit bets
  const commitBets = (bets) => {
    try {
      if (onSubmitBets) {
        onSubmitBets(bets.map(bet => ({
          number: bet.number,
          type: bet.type,
          amount: bet.amount,
          customerId,
        })));
      } else {
        bets.forEach(bet => {
          addNumber({
            number: bet.number,
            type: bet.type,
            amount: bet.amount,
            customerId,
            userId: user.username,
          });
        });
      }
      setSuccess(true);
      handleClear();
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!parsedBets.length) {
      setError('รูปแบบไม่ถูกต้อง');
      return;
    }

    // Check for limit errors
    const errors = warnings.filter(w => w.severity === 'error');
    if (errors.length > 0) {
      // Show confirmation modal instead of blocking
      setLimitErrors(errors);
      setPendingBets([...parsedBets]);
      setLimitConfirmOpen(true);
      return;
    }

    commitBets(parsedBets);
  };

  // User confirmed adding despite limits
  const handleLimitConfirm = () => {
    setLimitConfirmOpen(false);
    commitBets(pendingBets);
    setPendingBets([]);
    setLimitErrors([]);
  };

  const totalAmount = parsedBets.reduce((sum, bet) => sum + bet.amount, 0);
  const hasErrors = warnings.some(w => w.severity === 'error');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left Column: Input & Keypad */}
      <div className="space-y-4">
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,247,250,0.95) 100%)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, color: 'text.primary' }}>
            ⌨️ คีย์ข้อมูล
          </Typography>

          {/* Display - editable input */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              backgroundColor: '#1a1a2e',
              minHeight: 60,
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {shortcutMode !== 'normal' && (
              <Chip
                label={shortcutMode}
                size="small"
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: 8,
                  fontSize: '0.65rem',
                  height: 22,
                  backgroundColor: 'rgba(22, 242, 179, 0.2)',
                  color: '#16f2b3',
                  border: '1px solid rgba(22, 242, 179, 0.4)',
                }}
              />
            )}
            <input
              ref={inputRef}
              type="text"
              inputMode="text"
              value={input}
              onChange={(e) => {
                const filtered = e.target.value.replace(/[^0-9=x;]/g, '');
                setInput(filtered);
                setSuccess(false);
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              placeholder="0"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#16f2b3',
                fontFamily: 'monospace',
                fontSize: '1.6rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textAlign: 'right',
                caretColor: '#16f2b3',
              }}
            />
          </Paper>

          <Keypad
            onKeyPress={handleKeyPress}
            onDelete={handleDelete}
            onClear={handleClear}
            onSubmit={handleSubmit}
            onShortcut={handleShortcutChange}
          />
        </Paper>
      </div>

      {/* Right Column: Preview & Validation */}
      <div className="space-y-4">
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,247,250,0.95) 100%)',
            border: '1px solid',
            borderColor: 'divider',
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, color: 'text.primary' }}>
            👁️ ตัวอย่างรายการ ({parsedBets.length} รายการ)
          </Typography>

          {parsedBets.length > 0 ? (
            <>
              {/* Scrollable bet list */}
              <div style={{ flex: 1, maxHeight: 440, overflowY: 'auto', marginBottom: 8 }}>
                {parsedBets.map((bet, index) => {
                  const warn = warnings.find(w => w.number === bet.number && w.type === bet.type);
                  return (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        borderRadius: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: warn
                          ? warn.severity === 'error'
                            ? 'error.50'
                            : 'warning.50'
                          : 'action.hover',
                        border: '1px solid',
                        borderColor: warn
                          ? warn.severity === 'error'
                            ? 'error.200'
                            : 'warning.200'
                          : 'divider',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Typography
                          variant="h6"
                          fontWeight={800}
                          sx={{
                            fontFamily: 'monospace',
                            color: warn?.severity === 'error' ? 'error.main' : 'primary.main',
                          }}
                        >
                          {bet.number}
                        </Typography>
                        <Chip
                          label={formatBetType(bet.type)}
                          size="small"
                          sx={{ fontSize: '0.7rem', height: 24 }}
                          color={warn?.severity === 'error' ? 'error' : 'primary'}
                          variant="outlined"
                        />
                      </div>
                      <Typography
                        variant="body1"
                        fontWeight={700}
                        sx={{ fontFamily: 'monospace', color: 'text.primary' }}
                      >
                        {bet.amount.toLocaleString()} ฿
                      </Typography>
                    </Paper>
                  );
                })}
              </div>

              {/* Warnings */}
              {warnings.map((w, i) => (
                <Alert key={i} severity={w.severity} sx={{ mb: 1, borderRadius: 2 }}>
                  <strong>{w.number}</strong> ({formatBetType(w.type)}): {w.message}
                </Alert>
              ))}

              {/* Total — always at bottom */}
              <Paper
                elevation={0}
                sx={{
                  mt: 'auto',
                  p: 2,
                  borderRadius: 2,
                  background: hasErrors
                    ? 'linear-gradient(135deg, #fef2f2, #fee2e2)'
                    : 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="subtitle1" fontWeight={700}>
                  รวมทั้งหมด
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ color: hasErrors ? 'error.main' : 'success.dark' }}
                >
                  {totalAmount.toLocaleString()} ฿
                </Typography>
              </Paper>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6, color: 'text.disabled', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                พิมพ์ shortcode เพื่อดูตัวอย่าง
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                ตัวอย่าง: 123=100x100 | =25=100 | 5=50
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
              ✅ บันทึกสำเร็จ!
            </Alert>
          )}
        </Paper>
      </div>

      {/* Limit Confirmation Dialog */}
      <Dialog
        open={limitConfirmOpen}
        onClose={() => { setLimitConfirmOpen(false); setPendingBets([]); setLimitErrors([]); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: 'warning.dark' }}>
          ⚠️ เลขเต็ม — ยืนยันเพิ่มรายการ?
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              พบเลขที่ครบลิมิตแล้ว:
            </Typography>
            {limitErrors.map((err, i) => (
              <Typography key={i} variant="body2">
                • เลข <strong>{err.number}</strong> ({formatBetType(err.type)}): {err.message}
              </Typography>
            ))}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            คุณต้องการเพิ่มรายการเหล่านี้ลงในรายการรอบันทึกหรือไม่?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => { setLimitConfirmOpen(false); setPendingBets([]); setLimitErrors([]); }}
            sx={{ fontWeight: 600 }}
          >
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleLimitConfirm}
            sx={{ fontWeight: 700 }}
          >
            ✅ ตกลง — เพิ่มรายการ
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
