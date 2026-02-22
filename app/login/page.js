'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  InputAdornment,
  IconButton
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      await login(username, password);
      router.push('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Container maxWidth="sm">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="text-center">
            <Typography variant="h4" component="h1" className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Welcome Back
            </Typography>
            <Typography className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please sign in to your account
            </Typography>
          </div>

          {error && (
            <Alert
              severity="error"
              className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/30 dark:border-red-800"
            >
              {error}
            </Alert>
          )}

          <Paper className="mt-8 p-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <TextField
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/50 dark:bg-gray-900/50 rounded-lg"
              />
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/50 dark:bg-gray-900/50 rounded-lg"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                className="mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Sign In
              </Button>
            </form>
          </Paper>
        </div>
      </Container>
    </main>
  );
}
