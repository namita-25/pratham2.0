import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Cancel as CancelIcon, Add as AddIcon } from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import SimpleModal from './SimpleModal';
import { showToastMessage } from './Toastify';
import { updateUser } from '@/services/UserService';
import {
  getCohortList,
  assignClassToTeacher,
  updateCohortMemberStatus,
  getUserCohorts,
} from '../services/CohortService/cohortService';
import { ANY_OF_KEY } from '@rjsf/utils';

interface OBLFEditTeacherModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: any;
}

interface TeacherClass {
  id: string;
  classId: string;
  name: string;
  fromTime: string;
  toTime: string;
  membershipId?: string;
  originallyAssigned: boolean;
}

const OBLFEditTeacherModal: React.FC<OBLFEditTeacherModalProps> = ({
  open,
  onClose,
  onSuccess,
  user,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    gender: '',
    mobile: '',
    schoolId: '',
  });

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Validate mobile number
  const validateMobile = (phone: string): string | null => {
    if (!phone?.trim()) return null;
    if (!/^\d+$/.test(phone)) return 'Mobile number must contain only digits (0-9)';
    if (phone.length !== 10) return 'Mobile number must be exactly 10 digits';
    return null;
  };

  useEffect(() => {
    if (open && user) {
      const initializeData = async () => {
        setLoading(true);
        try {
          // 1. Fetch all active schools
          const schoolRequestData = {
            limit: 0,
            offset: 0,
            filters: { type: 'SCHOOL', status: ['active'] },
          };
          const schoolResponse = await getCohortList(schoolRequestData);
          let allSchools: any[] = [];
          if (schoolResponse?.results?.cohortDetails) {
            allSchools = schoolResponse.results.cohortDetails;
            setSchools(allSchools);
          }

          // 2. Map user profile details
          const profile = user?.user?.profile || user?.profile || {};
          let middleName = user.middleName || profile.middleName || '';
          let gender = user.gender || profile.gender || '';

          if (!middleName || !gender) {
            const customFields = user.customField || user.customFields || [];
            customFields.forEach((field: any) => {
              const label = (field.label || '').toUpperCase();
              const fieldId = (field.fieldId || field.fieldid || '').toLowerCase();
              if (label === 'MIDDLE_NAME' || fieldId === 'middlename') {
                middleName = field.selectedValues?.[0] || field.value || '';
              }
              if (label === 'GENDER' || fieldId === 'gender') {
                const val = field.selectedValues?.[0] || field.value || '';
                if (typeof val === 'string') gender = val.toLowerCase();
              }
            });
          }

          // 3. Fetch user's current classes
          let currentCohorts: any[] = [];
          try {
            const userCohortsResponse = await getUserCohorts(user.userId);
            if (Array.isArray(userCohortsResponse)) {
              currentCohorts = userCohortsResponse;
            } else if (userCohortsResponse?.cohortData && Array.isArray(userCohortsResponse.cohortData)) {
              currentCohorts = userCohortsResponse.cohortData;
            } else if (userCohortsResponse?.result && Array.isArray(userCohortsResponse.result)) {
              currentCohorts = userCohortsResponse.result;
            }
          } catch (err) {
            console.error('Failed to fetch user cohorts', err);
          }

          // Filter out archived cohorts
          const activeCohorts = currentCohorts.filter(c => c.cohortMemberStatus !== 'archived');

          let determinedSchoolId = '';

          if (activeCohorts.length > 0) {
            try {
              const firstCohortId = activeCohorts[0].cohortId || activeCohorts[0].id;
              const cohortDetailsResponse = await getCohortList({
                limit: 1,
                offset: 0,
                filters: { type: 'COHORT', cohortId: firstCohortId },
              });
              if (cohortDetailsResponse?.results?.cohortDetails?.[0]?.parentId) {
                determinedSchoolId = cohortDetailsResponse.results.cohortDetails[0].parentId;
              }
            } catch (err) {
              console.error('Failed to fetch cohort details to determine school', err);
            }
          }

          setFormData({
            firstName: user.firstName || user.user?.firstName || '',
            lastName: user.lastName || user.user?.lastName || '',
            middleName: middleName,
            gender: gender.toLowerCase(),
            mobile: user.mobile || user.user?.phone || user.user?.mobile || '',
            schoolId: determinedSchoolId,
          });

          // 4. Fetch available classes for the determined school and map existing classes
          if (determinedSchoolId) {
            const tenantId = localStorage.getItem('tenantId');
            const classResponse = await getCohortList({
              limit: 200,
              offset: 0,
              filters: {
                type: 'COHORT',
                status: ['active'],
                parentId: [determinedSchoolId],
                tenantId: tenantId,
              },
            });

            let schoolClasses: any[] = [];
            if (classResponse?.results?.cohortDetails) {
              schoolClasses = classResponse.results.cohortDetails;
              setAvailableClasses(schoolClasses);
            }

            // Map the activeCohorts to the TeacherClass format
            const mappedClasses: TeacherClass[] = activeCohorts
              .filter(ac => {
                const acId = ac.cohortId || ac.id;
                // Only include cohorts that belong to the selected school
                return schoolClasses.some(sc => sc.cohortId === acId);
              })
              .map(ac => {
                const acId = ac.cohortId || ac.id;
                const membershipId = ac.cohortMembershipId || ac.membershipId;
                const classDetails = schoolClasses.find(sc => sc.cohortId === acId);
                return {
                  id: uuidv4(),
                  classId: acId,
                  name: classDetails?.name || '',
                  fromTime: classDetails?.metadata?.fromTime || '',
                  toTime: classDetails?.metadata?.toTime || '',
                  membershipId: membershipId,
                  originallyAssigned: true,
                };
              });

            if (mappedClasses.length > 0) {
              setClasses(mappedClasses);
            } else {
              setClasses([{ id: uuidv4(), classId: '', name: '', fromTime: '', toTime: '', originallyAssigned: false }]);
            }
          } else {
            setClasses([{ id: uuidv4(), classId: '', name: '', fromTime: '', toTime: '', originallyAssigned: false }]);
          }

          setDataLoaded(true);
        } catch (err) {
          console.error('Error initializing data for edit modal', err);
          setError('Failed to load teacher data');
        } finally {
          setLoading(false);
        }
      };
      initializeData();
    }
  }, [open, user]);

  useEffect(() => {
    // Re-fetch available classes when schoolId changes manually by user
    if (dataLoaded && formData.schoolId) {
      const fetchClasses = async () => {
        try {
          const tenantId = localStorage.getItem('tenantId');
          const response = await getCohortList({
            limit: 200,
            offset: 0,
            filters: {
              type: 'COHORT',
              status: ['active'],
              parentId: [formData.schoolId],
              tenantId: tenantId,
            },
          });
          if (response?.results?.cohortDetails) {
            setAvailableClasses(response.results.cohortDetails);
          } else {
            setAvailableClasses([]);
          }
        } catch (error) {
          console.error('Error fetching classes:', error);
          setAvailableClasses([]);
        }
      };
      fetchClasses();
    } else if (dataLoaded && !formData.schoolId) {
      setAvailableClasses([]);
      setClasses([{ id: uuidv4(), classId: '', name: '', fromTime: '', toTime: '', originallyAssigned: false }]);
    }
  }, [formData.schoolId, dataLoaded]);

  const handleChange = (field: string, value: any) => {
    let finalValue = value;
    if (field === 'mobile') {
      const digitsOnly = String(value).replace(/\D/g, '');
      finalValue = digitsOnly.slice(0, 10);
    }
    setFormData((prev) => ({ ...prev, [field]: finalValue }));

    if (field === 'mobile') {
      const phoneError = validateMobile(String(finalValue));
      setErrors((prev) => ({ ...prev, mobile: phoneError || '' }));
    } else {
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };

  const handleAddClass = () => {
    setClasses(prev => [...prev, { id: uuidv4(), classId: '', name: '', fromTime: '', toTime: '', originallyAssigned: false }]);
  };

  const handleRemoveClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  const handleClassChange = (id: string, field: keyof TeacherClass, value: any) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (formData.mobile && validateMobile(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // 1. Update Profile Information
      const payload = {
        userData: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          gender: formData.gender,
          mobile: formData.mobile,
        },
      };

      const response = await updateUser(user.userId, payload);
      if (response?.responseCode !== 200 && !response?.success) {
        throw new Error(response?.message || 'Failed to update teacher profile');
      }

      // 2. Handle Class Assignments
      const currentCohortsResponse = await getUserCohorts(user.userId);
      let activeCohorts: any[] = [];
      if (Array.isArray(currentCohortsResponse)) {
        activeCohorts = currentCohortsResponse.filter((c: any) => c.cohortMemberStatus !== 'archived');
      } else if (currentCohortsResponse?.cohortData && Array.isArray(currentCohortsResponse.cohortData)) {
        activeCohorts = currentCohortsResponse.cohortData.filter((c: any) => c.cohortMemberStatus !== 'archived');
      } else if (currentCohortsResponse?.result && Array.isArray(currentCohortsResponse.result)) {
        activeCohorts = currentCohortsResponse.result.filter((c: any) => c.cohortMemberStatus !== 'archived');
      }

      // We only care about originally assigned classes FOR THE SELECTED SCHOOL
      // Wait, if they change the school, all classes for the old school will be unassigned naturally here
      // because `classes` (which contains the current selections) will not have them.
      const originallyAssignedClassIds = new Set(activeCohorts.map(c => c.cohortId || c.id));
      const currentlySelectedClassIds = new Set(classes.filter(c => c.classId).map(c => c.classId));

      const classesToAssign = Array.from(currentlySelectedClassIds).filter(id => !originallyAssignedClassIds.has(id));

      // Wait, if we unassign ALL classes not in `currentlySelectedClassIds`, we might unassign classes they have from OTHER schools.
      // In OBLF, a teacher belongs to ONE school, so unassigning everything else is desired.
      const classesToUnassignIds = Array.from(originallyAssignedClassIds).filter(id => !currentlySelectedClassIds.has(id));

      // Execute Additions
      if (classesToAssign.length > 0) {
        const assignResponse = await assignClassToTeacher({
          userId: [user.userId],
          cohortId: classesToAssign,
        });
        if (!assignResponse?.success && assignResponse?.responseCode !== 201) {
          console.error('Failed to assign some classes', assignResponse);
        }
      }

      // Execute Removals
      if (classesToUnassignIds.length > 0) {
        const removePromises = classesToUnassignIds.map(async (classId) => {
          const cohort = activeCohorts.find(c => (c.cohortId || c.id) === classId);
          const membershipId = cohort?.cohortMembershipId || cohort?.membershipId;
          if (membershipId) {
            return updateCohortMemberStatus({
              membershipId: membershipId,
              memberStatus: 'archived',
              statusReason: 'Unassigned by admin via Edit Modal'
            });
          }
          return Promise.resolve({ success: false });
        });
        await Promise.all(removePromises);
      }

      showToastMessage('Teacher details and classes updated successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error updating teacher:', err);
      showToastMessage(err.message || 'Failed to update teacher details', 'error');
      setError(err.message || 'Failed to update teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <SimpleModal
      open={open}
      onClose={onClose}
      showFooter={false}
      modalTitle={`Edit Teacher - ${formData.firstName} ${formData.lastName}`}
      width="800px"
      height="90vh"
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
              {error}
            </Alert>
          )}

          {!dataLoaded ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Full Name */}
              <TextField
                fullWidth
                required
                size="small"
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                error={!!errors.firstName}
                helperText={errors.firstName}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                size="small"
                label="Middle Name"
                value={formData.middleName}
                onChange={(e) => handleChange('middleName', e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                required
                size="small"
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                error={!!errors.lastName}
                helperText={errors.lastName}
                sx={{ mb: 2 }}
              />

              {/* Mobile Number */}
              <TextField
                fullWidth
                size="small"
                label="Mobile Number"
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
                error={!!errors.mobile}
                helperText={errors.mobile}
                inputProps={{
                  maxLength: 10,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                }}
                sx={{ mb: 2 }}
              />

              {/* Gender */}
              <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
                <FormLabel component="legend" sx={{ fontSize: '0.875rem', mb: 1 }}>
                  Gender
                </FormLabel>
                <RadioGroup
                  row
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  <FormControlLabel value="male" control={<Radio size="small" />} label="Male" />
                  <FormControlLabel value="female" control={<Radio size="small" />} label="Female" />
                  <FormControlLabel value="other" control={<Radio size="small" />} label="Other" />
                </RadioGroup>
              </FormControl>

              {/* School Assigned */}
              <FormControl fullWidth size="small" sx={{ mb: 3 }} error={!!errors.schoolId}>
                <InputLabel>School Assigned</InputLabel>
                <Select
                  value={formData.schoolId}
                  label="School Assigned"
                  onChange={(e) => handleChange('schoolId', e.target.value)}
                >
                  <MenuItem value="">
                    <em>Select School</em>
                  </MenuItem>
                  {schools.map((school) => (
                    <MenuItem key={school.cohortId} value={school.cohortId}>
                      {school.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Classes & Timings */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Classes & Timings
                </Typography>
                {classes.map((cls) => (
                  <Box key={cls.id} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, position: 'relative' }}>
                    {classes.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveClass(cls.id)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                        size="small"
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    )}
                    <FormControl size="small" fullWidth>
                      <InputLabel>Select Class</InputLabel>
                      <Select
                        value={cls.classId || ''}
                        label="Select Class"
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const selectedClass = availableClasses.find(c => c.cohortId === selectedId);
                          handleClassChange(cls.id, 'classId', selectedId);
                          if (selectedClass) {
                            handleClassChange(cls.id, 'name', selectedClass.name);
                            if (selectedClass.metadata?.fromTime) handleClassChange(cls.id, 'fromTime', selectedClass.metadata.fromTime);
                            if (selectedClass.metadata?.toTime) handleClassChange(cls.id, 'toTime', selectedClass.metadata.toTime);
                          }
                        }}
                        disabled={!formData.schoolId}
                      >
                        <MenuItem value=""><em>Select a Class</em></MenuItem>
                        {availableClasses.map((c) => (
                          <MenuItem key={c.cohortId} value={c.cohortId}>{c.name}</MenuItem>
                        ))}
                        {/* If a class is selected that no longer belongs to the current available classes */}
                        {cls.classId && !availableClasses.some(c => c.cohortId === cls.classId) && (
                          <MenuItem value={cls.classId} disabled>{cls.name || 'Unknown Class'}</MenuItem>
                        )}
                      </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 70 }}>
                        From Time
                      </Typography>
                      <TimePicker
                        value={cls.fromTime ? dayjs(cls.fromTime, 'hh:mm A') : null}
                        readOnly
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      />
                      <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 50, ml: 1 }}>
                        To Time
                      </Typography>
                      <TimePicker
                        value={cls.toTime ? dayjs(cls.toTime, 'hh:mm A') : null}
                        readOnly
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      />
                    </Box>
                  </Box>
                ))}
                {/* <Button startIcon={<AddIcon />} onClick={handleAddClass} size="small" variant="text">
                  Add another class
                </Button> */}
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button variant="outlined" onClick={handleCancel} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{
                    bgcolor: '#1976d2',
                    '&:hover': { bgcolor: '#1565c0' },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Teacher'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </LocalizationProvider>
    </SimpleModal>
  );
};

export default OBLFEditTeacherModal;
