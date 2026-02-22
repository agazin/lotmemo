'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Paper,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNumbers } from '../contexts/NumberContext';
import { formatBetType } from '../utils/betParser';

export default function NumbersList({ customerId }) {
  const { getNumbersByCustomer, deleteNumber } = useNumbers();
  const numbers = getNumbersByCustomer(customerId);

  if (numbers.length === 0) {
    return (
      <Typography variant="body1" sx={{ textAlign: 'center', py: 4, color: 'text.disabled' }}>
        ยังไม่มีรายการที่บันทึก
      </Typography>
    );
  }

  // Group numbers by type for summary
  const summary = {};
  numbers.forEach(record => {
    const key = `${record.number}-${record.type}`;
    if (!summary[key]) {
      summary[key] = { number: record.number, type: record.type, totalAmount: 0, count: 0 };
    }
    summary[key].totalAmount += record.amount;
    summary[key].count += 1;
  });

  const grandTotal = numbers.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 700 }}>เลข</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>ประเภท</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>จำนวนเงิน</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>เวลา</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, width: 48 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {numbers.slice().reverse().map((record) => (
              <TableRow
                key={record.id}
                sx={{
                  '&:hover': { backgroundColor: 'action.hover' },
                  transition: 'background-color 0.15s ease',
                }}
              >
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem' }}
                  >
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
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {record.amount.toLocaleString()} ฿
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="caption" color="text.secondary">
                    {new Date(record.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {deleteNumber && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deleteNumber(record.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary footer */}
      <Paper
        elevation={0}
        sx={{
          mt: 2,
          p: 2,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" fontWeight={600}>
          ทั้งหมด {numbers.length} รายการ
        </Typography>
        <Typography variant="h6" fontWeight={800} color="primary.main">
          {grandTotal.toLocaleString()} ฿
        </Typography>
      </Paper>
    </div>
  );
}
