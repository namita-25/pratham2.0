import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Card, 
  Typography, 
  TextField, 
  Button, 
  FormControlLabel, 
  Checkbox, 
  IconButton, 
  InputAdornment, 
  CircularProgress,
  Collapse,
  Alert
} from '@mui/material';
import { Eye, EyeOff, Sun, Lock, User } from 'lucide-react';
import { login, getUserId } from '../../../services/LoginService';
import { getUserDetailsInfo } from '../../../services/UserList';
import { getAcademicYear } from '../../../services/AcademicYearService';
import TenantService from '../../../services/TenantService';
import { SWADHAAR_THEME, SWADHAAR_CONSTANTS, StorageKeys } from '../../utils/swadhaar.constants';
import { transformLabel } from '../../../utils/Helper';

const SwadhaarLoginCard: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Validation errors
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError] = useState('');

  // Lockout / security count
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('swadhaar_remembered_username');
      if (savedUser) {
        setUsername(savedUser);
        setRememberMe(true);
      }
    }
  }, []);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setUsername(value);
    if (/\s/.test(value)) {
      setUsernameError('Spaces are not allowed in username');
    } else {
      setUsernameError('');
    }
    setApiError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError('');
    setApiError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      setApiError('Account is locked due to too many failed attempts. Try again later.');
      return;
    }

    let hasError = false;
    if (!username) {
      setUsernameError('This field is required');
      hasError = true;
    }
    if (!password) {
      setPasswordError('This field is required');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    setApiError('');

    try {
      // 1. Core authentication call
      const loginResponse = await login({ username, password });
      const token = loginResponse?.access_token;
      
      if (!token) {
        throw new Error('Authentication failed. No access token returned.');
      }

      // Store basic tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', loginResponse?.refresh_token || '');
      localStorage.setItem('tenantId', SWADHAAR_CONSTANTS.TENANT_ID);
      TenantService.setTenantId(SWADHAAR_CONSTANTS.TENANT_ID);

      // Save username if rememberMe is enabled
      if (rememberMe) {
        localStorage.setItem('swadhaar_remembered_username', username);
      } else {
        localStorage.removeItem('swadhaar_remembered_username');
      }

      // 2. Fetch User ID
      const userIdResponse = await getUserId();
      const userId = userIdResponse?.userId;
      if (!userId) {
        throw new Error('Failed to resolve authenticated User ID.');
      }
      localStorage.setItem('userId', userId);

      // 3. Fetch full User Details Profile
      const detailsResponse = await getUserDetailsInfo(userId, true);
      const userInfo = detailsResponse?.userData;
      
      if (!userInfo) {
        throw new Error('Unable to fetch detailed profile information.');
      }

      // Persist full configuration
      localStorage.setItem('adminInfo', JSON.stringify(userInfo));
      
      const roleId = userInfo.tenantData?.[0]?.roleId || '';
      const roleName = userInfo.tenantData?.[0]?.roleName || 'Trainer';
      const program = userInfo.tenantData?.[0]?.tenantName || 'Swadhaar';

      localStorage.setItem('roleId', roleId);
      localStorage.setItem('roleName', roleName);
      localStorage.setItem('program', program);

      // Preferred language is restricted to English only for Swadhaar
      localStorage.setItem('preferredLanguage', 'en');

      // State and District identifiers
      const stateField = userInfo?.customFields?.find(
        (field: any) => field?.label === 'STATE'
      );
      if (stateField?.selectedValues?.[0]) {
        const stateName = transformLabel(stateField.selectedValues[0].value);
        localStorage.setItem('stateName', stateName);
        localStorage.setItem('stateId', stateField.selectedValues[0].id);
      }

      // 4. Fetch and cache academic years
      try {
        const academicYears = await getAcademicYear();
        if (academicYears && academicYears.length > 0) {
          localStorage.setItem('academicYearList', JSON.stringify(academicYears));
          const activeYear = academicYears.find((item: any) => item.isActive);
          
          const tenantConfig = await TenantService.getTenantConfig();
          const targetYearId = tenantConfig?.academicYearId || activeYear?.id || '';
          const targetYearName = activeYear?.session || '2025-2026';
          
          if (targetYearId) {
            localStorage.setItem('academicYearId', targetYearId);
          }
          localStorage.setItem('academicYearName', targetYearName);
        }
      } catch (yearError) {
        console.error('Error fetching academic years in Swadhaar login', yearError);
      }

      // Clear lockout states on successful login
      setFailedAttempts(0);

      // Hard redirect to dashboard to clear layouts cleanly
      window.location.href = '/swadhaar/dashboard';

    } catch (error: any) {
      console.error('Authentication pipeline error:', error);
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);

      if (nextFailures >= 5) {
        setIsLocked(true);
        setApiError('Maximum login attempts exceeded. Account locked out for security.');
      } else {
        setApiError(
          error?.response?.data?.message || 
          error?.message || 
          'Invalid username or password. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      elevation={4}
      sx={{
        width: '100%',
        maxWidth: '450px',
        padding: { xs: '32px 24px', sm: '48px 40px' },
        borderRadius: '16px',
        backgroundColor: '#FFFFFF',
        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 2,
      }}
    >
      {/* Header Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          backgroundColor: SWADHAAR_THEME.secondary,
          boxShadow: '0 6px 20px rgba(255, 143, 0, 0.35)',
          marginBottom: '20px',
        }}
      >
        <Sun size={32} color="#FFFFFF" strokeWidth={2.5} />
      </Box>

      {/* Brand Title */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          color: SWADHAAR_THEME.primary,
          marginBottom: '4px',
          letterSpacing: '0.5px',
        }}
      >
        Swadhaar
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: 'rgba(26, 35, 126, 0.6)',
          fontWeight: 600,
          marginBottom: '32px',
          fontSize: '14px',
          textAlign: 'center',
        }}
      >
        ToT Administrative Management Panel
      </Typography>

      {/* Alerts box */}
      <Collapse in={!!apiError} sx={{ width: '100%', marginBottom: '20px' }}>
        <Alert 
          severity="error" 
          variant="filled"
          sx={{ 
            borderRadius: '8px', 
            fontSize: '13px',
            backgroundColor: SWADHAAR_THEME.error,
          }}
        >
          {apiError}
        </Alert>
      </Collapse>

      {/* Form Fields */}
      <Box component="form" onSubmit={handleFormSubmit} sx={{ width: '100%' }}>
        <Box sx={{ marginBottom: '20px' }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: '#333333',
              marginBottom: '6px',
            }}
          >
            Username
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter username"
            variant="outlined"
            value={username}
            onChange={handleUsernameChange}
            error={!!usernameError}
            helperText={usernameError}
            disabled={loading || isLocked}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <User size={18} color="rgba(26, 35, 126, 0.4)" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ marginBottom: '24px' }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: '#333333',
              marginBottom: '6px',
            }}
          >
            Password
          </Typography>
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            variant="outlined"
            value={password}
            onChange={handlePasswordChange}
            error={!!passwordError}
            helperText={passwordError}
            disabled={loading || isLocked}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock size={18} color="rgba(26, 35, 126, 0.4)" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
                    edge="end"
                    disabled={loading || isLocked}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color="rgba(0, 0, 0, 0.54)" />
                    ) : (
                      <Eye size={18} color="rgba(0, 0, 0, 0.54)" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading || isLocked}
                sx={{
                  color: SWADHAAR_THEME.primary,
                  '&.Mui-checked': {
                    color: SWADHAAR_THEME.primary,
                  },
                }}
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#555555' }}>
                Remember Me
              </Typography>
            }
          />
        </Box>

        <Button
          fullWidth
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading || isLocked}
          sx={{
            height: '48px',
            fontSize: '15px',
            fontWeight: 700,
            borderRadius: '100px',
            boxShadow: '0 4px 14px rgba(26, 35, 126, 0.25)',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#0D1642',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: '#FFFFFF' }} />
          ) : (
            'Sign In'
          )}
        </Button>
      </Box>
    </Card>
  );
};

export default SwadhaarLoginCard;
