'use client';

import { Typography } from '@mui/material';
import ResultEntry from '../../components/ResultEntry';

export default function ResultsPage() {
    return (
        <>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 3, color: 'text.primary' }}>
                🏆 ผลรางวัล
            </Typography>
            <ResultEntry />
        </>
    );
}
