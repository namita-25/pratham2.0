import React, { useState } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box, 
  Typography, 
  IconButton, 
  FormControl, 
  Select, 
  MenuItem, 
  Button, 
  CircularProgress,
  Alert,
  DialogContentText
} from '@mui/material';
import { X, Trash2 } from 'lucide-react';
import CascadingGeoDropdowns, { GeoLocationState } from '../common/CascadingGeoDropdowns';
import { updateUser, deleteUser } from '../../../services/UserService';
import { readTenant, getRoleIdByTenantAndRoleName } from '../../../services/TenantApiService';
import { getFieldIdsByName } from '../../../services/FieldsService';
import { SWADHAAR_CONSTANTS } from '../../utils/swadhaar.constants';

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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleClear = () => {
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
    setApiError(null);
  };

  const handleCloseModal = () => {
    handleClear();
    onClose();
  };

  const handleAction = async (isArchive: boolean) => {
    setApiError(null);

    if (selectedUserIds.length === 0) {
      setApiError('No users have been selected for bulk operations.');
      return;
    }

    if (!isArchive && !locations.stateId && !role) {
      setApiError('Please select at least one field to update (Location or Role).');
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
      if (!isArchive && locations.stateId && fieldMap) {
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
        if (isArchive) {
          // Perform archive update
          return deleteUser(userId, { status: 'archived' });
        } else {
          // Perform dynamic field update
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

  const handleUpdateClick = (e: React.FormEvent) => {
    e.preventDefault();
    handleAction(false);
  };

  return (
    <>
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
            Bulk Edit Users
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

          <Box component="form" onSubmit={handleUpdateClick} sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Cascading Geo Selection */}
            <CascadingGeoDropdowns
              values={locations}
              onChange={(locs) => setLocations(locs)}
              flatStyle
              singleColumn
            />

            {/* Role selection */}
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '13px', mb: '6px', color: '#1F2937' }}>
                Role <span style={{ color: '#BA1A1A' }}>*</span>
              </Typography>
              <FormControl fullWidth>
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
              </FormControl>
            </Box>
          </Box>
        </DialogContent>

        <Box sx={{ borderTop: '1px solid #E5E7EB', my: 2 }} />

        {/* Footer actions */}
        <DialogActions sx={{ padding: '0px 16px 4px 16px', justifyContent: 'space-between' }}>
          {/* Outlined red Archive button on the left */}
          <Button
            variant="outlined"
            color="error"
            startIcon={<Trash2 size={16} />}
            onClick={() => setIsConfirmOpen(true)}
            disabled={loading}
            sx={{
              borderRadius: '8px',
              borderColor: '#BA1A1A',
              color: '#BA1A1A',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '14px',
              padding: '10px 16px',
              '&:hover': {
                backgroundColor: 'rgba(186, 26, 26, 0.04)',
                borderColor: '#BA1A1A',
              },
            }}
          >
            Archive Users ({selectedUserIds.length})
          </Button>

          {/* Contained dark Bulk Update button on the right */}
          <Button
            onClick={handleUpdateClick}
            disabled={loading}
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
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Bulk Update Users'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Mass Archiving */}
      <Dialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        aria-labelledby="bulk-confirm-title"
        aria-describedby="bulk-confirm-description"
      >
        <DialogTitle id="bulk-confirm-title" sx={{ fontWeight: 700, color: '#BA1A1A' }}>
          Archive Selected Users?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="bulk-confirm-description">
            Are you absolutely sure you want to archive <strong>{selectedUserIds.length}</strong> selected users? This will restrict their access to the platform and can only be undone by a system administrator.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button onClick={() => setIsConfirmOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setIsConfirmOpen(false);
              handleAction(true);
            }}
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

export default BulkEditDrawer;
