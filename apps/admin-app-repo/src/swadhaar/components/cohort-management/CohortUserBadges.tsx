import React, { useState } from 'react';
import { 
  Box, 
  Chip, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button, 
  CircularProgress 
} from '@mui/material';
import { User, UserMinus } from 'lucide-react';
import { post } from '../../../services/RestClient';
import { API_ENDPOINTS } from '../../../utils/API/APIEndpoints';

interface CohortMember {
  userId: string;
  name: string;
  role?: string;
}

interface CohortUserBadgesProps {
  cohortId: string;
  members: CohortMember[];
  onMemberRemoved: () => void;
  disabled?: boolean;
}

const CohortUserBadges: React.FC<CohortUserBadgesProps> = ({
  cohortId,
  members,
  onMemberRemoved,
  disabled = false,
}) => {
  const [selectedMember, setSelectedMember] = useState<CohortMember | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteTrigger = (member: CohortMember) => {
    setSelectedMember(member);
  };

  const handleConfirmRemoval = async () => {
    if (!selectedMember) return;

    setLoading(true);
    setError(null);

    try {
      // Membership removal using post or delete based on core endpoints
      const apiUrl = API_ENDPOINTS.cohortMemberDelete || '/api/v1/cohort/member/delete';
      
      await post(apiUrl, {
        cohortId: cohortId,
        userId: [selectedMember.userId],
      });

      setSelectedMember(null);
      onMemberRemoved();
    } catch (err: any) {
      console.error('Error removing cohort member:', err);
      setError(err?.message || 'Failed to remove user from cohort. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (members.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.4)', fontStyle: 'italic' }}>
        No members currently assigned to this cohort.
      </Typography>
    );
  }

  return (
    <Box>
      {error && (
        <Typography variant="caption" color="error" sx={{ display: 'block', marginBottom: '8px' }}>
          {error}
        </Typography>
      )}

      {/* Pill Badges Array */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {members.map((member) => (
          <Chip
            key={member.userId}
            icon={<User size={14} />}
            label={member.name}
            onDelete={disabled ? undefined : () => handleDeleteTrigger(member)}
            disabled={disabled || loading}
            sx={{
              borderRadius: '8px',
              backgroundColor: 'rgba(26, 35, 126, 0.05)',
              color: '#1A237E',
              fontWeight: 600,
              fontSize: '13px',
              border: '1px solid rgba(26, 35, 126, 0.1)',
              '& .MuiChip-deleteIcon': {
                color: '#BA1A1A',
                '&:hover': {
                  color: '#930006',
                },
              },
            }}
          />
        ))}
      </Box>

      {/* Removal Confirmation Dialog */}
      <Dialog
        open={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        aria-labelledby="cohort-remove-title"
        aria-describedby="cohort-remove-desc"
      >
        <DialogTitle id="cohort-remove-title" sx={{ fontWeight: 700 }}>
          Remove Member from Cohort?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cohort-remove-desc">
            Are you sure you want to remove <strong>{selectedMember?.name}</strong> from this active training cohort? They will no longer receive assignments or triggers mapped to this group.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button onClick={() => setSelectedMember(null)} variant="outlined" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmRemoval}
            variant="contained"
            color="error"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <UserMinus size={16} />}
            disabled={loading}
            sx={{
              backgroundColor: '#BA1A1A',
              '&:hover': {
                backgroundColor: '#930006',
              },
            }}
          >
            Remove Member
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CohortUserBadges;
