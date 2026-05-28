import React, { useState } from 'react';
import { 
  Drawer, 
  Box, 
  Typography, 
  IconButton, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  FormControlLabel, 
  Checkbox,
  CircularProgress,
  Alert
} from '@mui/material';
import { X } from 'lucide-react';
import CascadingGeoDropdowns, { GeoLocationState } from '../common/CascadingGeoDropdowns';
import { updateUser, deleteUser } from '../../../services/UserService';
import { readTenant, getRoleIdByTenantAndRoleName } from '../../../services/TenantApiService';
import { getFieldIdsByName } from '../../../services/FieldsService';
import { SWADHAAR_THEME, SWADHAAR_CONSTANTS } from '../../utils/swadhaar.constants';

interface BulkEditDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedUserIds: string[];
}

const BulkEditDrawer: React.FC<BulkEditDrawerProps> = ({
  open,
  onClose,
  onSuccess,
  selectedUserIds,
}) => {
  const [role, setRole] = useState('');
  const [archiveUsers, setArchiveUsers] = useState(false);
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

  const handleClear = () => {
    setRole('');
    setArchiveUsers(false);
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
    setApiError(null);
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (selectedUserIds.length === 0) {
      setApiError('No users have been selected for bulk update.');
      return;
    }

    // Check if at least one operational field is selected
    const hasLocation = !!locations.stateId;
    const hasRole = !!role;
    
    if (!hasLocation && !hasRole && !archiveUsers) {
      setApiError('Please select at least one attribute to modify (Locations, Role, or Archive).');
      return;
    }

    setLoading(true);

    try {
      const tenantId = localStorage.getItem('tenantId') || SWADHAAR_CONSTANTS.TENANT_ID;
      const tenants = await readTenant();
      
      let roleId = '';
      if (role) {
        roleId = getRoleIdByTenantAndRoleName(tenants, tenantId, role) || '';
      }

      // Fetch geographical field IDs dynamically
      const fieldMap = await getFieldIdsByName(
        ['State', 'District', 'Block', 'Village'],
        tenantId
      );

      const customFieldsArray: Array<{ fieldId: string; value: string[] }> = [];
      if (hasLocation && fieldMap) {
        if (locations.stateId && fieldMap.State) {
          customFieldsArray.push({ fieldId: fieldMap.State, value: [locations.stateId] });
        }
        if (locations.districtId && fieldMap.District) {
          customFieldsArray.push({ fieldId: fieldMap.District, value: [locations.districtId] });
        }
        if (locations.blockId && fieldMap.Block) {
          customFieldsArray.push({ fieldId: fieldMap.Block, value: [locations.blockId] });
        }
        if (locations.villageId && fieldMap.Village) {
          customFieldsArray.push({ fieldId: fieldMap.Village, value: [locations.villageId] });
        }
      }

      // Process parallel updates for each user to guarantee isolated error bounds
      const updatePromises = selectedUserIds.map(async (userId) => {
        if (archiveUsers) {
          // If archive is checked, perform the status deletion
          return deleteUser(userId, { status: 'archived' });
        } else {
          const updatePayload: any = {};
          if (role && roleId) {
            updatePayload.tenantCohortRoleMapping = [
              {
                tenantId,
                roleId,
              },
            ];
          }
          if (customFieldsArray.length > 0) {
            updatePayload.customFields = customFieldsArray;
          }
          return updateUser(userId, updatePayload);
        }
      });

      await Promise.all(updatePromises);
      handleClear();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error executing bulk edits:', err);
      setApiError(err?.message || 'An error occurred while applying bulk modifications.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
          backgroundColor: '#0D1642',
          color: '#FFFFFF',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Bulk Edit Users ({selectedUserIds.length} Selected)
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#FFFFFF' }}>
          <X size={20} />
        </IconButton>
      </Box>

      {/* Scrollable Container Form */}
      <Box
        component="form"
        onSubmit={handleBulkSubmit}
        sx={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}
      >
        {apiError && (
          <Alert severity="error" sx={{ borderRadius: '8px' }}>
            {apiError}
          </Alert>
        )}

        {/* 1. Optional Role Update */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: SWADHAAR_THEME.primary, marginBottom: '12px' }}
          >
            Update User Role (Optional)
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="bulk-role-label">Override Role</InputLabel>
            <Select
              labelId="bulk-role-label"
              value={role}
              label="Override Role"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="CFL Incharge">CFL Incharge</MenuItem>
              <MenuItem value="Trainer">Trainer</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* 2. Optional Geographic Updates */}
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
            Update Geographic Coverage (Optional)
          </Typography>
          <CascadingGeoDropdowns
            values={locations}
            onChange={(locs) => setLocations(locs)}
            disabled={archiveUsers}
          />
        </Box>

        {/* 3. Archive Toggle */}
        <Box
          sx={{
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(186, 26, 26, 0.04)',
            border: '1px dashed rgba(186, 26, 26, 0.2)',
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={archiveUsers}
                onChange={(e) => setArchiveUsers(e.target.checked)}
                sx={{
                  color: '#BA1A1A',
                  '&.Mui-checked': {
                    color: '#BA1A1A',
                  },
                }}
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#BA1A1A' }}>
                  Archive Selected Users
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.6)', display: 'block' }}>
                  Restricts cohort access for all selected profiles. This action takes precedence.
                </Typography>
              </Box>
            }
          />
        </Box>

        {/* Bottom Drawer Actions */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '16px',
            marginTop: 'auto',
            paddingTop: '24px',
            borderTop: '1px solid rgba(26, 35, 126, 0.08)',
          }}
        >
          <Button
            variant="outlined"
            onClick={handleClear}
            disabled={loading}
            sx={{
              borderRadius: '8px',
              borderColor: 'rgba(26, 35, 126, 0.3)',
              color: SWADHAAR_THEME.primary,
            }}
          >
            Clear Fields
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: '8px',
              backgroundColor: archiveUsers ? '#BA1A1A' : SWADHAAR_THEME.primary,
              '&:hover': {
                backgroundColor: archiveUsers ? '#930006' : '#0D1642',
              },
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Apply Updates'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default BulkEditDrawer;
