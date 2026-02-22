'use client';

import { AuthProvider } from '../contexts/AuthContext';
import { NumberProvider } from '../contexts/NumberContext';
import { LimitProvider } from '../contexts/LimitContext';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

import { useEffect } from 'react';
import { initializeUsers } from '../utils/userUtils';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3b82f6', // Tailwind blue-500
    },
    secondary: {
      main: '#10b981', // Tailwind emerald-500
    },
    error: {
      main: '#ef4444', // Tailwind red-500
    }
  }
});

export default function Providers({ children }) {
  useEffect(() => {
    initializeUsers();
  }, []);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <LimitProvider>
            <NumberProvider>
              {children}
            </NumberProvider>
          </LimitProvider>
        </AuthProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
