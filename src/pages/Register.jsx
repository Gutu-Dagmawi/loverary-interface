import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Box, 
  Grid, 
  Link as MuiLink, 
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import useAuth from '../hooks/useAuth';

const PASSWORD_STRENGTH = {
  TOO_SHORT: 'Password is too short (minimum 6 characters)',
  WEAK: 'Weak - try adding more characters or numbers',
  MEDIUM: 'Medium - try adding special characters',
  STRONG: 'Strong password',
};

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const checkPasswordStrength = (password) => {
    if (!password) return '';
    if (password.length < 6) return PASSWORD_STRENGTH.TOO_SHORT;
    if (password.length < 8) return PASSWORD_STRENGTH.WEAK;
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return PASSWORD_STRENGTH.MEDIUM;
    return PASSWORD_STRENGTH.STRONG;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    const strength = checkPasswordStrength(formData.password);
    if (!formData.password) {
      newErrors.password = 'Password is required';
      setPasswordStrength('');
    } else if (strength === PASSWORD_STRENGTH.TOO_SHORT) {
      newErrors.password = PASSWORD_STRENGTH.TOO_SHORT;
      setPasswordStrength(PASSWORD_STRENGTH.TOO_SHORT);
    } else {
      setPasswordStrength(strength);
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(checkPasswordStrength(formData.password));
    } else {
      setPasswordStrength('');
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (submitError) {
      setSubmitError('');
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Register the user
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      if (result?.success) {
        // Only redirect if registration was successful
        navigate('/login', { 
          replace: true,
          state: { 
            registrationSuccess: true,
            email: formData.email 
          } 
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.response) {
        if (err.response.status === 422) {
          const serverErrors = err.response.data.errors || [];
          setSubmitError(serverErrors.join('\n'));
        } else if (err.response.status === 400) {
          setSubmitError(err.response.data.error || 'Invalid request. Please check your input.');
        } else {
          setSubmitError('An error occurred during registration. Please try again.');
        }
      } else if (err.request) {
        setSubmitError('Unable to connect to the server. Please check your connection.');
      } else {
        setSubmitError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return 'inherit';
    if (passwordStrength === PASSWORD_STRENGTH.TOO_SHORT) return 'error';
    if (passwordStrength === PASSWORD_STRENGTH.WEAK) return 'warning';
    if (passwordStrength === PASSWORD_STRENGTH.MEDIUM) return 'info';
    return 'success';
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Create Your Account
          </Typography>
          
          {submitError && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {submitError}
            </Alert>
          )}
        
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  autoComplete="username"
                  name="username"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  autoFocus
                  value={formData.username}
                  onChange={handleChange}
                  error={!!errors.username}
                  helperText={errors.username || ' '}
                  disabled={isSubmitting}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email || ' '}
                  disabled={isSubmitting}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={passwordStrength || ' '}
                  disabled={isSubmitting}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={togglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {passwordStrength && (
                  <Typography 
                    variant="caption" 
                    color={getPasswordStrengthColor()}
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    {passwordStrength}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword || ' '}
                  disabled={isSubmitting}
                />
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{ mt: 3, mb: 2 }}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Creating Account...
                </>
              ) : 'Create Account'}
            </Button>
            
            <Grid container justifyContent="flex-end">
              <Grid item>
                <MuiLink component={Link} to="/login" variant="body2">
                  Already have an account? Sign in
                </MuiLink>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
