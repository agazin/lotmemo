'use client';

import { AuthProvider } from './contexts/AuthContext';
import { NumberProvider } from './contexts/NumberContext';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

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

export function Providers({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NumberProvider>
          {children}
        </NumberProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
