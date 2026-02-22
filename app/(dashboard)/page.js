'use client';

import { Typography } from '@mui/material';
import Reports from '../components/Reports';

export default function DashboardHomePage() {
  return (
    <>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3, color: 'text.primary' }}>
        📈 รายงาน
      </Typography>
      <Reports />
    </>
  );
}
