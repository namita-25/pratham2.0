import React, { useState, useEffect } from 'react';
import BulkStudentUploadModal from './BulkStudentUploadModal';
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
  InputAdornment,
  Typography,
  Alert,
  CircularProgress,
  Badge,
} from '@mui/material';
import { Visibility, VisibilityOff, Add as AddIcon, Cancel as CancelIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import SimpleModal from './SimpleModal';
import { showToastMessage } from './Toastify';
import { createAccount } from '../services/AccountService';
import {
  createUserStudentTeacher,
  validateEmail,
  USER_ROLES,
  CUSTOM_FIELDS,
  getCohortList,
  createCohort,
  assignClassToTeacher,
} from '../services/CohortService/cohortService';
interface AddTeacherModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddTeacherModal: React.FC<AddTeacherModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
    email: '',
    username: '',
    password: '',
    gender: '',
    schoolId: '',
  });

  interface TeacherClass {
    id: string;
    classId: string;
    name: string;
    fromTime: string;
    toTime: string;
    studentsData?: any[];
  }
  const [classes, setClasses] = useState<TeacherClass[]>([{ id: '1', classId: '', name: '', fromTime: '', toTime: '' }]);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadClassId, setUploadClassId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [schools, setSchools] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      const fetchSchools = async () => {
        try {
          const schoolRequestData = {
            limit: 0,
            offset: 0,
            filters: {
              type: 'SCHOOL',
              status: ['active'],
            },
          };
          const response = await getCohortList(schoolRequestData);
          if (response?.results?.cohortDetails) {
            setSchools(response.results.cohortDetails);
          }
        } catch (error) {
          console.error('Error fetching schools:', error);
        }
      };
      fetchSchools();
    }
  }, [open]);

  useEffect(() => {
    if (formData.schoolId) {
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
    } else {
      setAvailableClasses([]);
    }
  }, [formData.schoolId]);
  // Phone number validation (same as AddUserForm)
  const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) return null; // Optional field, no error if empty

    // Check if phone contains only digits
    if (!/^\d+$/.test(phone)) {
      return 'Phone number must contain only digits (0-9)';
    }

    // Check if phone is exactly 10 digits
    if (phone.length !== 10) {
      return 'Phone number must be exactly 10 digits';
    }

    return null;
  };

  // Password validation (same as AddUserForm)
  const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';

    // Check all requirements and return a single combined message if any fail
    const hasMinLength = password.length >= 8;
    const hasLowercase = /(?=.*[a-z])/.test(password);
    const hasUppercase = /(?=.*[A-Z])/.test(password);
    const hasNumber = /(?=.*\d)/.test(password);
    const hasSpecialChar = /(?=.*[@$!%*?&])/.test(password);

    if (!hasMinLength || !hasLowercase || !hasUppercase || !hasNumber || !hasSpecialChar) {
      return 'Password must be at least 8 characters long, include numerals, uppercase, lowercase, and special characters.';
    }

    return null;
  };

  const handleChange = (field: string, value: any) => {
    let finalValue = value;

    // For contactNumber field, only allow digits and limit to 10 characters (same as AddUserForm)
    if (field === 'contactNumber') {
      // Remove any non-digit characters
      const digitsOnly = String(value).replace(/\D/g, '');
      // Limit to 10 digits
      finalValue = digitsOnly.slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [field]: finalValue }));

    // Validate field in real-time as user types (for contactNumber and password) - same as AddUserForm
    if (field === 'contactNumber' || field === 'password') {
      if (field === 'contactNumber') {
        const phoneError = validatePhone(String(finalValue));
        setErrors((prev) => {
          const newErrors = { ...prev };
          if (phoneError) {
            newErrors.contactNumber = phoneError;
          } else {
            delete newErrors.contactNumber;
          }
          return newErrors;
        });
      } else if (field === 'password') {
        const passwordError = validatePassword(String(finalValue));
        setErrors((prev) => {
          const newErrors = { ...prev };
          if (passwordError) {
            newErrors.password = passwordError;
          } else {
            delete newErrors.password;
          }
          return newErrors;
        });
      }
    } else {
      // Clear error when user starts typing for other fields
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
    setClasses(prev => [...prev, { id: uuidv4(), classId: '', name: '', fromTime: '', toTime: '' }]);
  };

  const handleRemoveClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  const handleClassChange = (id: string, field: 'name' | 'fromTime' | 'toTime' | 'classId', value: string) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleParsedData = (data: any[]) => {
    if (uploadClassId) {
      setClasses(classes.map(c => c.id === uploadClassId ? { ...c, studentsData: data } : c));
      setUploadModalOpen(false);
      showToastMessage(`${data.length} students ready to upload for this class.`, 'success');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.schoolId) {
      newErrors.schoolId = 'School assignment is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password (same as AddUserForm)
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Validate contact number (same as AddUserForm - optional but format must be correct if provided)
    if (formData.contactNumber) {
      const phoneError = validatePhone(formData.contactNumber);
      if (phoneError) {
        newErrors.contactNumber = phoneError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const prepareUserData = () => {
    const tenantId = localStorage.getItem('tenantId');
    if (!tenantId) {
      throw new Error('Tenant ID not found');
    }
    const roleId = USER_ROLES.TEACHER.id;
    const roleType = 'teacher';
    const name = `${formData.firstName} ${formData.lastName}`;

    const userData = {
      name,
      username: formData.username,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      ...(formData.contactNumber && { mobile: formData.contactNumber }),
      ...(formData.gender && { gender: formData.gender }),
      tenantCohortRoleMapping: [
        {
          tenantId,
          roleId:
            roleType === 'teacher'
              ? USER_ROLES.TEACHER.id
              : USER_ROLES.STUDENT.id,
        },
      ],
      // ...(customFields.length > 0 && { customFields })
    };

    return userData;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const userData = prepareUserData();

      console.log('Creating user with data:', userData);

      const response = await createUserStudentTeacher(userData);

      if (response?.responseCode === 201) {
        const newTeacherId = response.result?.userId || response.data?.userId;

        if (newTeacherId && formData.schoolId) {
          // Assign teacher to existing classes
          for (const cls of classes) {
            if (!cls.classId) continue;

            try {
              await assignClassToTeacher({
                cohortId: [cls.classId],
                userId: [newTeacherId]
              });

              // Upload parsed students for this class if any
              if (cls.studentsData && cls.studentsData.length > 0) {
                for (const studentData of cls.studentsData) {
                  try {
                    const res = await createAccount(studentData);
                    const newStudentId = res?.result?.userId || res?.data?.userId;
                    if (newStudentId) {
                      const { post } = await import('@/services/RestClient');
                      const { API_ENDPOINTS } = await import('@/services/CohortService/cohortService');
                      await post(API_ENDPOINTS.cohortMemberBulkCreate, {
                        userId: [newStudentId],
                        cohortId: [cls.classId],
                      });
                    }
                  } catch (err) {
                    console.error('Failed to create student:', err);
                  }
                }
              }
            } catch (err) {
              console.error('Failed to assign class:', cls.name, err);
            }
          }
        }

        showToastMessage(`Teacher and classes added successfully!`, 'success');
        console.log(`Teacher created:`, response.data);

        onSuccess();
        onClose();

        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          contactNumber: '',
          email: '',
          username: '',
          gender: '',
          password: '',
          schoolId: '',
        });
        setClasses([{ id: uuidv4(), classId: '', name: '', fromTime: '', toTime: '' }]);
        setErrors({});
        setError(null);
      } else {
        throw new Error(response.message || `Failed to create Teacher`);
      }
    } catch (error: any) {
      console.error(`Error creating Teacher:`, error);

      // Extract specific error message from API response (same as AddUserForm)
      let errorMessage = 'Failed to create user. Please try again.';

      // Type guard to check if error has axios response structure
      const isAxiosError = (err: unknown): err is {
        response?: {
          data?: {
            params?: {
              errmsg?: string;
              err?: string;
              error?: string;
            };
            message?: string;
            error?: string;
            result?: {
              error?: string;
              message?: string;
            };
          };
        };
        message?: string;
      } => {
        return typeof err === 'object' && err !== null;
      };

      if (isAxiosError(error)) {
        // Try multiple possible error response formats
        // Priority: err (user-friendly message) > errmsg (error code) > error > message
        if (error.response?.data?.params?.err) {
          // Format: { params: { err: "Mobile number must be 10 digits long" } }
          errorMessage = error.response.data.params.err;
        } else if (error.response?.data?.params?.errmsg) {
          // Format: { params: { errmsg: "BAD_REQUEST" } } - fallback to error code if err not available
          errorMessage = error.response.data.params.errmsg;
        } else if (error.response?.data?.params?.error) {
          // Another alternative format
          errorMessage = error.response.data.params.error;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.data?.result?.error) {
          errorMessage = error.response.data.result.error;
        } else if (error.response?.data?.result?.message) {
          errorMessage = error.response.data.result.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);

      // Show specific field errors if available
      if (error.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(
          ([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              fieldErrors[field] = messages[0];
            }
          }
        );
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: '',
      lastName: '',
      contactNumber: '',
      email: '',
      username: '',
      password: '',
      gender: '',
      schoolId: '',
    });
    setClasses([{ id: uuidv4(), classId: '', name: '', fromTime: '', toTime: '' }]);
    setErrors({});
    setError(null);
    onClose();
  };

  return (
    <SimpleModal
      open={open}
      onClose={onClose}
      showFooter={false}
      modalTitle="New Teacher"
      width="800px"
      height="90vh"
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 1
              }}
            >
              {error}
            </Alert>
          )}

          {/* Full Name */}
          <TextField
            fullWidth
            required
            size="small"
            label="First Name"
            placeholder="Enter first name"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            error={!!errors.firstName}
            helperText={errors.firstName}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            required
            size="small"
            label="Last Name"
            placeholder="Enter last name"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            error={!!errors.lastName}
            helperText={errors.lastName}
            sx={{ mb: 2 }}
          />
          {/* Contact Number */}
          <TextField
            fullWidth
            size="small"
            label="Contact Number"
            placeholder="Enter contact number"
            value={formData.contactNumber}
            onChange={(e) => handleChange('contactNumber', e.target.value)}
            error={!!errors.contactNumber}
            helperText={errors.contactNumber}
            inputProps={{
              maxLength: 10,
              inputMode: 'numeric',
              pattern: '[0-9]*',
            }}
            sx={{ mb: 2 }}
          />

          {/* Email */}
          <TextField
            fullWidth
            required
            size="small"
            type="email"
            label="Email"
            placeholder="Enter email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            sx={{ mb: 2 }}
          />

          {/* Gender */}
          <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
            <FormLabel
              component="legend"
              sx={{ fontSize: '0.875rem', mb: 1 }}
            >
              Gender
            </FormLabel>
            <RadioGroup
              row
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
            >
              <FormControlLabel
                value="male"
                control={<Radio size="small" />}
                label="Male"
              />
              <FormControlLabel
                value="female"
                control={<Radio size="small" />}
                label="Female"
              />
              <FormControlLabel
                value="other"
                control={<Radio size="small" />}
                label="Other"
              />
            </RadioGroup>
            {errors.gender && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                {errors.gender}
              </Typography>
            )}
          </FormControl>

          {/* Username */}
          <TextField
            fullWidth
            required
            size="small"
            label="Username"
            placeholder="Enter username"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            error={!!errors.username}
            helperText={errors.username}
            sx={{ mb: 2 }}
          />

          {/* Password */}
          <TextField
            fullWidth
            required
            size="small"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* School Assigned */}
          <FormControl fullWidth size="small" sx={{ mb: 3 }} error={!!errors.schoolId}>
            <InputLabel>School Assigned *</InputLabel>
            <Select
              value={formData.schoolId}
              label="School Assigned *"
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
            {errors.schoolId && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>{errors.schoolId}</Typography>}
          </FormControl>

          {/* Classes & Timings */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
              Classes & Timings
            </Typography>
            {classes.map((cls, index) => (
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
                  <InputLabel>Select Class *</InputLabel>
                  <Select
                    value={cls.classId || ''}
                    label="Select Class *"
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
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 70 }}>
                    From Time
                  </Typography>
                  <TimePicker
                    value={cls.fromTime ? dayjs(cls.fromTime, 'hh:mm A') : null}
                    onChange={(newValue) => {
                      handleClassChange(cls.id, 'fromTime', newValue ? newValue.format('hh:mm A') : '');
                    }}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                  <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 50, ml: 1 }}>
                    To Time
                  </Typography>
                  <TimePicker
                    value={cls.toTime ? dayjs(cls.toTime, 'hh:mm A') : null}
                    onChange={(newValue) => {
                      handleClassChange(cls.id, 'toTime', newValue ? newValue.format('hh:mm A') : '');
                    }}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Box>

                <Box sx={{ display: 'flex' }}>
                  <Badge color="success" badgeContent={cls.studentsData?.length || 0} invisible={!cls.studentsData || cls.studentsData.length === 0}>
                    <Button
                      variant={cls.studentsData?.length ? "contained" : "outlined"}
                      color={cls.studentsData?.length ? "success" : "primary"}
                      size="small"
                      onClick={() => {
                        setUploadClassId(cls.id);
                        setUploadModalOpen(true);
                      }}
                    >
                      {cls.studentsData?.length ? 'Students Ready' : 'Upload Students'}
                    </Button>
                  </Badge>
                </Box>
              </Box>
            ))}
            {/* <Button startIcon={<AddIcon />} onClick={handleAddClass} size="small">
              Add another class
            </Button> */}
          </Box>

          {/* Teacher Id */}
          {/* <TextField
            fullWidth
            size="small"
            label="Teacher Id"
            placeholder="Enter teacher ID"
            value={formData.teacherId}
            onChange={(e) => handleChange('teacherId', e.target.value)}
            sx={{ mb: 2 }}
          /> */}

          {/* Role */}
          {/* <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              onChange={(e) => handleChange('role', e.target.value)}
            >
              <MenuItem value="">
                <em>Select Role</em>
              </MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="headTeacher">Head Teacher</MenuItem>
              <MenuItem value="coordinator">Coordinator</MenuItem>
              <MenuItem value="mentor">Mentor</MenuItem>
            </Select>
          </FormControl> */}

          {/* CEFR Level */}
          {/* <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>CEFR Level</InputLabel>
            <Select
              value={formData.cefrLevel}
              label="CEFR Level"
              onChange={(e) => handleChange('cefrLevel', e.target.value)}
            >
              <MenuItem value="">
                <em>Select CEFR Level</em>
              </MenuItem>
              <MenuItem value="a1">A1 - Beginner</MenuItem>
              <MenuItem value="a2">A2 - Elementary</MenuItem>
              <MenuItem value="b1">B1 - Intermediate</MenuItem>
              <MenuItem value="b2">B2 - Upper Intermediate</MenuItem>
              <MenuItem value="c1">C1 - Advanced</MenuItem>
              <MenuItem value="c2">C2 - Proficient</MenuItem>
            </Select>
          </FormControl> */}

          {/* Program */}
          {/* <FormControl fullWidth size="small" required sx={{ mb: 2 }}>
            <InputLabel>Program</InputLabel>
            <Select
              value={formData.program}
              label="Program"
              onChange={(e) => handleChange('program', e.target.value)}
            >
              <MenuItem value="">
                <em>Select Program</em>
              </MenuItem>
              <MenuItem value="english">English Program</MenuItem>
              <MenuItem value="math">Math Program</MenuItem>
              <MenuItem value="science">Science Program</MenuItem>
              <MenuItem value="general">General Program</MenuItem>
            </Select>
          </FormControl> */}

          {/* Sub Program */}
          {/* <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Sub Program</InputLabel>
            <Select
              value={formData.subProgram}
              label="Sub Program"
              onChange={(e) => handleChange('subProgram', e.target.value)}
            >
              <MenuItem value="">
                <em>Select Sub Program</em>
              </MenuItem>
              <MenuItem value="primary">Primary</MenuItem>
              <MenuItem value="secondary">Secondary</MenuItem>
              <MenuItem value="senior">Senior</MenuItem>
            </Select>
          </FormControl> */}

          {/* Supervisor */}
          {/* <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Supervisor</InputLabel>
            <Select
              value={formData.supervisor}
              label="Supervisor"
              onChange={(e) => handleChange('supervisor', e.target.value)}
            >
              <MenuItem value="">
                <em>Select Supervisor</em>
              </MenuItem>
              <MenuItem value="supervisor1">John Doe</MenuItem>
              <MenuItem value="supervisor2">Jane Smith</MenuItem>
              <MenuItem value="supervisor3">Robert Johnson</MenuItem>
            </Select>
          </FormControl> */}

          {/* Village Name */}
          {/* <TextField
            fullWidth
            size="small"
            label="Village Name"
            placeholder="Enter village name"
            value={formData.villageName}
            onChange={(e) => handleChange('villageName', e.target.value)}
            sx={{ mb: 2 }}
          /> */}

          {/* Date Of Joining */}
          {/* <DatePicker
            label="Date Of joining *"
            value={formData.dateOfJoining}
            onChange={(newValue) => handleChange('dateOfJoining', newValue)}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                sx: { mb: 2 },
              },
            }}
          /> */}

          {/* Old Teacher Id */}
          {/* <TextField
            fullWidth
            size="small"
            label="Old Teacher Id"
            placeholder="Enter old teacher ID"
            value={formData.oldTeacherId}
            onChange={(e) => handleChange('oldTeacherId', e.target.value)}
            sx={{ mb: 2 }}
          /> */}

          {/* Date Of Leaving */}
          {/* <DatePicker
            label="Date Of Leaving"
            value={formData.dateOfLeaving}
            onChange={(newValue) => handleChange('dateOfLeaving', newValue)}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                sx: { mb: 2 },
              },
            }}
          /> */}

          {/* Reason For Leaving */}
          {/* <TextField
            fullWidth
            size="small"
            label="Reason For Leaving"
            placeholder="Enter reason for leaving"
            multiline
            rows={3}
            value={formData.reasonForLeaving}
            onChange={(e) => handleChange('reasonForLeaving', e.target.value)}
            sx={{ mb: 3 }}
          /> */}

          {/* Action Buttons */}
          <Box
            sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}
          >
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
            >
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
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </Box>
        </Box>
      </LocalizationProvider>
      <BulkStudentUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => setUploadModalOpen(false)}
        isOffline={true}
        onParsedData={handleParsedData}
      />
    </SimpleModal>
  );
};

export default AddTeacherModal;
