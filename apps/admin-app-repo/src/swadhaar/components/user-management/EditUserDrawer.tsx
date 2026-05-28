import React, { useState, useEffect } from 'react';
import { 
  Drawer, 
  Box, 
  Typography, 
  IconButton, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Grid,
  CircularProgress,
  Alert,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { X, Trash2 } from 'lucide-react';
import CascadingGeoDropdowns, { GeoLocationState } from '../common/CascadingGeoDropdowns';
import { updateUser, deleteUser } from '../../../services/UserService';
import { readTenant, getRoleIdByTenantAndRoleName } from '../../../services/TenantApiService';
import { getFieldIdsByName } from '../../../services/FieldsService';
import { SWADHAAR_THEME, SWADHAAR_CONSTANTS } from '../../utils/swadhaar.constants';

interface EditUserDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: any; // User object containing profile details
}

const EditUserDrawer: React.FC<EditUserDrawerProps> = ({ open, onClose, onSuccess, user }) => {
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
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Archiving confirmation dialog toggle
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Field mappings in system backend
  const [fieldIds, setFieldIds] = useState<Record<string, string>>({});

  // Prefill when user prop changes
  useEffect(() => {
    if (open && user) {
      const names = (user.name || '').split(' ');
      setFirstName(user.firstName || names[0] || '');
      setLastName(user.lastName || names[1] || '');
      setEmail(user.email || '');
      setPhone(user.mobile || user.phone || '');
      setGender(user.gender || '');
      
      const userRole = user.tenantCohortRoleMapping?.[0]?.roleName || 
                       user.roleName || 
                       'Trainer';
      setRole(userRole);

      // Extract geographic coverage
      const stateVal = user.customFields?.find((f: any) => f.label === 'STATE');
      const distVal = user.customFields?.find((f: any) => f.label === 'DISTRICT');
      const blockVal = user.customFields?.find((f: any) => f.label === 'BLOCK');
      const villageVal = user.customFields?.find((f: any) => f.label === 'VILLAGE');

      setLocations({
        state: stateVal?.selectedValues?.[0]?.value || '',
        stateId: stateVal?.selectedValues?.[0]?.id || '',
        district: distVal?.selectedValues?.[0]?.value || '',
        districtId: distVal?.selectedValues?.[0]?.id || '',
        block: blockVal?.selectedValues?.[0]?.value || '',
        blockId: blockVal?.selectedValues?.[0]?.id || '',
        village: villageVal?.selectedValues?.[0]?.value || '',
        villageId: villageVal?.selectedValues?.[0]?.id || '',
      });

      setErrors({});
      setApiError(null);
    }
  }, [open, user]);

  // Load field maps
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
          console.error(e);
        }
      };
      loadFieldIds();
    }
  }, [open]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
    const formErrors: Record<string, string> = {};
    if (!firstName.trim()) formErrors.firstName = 'First Name is required';
    if (!lastName.trim()) formErrors.lastName = 'Last Name is required';
    
    if (!email.trim()) {
      formErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      formErrors.email = 'Invalid Email address format';
    }

    if (!phone.trim()) {
      formErrors.phone = 'Mobile Number is required (eg. +91XXXXXXXXXX)';
    } else if (!SWADHAAR_CONSTANTS.MOBILE_REGEX.test(phone)) {
      formErrors.phone = 'Mobile Number is required (eg. +91XXXXXXXXXX)';
    }

    if (!role) formErrors.role = 'Role selection is required';

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
      const roleId = getRoleIdByTenantAndRoleName(tenants, tenantId, role);
      if (!roleId) {
        throw new Error(`Role mapping failed.`);
      }

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

      const updatePayload = {
        name: `${firstName} ${lastName}`.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender: gender || 'female',
        email: email.trim(),
        mobile: phone.trim(),
        tenantCohortRoleMapping: [
          {
            tenantId,
            roleId,
          },
        ],
        customFields: customFieldsArray,
      };

      await updateUser(user.userId || user.id, updatePayload);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setApiError(err?.message || 'An error occurred while updating the profile.');
    } finally {
      setLoading(false);
    }
  };

  // Perform destructive Archive updates
  const handleArchiveUser = async () => {
    setArchiveLoading(true);
    setIsConfirmOpen(false);
    try {
      // Archive User sends user status update as specified
      await deleteUser(user.userId || user.id, { status: 'archived' });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error archiving user:', err);
      setApiError(err?.message || 'Failed to archive the active user account.');
    } finally {
      setArchiveLoading(false);
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100vw', sm: '550px' },
            boxSizing: 'border-box',
            borderTopLeftRadius: '16px',
            borderBottomLeftRadius: '16px',
          },
        }}
      >
        {/* Header Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(26, 35, 126, 0.08)',
            backgroundColor: SWADHAAR_THEME.primary,
            color: '#FFFFFF',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Edit User Profile
          </Typography>
          <IconButton onClick={onClose} sx={{ color: '#FFFFFF' }}>
            <X size={20} />
          </IconButton>
        </Box>

        {/* Scrollable Container Form */}
        <Box
          component="form"
          onSubmit={handleFormSubmit}
          sx={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {apiError && (
            <Alert severity="error" sx={{ borderRadius: '8px' }}>
              {apiError}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* First Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name *"
                fullWidth
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>

            {/* Last Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name *"
                fullWidth
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12}>
              <TextField
                label="Email Address *"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>

            {/* Mobile Phone Number */}
            <Grid item xs={12}>
              <TextField
                label="Mobile Number *"
                fullWidth
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </Grid>

            {/* Gender */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="edit-gender-label">Gender</InputLabel>
                <Select
                  labelId="edit-gender-label"
                  value={gender}
                  label="Gender"
                  onChange={(e) => setGender(e.target.value)}
                >
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Transgender">Transgender</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Role */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.role}>
                <InputLabel id="edit-role-label">Role *</InputLabel>
                <Select
                  labelId="edit-role-label"
                  value={role}
                  label="Role *"
                  onChange={(e) => setRole(e.target.value)}
                >
                  <MenuItem value="CFL Incharge">CFL Incharge</MenuItem>
                  <MenuItem value="Trainer">Trainer</MenuItem>
                </Select>
                {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>

          {/* Geographic Selection Block */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: SWADHAAR_THEME.primary,
                marginBottom: '16px',
                borderBottom: '1px solid rgba(26, 35, 126, 0.08)',
                paddingBottom: '8px',
              }}
            >
              Geographic Coverage (Cascading Options)
            </Typography>
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
            />
          </Box>

          {/* Destructive Actions & Drawer Triggers */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 'auto',
              paddingTop: '24px',
              borderTop: '1px solid rgba(26, 35, 126, 0.08)',
            }}
          >
            {/* Destructive red archive button */}
            <Button
              variant="outlined"
              color="error"
              startIcon={<Trash2 size={16} />}
              onClick={() => setIsConfirmOpen(true)}
              disabled={loading || archiveLoading}
              sx={{
                borderRadius: '8px',
                borderColor: '#BA1A1A',
                color: '#BA1A1A',
                '&:hover': {
                  backgroundColor: 'rgba(186, 26, 26, 0.04)',
                  borderColor: '#BA1A1A',
                },
              }}
            >
              Archive User
            </Button>

            <Box sx={{ display: 'flex', gap: '16px' }}>
              <Button
                variant="outlined"
                onClick={onClose}
                disabled={loading || archiveLoading}
                sx={{
                  borderRadius: '8px',
                  borderColor: 'rgba(26, 35, 126, 0.3)',
                  color: SWADHAAR_THEME.primary,
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || archiveLoading}
                sx={{
                  borderRadius: '8px',
                  backgroundColor: SWADHAAR_THEME.primary,
                  '&:hover': {
                    backgroundColor: '#0D1642',
                  },
                }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Modern Archiving Confirmation Dialog */}
      <Dialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title" sx={{ fontWeight: 700, color: '#BA1A1A' }}>
          Archive Swadhaar User?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Are you absolutely sure you want to archive <strong>{firstName} {lastName}</strong>? This action will restrict their access to the platform and can only be undone by a system lead.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button onClick={() => setIsConfirmOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleArchiveUser}
            variant="contained"
            color="error"
            autoFocus
            sx={{
              backgroundColor: '#BA1A1A',
              '&:hover': {
                backgroundColor: '#930006',
              },
            }}
          >
            Confirm Archive
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditUserDrawer;
