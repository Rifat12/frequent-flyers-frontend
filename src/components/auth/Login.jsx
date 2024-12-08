import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Link
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
    if (result.success) {
      navigate('/trips');
    } else {
      setError(result.error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #5D9FFF 0%, #B85FFF 100%)',
        p: 2,
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={5}
          sx={{
            borderRadius: 3,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
          }}
        >
          <FlightTakeoffIcon sx={{ fontSize: 40, color: '#5D9FFF', mb: 1 }} />
          <Typography variant="h5" color="primary" fontWeight="bold" textAlign="center" sx={{ mb: 1 }}>
            FREQUENT FLYERS
          </Typography>
          <Typography component="h1" variant="h4" fontWeight="bold" textAlign="center">
            Welcome Back
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
            Sign in to continue
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              variant="filled"
              color="primary"
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ backgroundColor: 'white', borderRadius: 1 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              variant="filled"
              color="primary"
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ backgroundColor: 'white', borderRadius: 1 }}
            />

            {error && (
              <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontWeight: 'bold',
                background: 'linear-gradient(to right, #5D9FFF, #B85FFF)',
              }}
            >
              Sign In
            </Button>

            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
              Don&apos;t have an account?{' '}
              <Link href="/register" variant="body2" underline="hover" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
