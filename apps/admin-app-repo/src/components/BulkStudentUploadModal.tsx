import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import Papa from 'papaparse';
import { createAccount, CreateAccountRequest } from '@/services/AccountService';
import { readTenant, getRoleIdByTenantAndRoleName, TenantListItem } from '@/services/TenantApiService';

interface BulkStudentUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cohortId?: string | null;
  isOffline?: boolean;
  onParsedData?: (data: CreateAccountRequest[]) => void;
}

interface CsvRow {
  student_id?: string;
  first_name?: string;
  last_name?: string;
  mother_name?: string;
  father_name?: string;
  date_of_birth?: string;
  parent_contact?: string;
  admission_date?: string;
  [key: string]: any;
}

interface UploadResult {
  row: number;
  name: string;
  success: boolean;
  message?: string;
}

const BulkStudentUploadModal: React.FC<BulkStudentUploadModalProps> = ({ open, onClose, onSuccess, cohortId, isOffline, onParsedData }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [tenantList, setTenantList] = useState<TenantListItem[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setFile(null);
      setUploading(false);
      setProgress(0);
      setResults([]);

      const loadTenantData = async () => {
        try {
          const data = await readTenant();
          setTenantList(data);
        } catch (error) {
          console.error('Error loading tenant data:', error);
        }
      };
      loadTenantData();
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        setFile(selectedFile);
      }
      setResults([]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setResults([]);

    const tenantId = localStorage.getItem('tenantId') || '8cf74da8-392d-4d02-8ac3-ae2204e34c0a';

    let roleId = '52d62b26-1bbe-4a58-bc82-e6b81d067f0b';
    if (tenantList) {
      const foundRoleId = getRoleIdByTenantAndRoleName(tenantList, tenantId, 'Student');
      if (foundRoleId) {
        roleId = foundRoleId;
      }
    }

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        const totalRows = rows.length;
        const parsedAccounts: CreateAccountRequest[] = [];

        for (let i = 0; i < totalRows; i++) {
          const row = rows[i];
          if (!row) continue;

          const firstName = row.first_name?.trim() || '';
          const lastName = row.last_name?.trim() || '';
          const motherName = row.mother_name?.trim() || '';
          const fatherName = row.father_name?.trim() || '';
          const dob = row.date_of_birth?.trim() || '';
          const parentContact = row.parent_contact?.trim() || '';
          const admissionDate = row.admission_date?.trim() || '';

          const name = `${firstName} ${lastName}`.trim();

          if (!firstName || !lastName) {
            uploadResults.push({
              row: i + 1,
              name: name || 'Unknown',
              success: false,
              message: 'Missing required fields (first_name, last_name)',
            });
            setProgress(Math.round(((i + 1) / totalRows) * 100));
            continue;
          }

          let studentId = row.student_id?.trim() || '';
          if (!studentId) {
            const randomDigits = Math.floor(Math.random() * 10000);
            const cleanFirstName = firstName.toLowerCase().replace(/\s+/g, '');
            const cleanLastName = lastName.toLowerCase().replace(/\s+/g, '');
            studentId = `${cleanFirstName}_${cleanLastName}_${randomDigits}`;
          }

          const username = studentId;

          const customFields = [];
          if (motherName) customFields.push({ fieldId: 'motherName', value: [motherName] });
          if (fatherName) customFields.push({ fieldId: 'fatherName', value: [fatherName] });
          if (dob) customFields.push({ fieldId: 'dob', value: [dob] });
          if (admissionDate) customFields.push({ fieldId: 'admissionDate', value: [admissionDate] });

          const accountData: CreateAccountRequest = {
            name: name,
            username: username,
            password: 'Password@123',
            firstName: firstName,
            lastName: lastName,
            ...(parentContact ? { mobile: parentContact } : {}),
            tenantCohortRoleMapping: [
              {
                tenantId: tenantId,
                roleId: roleId,
              },
            ],
            // Include custom fields if backend supports it
            ...(customFields.length > 0 ? { customFields } : {})
          };

          if (isOffline) {
            parsedAccounts.push(accountData);
            uploadResults.push({
              row: i + 1,
              name: name,
              success: true,
            });
          } else {
            try {
              const res = await createAccount(accountData);
              const newUserId = res?.result?.userId || res?.data?.userId;

              // Assign to cohort if cohortId is provided
              if (newUserId && cohortId) {
                const { post } = await import('@/services/RestClient');
                const { API_ENDPOINTS } = await import('@/services/CohortService/cohortService');
                await post(API_ENDPOINTS.cohortMemberBulkCreate, {
                  userId: [newUserId],
                  cohortId: [cohortId],
                });
              }

              uploadResults.push({
                row: i + 1,
                name: name,
                success: true,
              });
            } catch (error: any) {
              console.error(`Error creating account for row ${i + 1}:`, error);
              let errorMessage = 'Failed to create user.';

              if (error.response?.data?.params?.errmsg) {
                errorMessage = error.response.data.params.errmsg;
              } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
              } else if (error.message) {
                errorMessage = error.message;
              }

              uploadResults.push({
                row: i + 1,
                name: name,
                success: false,
                message: errorMessage,
              });
            }
          }

          setProgress(Math.round(((i + 1) / totalRows) * 100));
        }

        if (isOffline && onParsedData) {
          onParsedData(parsedAccounts);
        }

        setResults(uploadResults);
        setUploading(false);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setUploading(false);
      }
    });
  };

  const handleClose = () => {
    if (results.some(r => r.success)) {
      onSuccess();
    }
    onClose();
  };

  const successfulCount = results.filter((r) => r.success).length;
  const failedCount = results.filter((r) => !r.success).length;

  const handleDownloadTemplate = () => {
    const headers = 'student_id,first_name,last_name,mother_name,father_name,date_of_birth,parent_contact,admission_date\n';
    // Left student_id blank in the sample data to demonstrate auto-generation
    const sampleData = ',John,Doe,Jane,Richard,2010-05-15,9876543210,2024-01-10\n';
    const csvContent = headers + sampleData;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'student_upload_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onClose={uploading ? undefined : handleClose} maxWidth={false} fullWidth PaperProps={{
      sx: {
        width: '700px',
        maxWidth: '90vw',
        borderRadius: 3,
      },
    }}>
      <DialogTitle sx={{ pb: 2 }}>
        <Typography variant="h5" component="div" fontWeight="bold">
          Bulk Upload Students
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2, p: 3, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.6 }}>
            Upload a CSV file containing student details. <br />
            Required columns: <strong>first_name, last_name</strong>. <br />
            Optional columns: <strong>student_id, mother_name, father_name, date_of_birth, parent_contact, admission_date</strong>. <br />
            If <strong>student_id</strong> is blank, a unique ID will be automatically generated.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<DescriptionIcon />}
            onClick={handleDownloadTemplate}
            sx={{ alignSelf: 'flex-start' }}
          >
            Download Template
          </Button>
        </Box>

        {!uploading && results.length === 0 && (
          <Box
            sx={{
              border: '2px dashed',
              borderColor: 'primary.main',
              borderRadius: 3,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: 'rgba(25, 118, 210, 0.04)', // subtle primary color background
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: 'rgba(25, 118, 210, 0.08)',
                transform: 'translateY(-2px)',
                boxShadow: 1
              },
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <CloudUploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {file ? file.name : 'Click to select CSV file'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {file ? 'File selected' : 'or drag and drop it here'}
            </Typography>
            <input
              type="file"
              accept=".csv"
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </Box>
        )}

        {uploading && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body1" gutterBottom>
              Uploading... {progress}%
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}

        {results.length > 0 && !uploading && (
          <Box sx={{ mt: 2 }}>
            <Alert severity={failedCount === 0 ? 'success' : failedCount === results.length ? 'error' : 'warning'}>
              Successfully added {successfulCount} students. {failedCount > 0 && `${failedCount} failed.`}
            </Alert>

            <List sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
              {results.map((result, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {result.success ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <ErrorIcon color="error" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={`${result.name} (Row ${result.row})`}
                    secondary={result.message}
                    secondaryTypographyProps={{ color: 'error' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          {results.length > 0 ? 'Close' : 'Cancel'}
        </Button>
        {results.length === 0 && (
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            variant="contained"
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
          >
            Upload
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BulkStudentUploadModal;
