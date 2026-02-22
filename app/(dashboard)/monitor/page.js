'use client';

import { Typography } from '@mui/material';
import MonitorDashboard from '../../components/MonitorDashboard';

export default function MonitorPage() {
    return (
        <>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 3, color: 'text.primary' }}>
                📊 ตรวจติดตาม
            </Typography>
            <MonitorDashboard />
        </>
    );
}
