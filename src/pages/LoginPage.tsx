import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  CssBaseline,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../context/AuthContext';

// Replace these with your actual image imports
import backgroundImage from '../images/cover3.jpg';
import c5iLogo from '../images/c5i_logo.png';
import sonicVueLogo from '../images/sonic_vue_logo.png';
import microsoftLogo from '../images/microsoft.png';

const StyledContainer = styled(Container)({
  display: 'flex',
  minHeight: '100vh',
  padding: 0,
  maxWidth: '1400px !important',
  margin: '0 auto',
});

const FormSection = styled(Box)({
  flex: 1,
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  maxWidth: '500px',
  marginRight: '120px'
});

const ImageSection = styled(Box)({
  flex: 1,
  position: 'relative',
  overflow: 'hidden',
  '& img': {
    borderRadius: '10px',
  },
});

const StyledTextField = styled(TextField)({
  marginBottom: '15px',
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#F8F9FA',
    fontSize: '0.9rem',
  },
});

const MicrosoftButton = styled(Button)({
  backgroundColor: '#F8F9FA',
  height:'40px',
  color: '#000',
  textTransform: 'none',
  border: '1px solid #E0E0E0',
  padding: '8px 0',
  fontSize: '0.9rem',
  '&:hover': {
    backgroundColor: '#F0F0F0',
  },
});

const SignInButton = styled(Button)({
  backgroundColor: '#6800E0',
  height:'40px',
  color: 'white',
  padding: '10px 0',
  fontSize: '0.9rem',
  '&:hover': {
    backgroundColor: '#420897',
  },
});

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (email === 'astha@c5i.ai' && password === 'Password@123') {
      login();
      navigate('/home');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <StyledContainer>
      <CssBaseline />
      <FormSection>
        <Box sx={{ maxWidth: 350, width: '100%', mx: 'auto' }}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <img src={c5iLogo} alt="C5i Logo" style={{ height: '40px', marginRight: '10px' }} />
            {/* <Typography variant="h6" component="span" sx={{ mx: 1 }}>|</Typography>
            <img src={sonicVueLogo} alt="Sonicvue Logo" style={{ height: '20px', marginLeft: '10px' }} /> */}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
            Welcome 👋
          </Typography>
          <Typography variant="h6" sx={{ color: '#6800E0', fontWeight: 600, mb: 1 }}>
            SonicVUE
          </Typography>
          <Typography variant="body2"  color="text.secondary" sx={{ mb: 1 }}>
          Harness the Power of Gen-AI for Unmatched Insights and Elevate your customer service game
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            <StyledTextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <StyledTextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Typography variant="body2" color="#6800E0" sx={{ cursor: 'pointer' }}>
                Forgot Password?
              </Typography>
            </Box>
            <SignInButton type="submit" fullWidth variant="contained">
              Sign in
            </SignInButton>
            {/* <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
              <Box sx={{ flex: 1, height: '1px', backgroundColor: '#E0E0E0' }} />
              <Typography variant="body2" sx={{ mx: 2 }}>
                Or
              </Typography>
              <Box sx={{ flex: 1, height: '1px', backgroundColor: '#E0E0E0' }} />
            </Box> */}
            {/* <MicrosoftButton fullWidth variant="outlined" startIcon={
              <img src={microsoftLogo} alt="Microsoft logo" style={{ width: '20px', height: '20px' }} />
            }>
              Sign in with Microsoft
            </MicrosoftButton> */}
          </Box>
          {/* <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              Don't you have an account?{' '}
              <Typography component="span" color="#6800E0" sx={{ cursor: 'pointer' }}>
                Sign up
              </Typography>
            </Typography>
          </Box> */}
        </Box>
      </FormSection>
      <ImageSection sx={{padding:'20px'}}>
        <img
          src={backgroundImage}
          alt="AI Concept Testing"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </ImageSection>
    </StyledContainer>
  );
};

export default LoginPage;

