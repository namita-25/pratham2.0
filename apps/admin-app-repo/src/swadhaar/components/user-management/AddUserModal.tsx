import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box, 
  Typography, 
  IconButton, 
  TextField, 
  FormControl, 
  Select, 
  MenuItem, 
  Button, 
  CircularProgress,
  Alert,
  FormHelperText
} from '@mui/material';
import { X } from 'lucide-react';
import CascadingGeoDropdowns, { GeoLocationState } from '../common/CascadingGeoDropdowns';
import { createAccount } from '../../../services/AccountService';
import { readTenant, getRoleIdByTenantAndRoleName } from '../../../services/TenantApiService';
import { getFieldIdsByName } from '../../../services/FieldsService';
import { SWADHAAR_THEME, SWADHAAR_CONSTANTS, SwadhaarRole } from '../../utils/swadhaar.constants';

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ open, onClose, onSuccess }) => {
  const [adminRole, setAdminRole] = useState<string>('admin');

  // Input states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [role, setRole] = useState('');
  
  const [locations, setLocations] = useState<GeoLocationState>({
    state: '',
    stateId: '',
    district: '',
    districtId: '',
    block: '',
    blockId: '',
    village: '',
    villageId: '',
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Field definitions for state mapping in backend
  const [fieldIds, setFieldIds] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('roleName') || 'admin';
      setAdminRole(storedRole);
    }
  }, []);

  // Fetch geographic field IDs when modal opens
  useEffect(() => {
    if (open) {
      const loadFieldIds = async () => {
        try {
          const tenantId = localStorage.getItem('tenantId') || SWADHAAR_CONSTANTS.TENANT_ID;
          const fieldMap = await getFieldIdsByName(
            ['State', 'District', 'Block', 'Village'],
            tenantId
          );
          setFieldIds(fieldMap || {});
        } catch (e) {
          console.error('Error fetching field IDs in Swadhaar Geo module', e);
        }
      };
      loadFieldIds();
    }
  }, [open]);

  const handleClear = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setGender('');
    setRole('');
    setLocations({
      state: '',
      stateId: '',
      district: '',
      districtId: '',
      block: '',
      blockId: '',
      village: '',
      villageId: '',
    });
    setErrors({});
    setApiError(null);
  };

  const isFormValid = () => {
    if (!firstName.trim() || !/^[a-zA-Z]+$/.test(firstName)) return false;
    if (!lastName.trim() || !/^[a-zA-Z]+$/.test(lastName)) return false;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
    
    const fullPhone = phone.startsWith('+91') ? phone.trim() : `+91${phone.trim()}`;
    if (!phone.trim() || !SWADHAAR_CONSTANTS.MOBILE_REGEX.test(fullPhone)) return false;
    
    if (!role) return false;
    if (!locations.stateId || !locations.districtId || !locations.blockId || !locations.villageId) return false;
    
    return true;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
    // Field validations
    const formErrors: Record<string, string> = {};
    
    if (!firstName.trim()) {
      formErrors.firstName = 'First Name is required';
    } else if (!/^[a-zA-Z]+$/.test(firstName)) {
      formErrors.firstName = 'First Name must contain only letters';
    }

    if (!lastName.trim()) {
      formErrors.lastName = 'Last Name is required';
    } else if (!/^[a-zA-Z]+$/.test(lastName)) {
      formErrors.lastName = 'Last Name must contain only letters';
    }
    
    if (!email.trim()) {
      formErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      formErrors.email = 'Invalid Email address format';
    }

    const fullPhone = phone.startsWith('+91') ? phone.trim() : `+91${phone.trim()}`;

    if (!phone.trim()) {
      formErrors.phone = 'Mobile Number is required (eg. 9876543210)';
    } else if (!SWADHAAR_CONSTANTS.MOBILE_REGEX.test(fullPhone)) {
      formErrors.phone = 'Mobile Number must be a valid 10-digit number (eg. 9876543210)';
    }

    if (!role) formErrors.role = 'Role selection is required';

    // Cascading geographic selection checks
    if (!locations.stateId) formErrors.state = 'State is required';
    if (!locations.districtId) formErrors.district = 'District is required';
    if (!locations.blockId) formErrors.block = 'Block is required';
    if (!locations.villageId) formErrors.village = 'Village is required';

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);

    try {
      const tenantId = localStorage.getItem('tenantId') || SWADHAAR_CONSTANTS.TENANT_ID;
      const tenants = await readTenant();
      
      // Resolve standard role ID matching the Swadhaar scope
      const roleId = getRoleIdByTenantAndRoleName(tenants, tenantId, role);
      if (!roleId) {
        throw new Error(`Operational role mapping for "${role}" could not be established.`);
      }

      // Map geographic variables to custom fields schema
      const customFieldsArray: Array<{ fieldId: string; value: string[] }> = [];
      if (locations.stateId && fieldIds.State) {
        customFieldsArray.push({ fieldId: fieldIds.State, value: [locations.stateId] });
      }
      if (locations.districtId && fieldIds.District) {
        customFieldsArray.push({ fieldId: fieldIds.District, value: [locations.districtId] });
      }
      if (locations.blockId && fieldIds.Block) {
        customFieldsArray.push({ fieldId: fieldIds.Block, value: [locations.blockId] });
      }
      if (locations.villageId && fieldIds.Village) {
        customFieldsArray.push({ fieldId: fieldIds.Village, value: [locations.villageId] });
      }

      // Set default password following system standards
      const defaultPassword = 'Password@123';

      const accountPayload = {
        name: `${firstName} ${lastName}`.trim(),
        username: fullPhone, // Use phone with +91 prefix as standard username
        password: defaultPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender: gender || 'female',
        email: email.trim(),
        mobile: fullPhone,
        tenantCohortRoleMapping: [
          {
            tenantId,
            roleId,
          },
        ],
        ...(customFieldsArray.length > 0 ? { customFields: customFieldsArray } : {}),
      };

      await createAccount(accountPayload);
      handleClear();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating Swadhaar user:', err);
      setApiError(
        err?.response?.data?.params?.err || 
        err?.message || 
        'An error occurred while creating the user account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    handleClear();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      maxWidth="xs"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.08)',
          backgroundColor: '#FFFFFF',
          padding: '12px 12px 20px 12px',
          margin: '16px',
        }
      }}
    >
      {/* Header Block */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px 8px 16px',
          borderBottom: 'none',
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: '20px', color: '#111827', fontFamily: 'Inter, sans-serif' }}>
          Add User
        </Typography>
        <IconButton onClick={handleCloseModal} size="small" sx={{ color: '#374151' }}>
          <X size={18} />
        </IconButton>
      </DialogTitle>

      {/* Form Content Block */}
      <DialogContent
        sx={{
          padding: '8px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto',
          maxHeight: '70vh',
        }}
      >
        {apiError && (
          <Alert severity="error" sx={{ borderRadius: '8px', fontSize: '13px' }}>
            {apiError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleFormSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* 1. First Name */}
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '13px', mb: '6px', color: '#1F2937' }}>
              First Name <span style={{ color: '#BA1A1A' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter first Name"
              value={firstName}
              onChange={(e) => {
                const val = e.target.value;
                if (/^[a-zA-Z]*$/.test(val)) {
                  setFirstName(val);
                }
              }}
              error={!!errors.firstName}
              helperText={errors.firstName}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#F3F4F6',
                  borderRadius: '8px',
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: '1px solid #1E293B' },
                },
                '& .MuiInputBase-input': {
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: '#1F2937',
                }
              }}
            />
          </Box>

          {/* 2. Last Name */}
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '13px', mb: '6px', color: '#1F2937' }}>
              Last Name <span style={{ color: '#BA1A1A' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter last Name"
              value={lastName}
              onChange={(e) => {
                const val = e.target.value;
                if (/^[a-zA-Z]*$/.test(val)) {
                  setLastName(val);
                }
              }}
              error={!!errors.lastName}
              helperText={errors.lastName}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#F3F4F6',
                  borderRadius: '8px',
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: '1px solid #1E293B' },
                },
                '& .MuiInputBase-input': {
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: '#1F2937',
                }
              }}
            />
          </Box>

          {/* 3. Email */}
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '13px', mb: '6px', color: '#1F2937' }}>
              Email <span style={{ color: '#BA1A1A' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              error={!!errors.email}
              helperText={errors.email}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#F3F4F6',
                  borderRadius: '8px',
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: '1px solid #1E293B' },
                },
                '& .MuiInputBase-input': {
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: '#1F2937',
                }
              }}
            />
          </Box>

          {/* 4. Mobile Number */}
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '13px', mb: '6px', color: '#1F2937' }}>
              Mobile Number <span style={{ color: '#BA1A1A' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter mobile number (Eg: 9876543210)"
              value={phone}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) {
                  setPhone(val);
                }
              }}
              error={!!errors.phone}
              helperText={errors.phone}
              variant="outlined"
              inputProps={{ maxLength: 10 }}
              InputProps={{
                startAdornment: (
                  <Box sx={{ color: '#4B5563', mr: 1, fontSize: '14px', fontWeight: 500 }}>
                    +91
                  </Box>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#F3F4F6',
                  borderRadius: '8px',
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: '1px solid #1E293B' },
                },
                '& .MuiInputBase-input': {
                  padding: '12px 16px 12px 0px',
                  fontSize: '14px',
                  color: '#1F2937',
                }
              }}
            />
          </Box>

          {/* 5. Gender */}
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '13px', mb: '6px', color: '#1F2937' }}>
              Gender
            </Typography>
            <FormControl fullWidth>
              <Select
                displayEmpty
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                renderValue={(selected) => {
                  if (!selected) {
                    return <span style={{ color: '#9CA3AF' }}>Select gender</span>;
                  }
                  return selected as string;
                }}
                sx={{
                  backgroundColor: '#F3F4F6',
                  borderRadius: '8px',
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: '1px solid #1E293B' },
                  '& .MuiSelect-select': {
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: gender ? '#1F2937' : '#9CA3AF',
                  }
                }}
              >
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Transgender">Transgender</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Cascading Geo Coverage */}
          <CascadingGeoDropdowns
            values={locations}
            onChange={(locs) => {
              setLocations(locs);
              setErrors((prev) => {
                const clean = { ...prev };
                delete clean.state;
                delete clean.district;
                delete clean.block;
                delete clean.village;
                return clean;
              });
            }}
            errors={errors}
            flatStyle
            singleColumn
          />

          {/* 10. Role */}
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '13px', mb: '6px', color: '#1F2937' }}>
              Role <span style={{ color: '#BA1A1A' }}>*</span>
            </Typography>
            <FormControl fullWidth error={!!errors.role}>
              <Select
                displayEmpty
                value={role}
                onChange={(e) => setRole(e.target.value)}
                renderValue={(selected) => {
                  if (!selected) {
                    return <span style={{ color: '#9CA3AF' }}>Select role</span>;
                  }
                  return selected as string;
                }}
                sx={{
                  backgroundColor: '#F3F4F6',
                  borderRadius: '8px',
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: '1px solid #1E293B' },
                  '& .MuiSelect-select': {
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: role ? '#1F2937' : '#9CA3AF',
                  }
                }}
              >
                <MenuItem value="CFL Incharge">CFL Incharge</MenuItem>
                <MenuItem value="Trainer">Trainer</MenuItem>
              </Select>
              {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
            </FormControl>
          </Box>
        </Box>
      </DialogContent>

      <Box sx={{ borderTop: '1px solid #E5E7EB', my: 2 }} />

      {/* Footer Block */}
      <DialogActions sx={{ padding: '0px 16px 4px 16px', justifyContent: 'flex-end' }}>
        <Button
          onClick={handleFormSubmit}
          disabled={loading || !isFormValid()}
          variant="contained"
          sx={{
            borderRadius: '8px',
            backgroundColor: '#1E293B',
            color: '#FFFFFF',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '14px',
            padding: '10px 24px',
            '&:hover': {
              backgroundColor: '#0F172A',
            },
            '&.Mui-disabled': {
              backgroundColor: '#9CA3AF',
              color: '#F3F4F6',
            }
          }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Create User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserModal;
