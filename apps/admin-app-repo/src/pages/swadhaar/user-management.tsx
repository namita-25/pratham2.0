import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableRow, 
  Checkbox, 
  IconButton, 
  TextField, 
  InputAdornment,
  CircularProgress,
  Paper,
  TableHead,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Menu,
  SelectChangeEvent
} from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  SlidersHorizontal 
} from 'lucide-react';
import AddUserModal from '../../swadhaar/components/user-management/AddUserModal';
import EditUserDrawer from '../../swadhaar/components/user-management/EditUserDrawer';
import BulkEditDrawer from '../../swadhaar/components/user-management/BulkEditDrawer';
import { SWADHAAR_THEME, SwadhaarRole } from '../../swadhaar/utils/swadhaar.constants';
import { userList } from '../../services/UserList';
import LocationService from '../../services/LocationService';

// Mock user list as robust fallback
const MOCK_USERS = [
  {
    userId: 'usr-001',
    firstName: 'Amit',
    lastName: 'Sharma',
    name: 'Amit Sharma',
    mobile: '+919876543210',
    email: 'amit.sharma@swadhaar.org',
    gender: 'Male',
    roleName: 'CFL Incharge',
    status: 'active',
    createdAt: '2026-01-10T12:00:00Z',
    tenantCohortRoleMapping: [{ roleName: 'CFL Incharge' }],
    customFields: [
      { label: 'STATES', value: 'Maharashtra', code: 'st-01' },
      { label: 'DISTRICTS', value: 'Mumbai', code: 'dt-01' },
    ]
  },
  {
    userId: 'usr-002',
    firstName: 'Priya',
    lastName: 'Patil',
    name: 'Priya Patil',
    mobile: '+919812345678',
    email: 'priya.patil@swadhaar.org',
    gender: 'Female',
    roleName: 'Trainer',
    status: 'active',
    createdAt: '2026-02-15T12:00:00Z',
    tenantCohortRoleMapping: [{ roleName: 'Trainer' }],
    customFields: [
      { label: 'STATES', value: 'Maharashtra', code: 'st-01' },
      { label: 'DISTRICTS', value: 'Pune', code: 'dt-02' },
    ]
  },
  {
    userId: 'usr-003',
    firstName: 'Rajesh',
    lastName: 'Verma',
    name: 'Rajesh Verma',
    mobile: '+917890123456',
    email: 'rajesh.verma@swadhaar.org',
    gender: 'Male',
    roleName: 'Trainer',
    status: 'suspended',
    createdAt: '2026-03-01T12:00:00Z',
    tenantCohortRoleMapping: [{ roleName: 'Trainer' }],
    customFields: [
      { label: 'STATES', value: 'Gujarat', code: 'st-02' },
      { label: 'DISTRICTS', value: 'Ahmedabad', code: 'dt-03' },
    ]
  }
];

const SwadhaarUserManagement = () => {
  const [adminRole, setAdminRole] = useState<string>('admin');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection matrices
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Page index limits
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Sorting state
  const [sortBy, setSortBy] = useState<string>('firstName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter values
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');

  // Dynamic lists from LocationService
  const [statesList, setStatesList] = useState<any[]>([]);
  const [districtsList, setDistrictsList] = useState<any[]>([]);

  // Drawer overlays
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<any | null>(null);

  // Actions menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuActiveRow, setMenuActiveRow] = useState<any | null>(null);

  // Load Admin role info from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('roleName') || 'admin';
      setAdminRole(storedRole);
    }
  }, []);

  // Fetch States on component mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const states = await LocationService.getStates();
        setStatesList(states);
      } catch (error) {
        console.error('Error fetching states:', error);
      }
    };
    fetchStates();
  }, []);

  // Fetch Districts when selectedState changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (selectedState === 'All') {
        setDistrictsList([]);
        setSelectedDistrict('All');
        return;
      }
      try {
        const districts = await LocationService.getDistricts(selectedState);
        setDistrictsList(districts);
        setSelectedDistrict('All');
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    };
    fetchDistricts();
  }, [selectedState]);

  // Main fetch function incorporating API & Fallback
  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const limit = rowsPerPage;
      const offset = page * rowsPerPage;

      // Find state and district names for filtering if selected
      const stateObj = statesList.find(s => s.id === selectedState);
      const districtObj = districtsList.find(d => d.id === selectedDistrict);

      const filters: any = {
        role:'Learner' ,//selectedRole !== 'Learner' ? selectedRole : undefined,
        status:'active' ,//selectedStatus !== 'Active' ? selectedStatus.toLowerCase() : undefined,
        firstName: searchQuery || undefined,
        username: searchQuery || undefined,
      };

      if (stateObj) {
        filters.state = [stateObj.name];
      }
      if (districtObj) {
        filters.district = [districtObj.name];
      }

      const sortParam = [sortBy, sortOrder];
      
      const response = await userList({
        limit,
        offset,
        filters,
        sort: sortParam,
      });

      const userDetails = response?.getUserDetails;
      const count = response?.totalCount;

      if (userDetails && userDetails.length > 0) {
        setUsers(userDetails);
        setTotalCount(count || userDetails.length);
      } else {
        // Fallback to MOCK_USERS if API yields empty array
        let filteredMock = [...MOCK_USERS];
        
        if (selectedRole !== 'All') {
          filteredMock = filteredMock.filter(u => u.roleName === selectedRole);
        }
        if (selectedStatus !== 'All') {
          filteredMock = filteredMock.filter(u => u.status === selectedStatus.toLowerCase());
        }
        if (stateObj) {
          filteredMock = filteredMock.filter(u => 
            u.customFields?.some(f => f.label === 'STATES' && f.value === stateObj.name)
          );
        }
        if (districtObj) {
          filteredMock = filteredMock.filter(u => 
            u.customFields?.some(f => f.label === 'DISTRICTS' && f.value === districtObj.name)
          );
        }
        if (searchQuery) {
          const term = searchQuery.toLowerCase();
          filteredMock = filteredMock.filter(u => 
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term) ||
            u.mobile.toLowerCase().includes(term)
          );
        }

        // Apply Sorting to Mock Data
        filteredMock.sort((a: any, b: any) => {
          let valA = a[sortBy] || '';
          let valB = b[sortBy] || '';
          if (sortBy === 'createdAt') {
            valA = new Date(a.createdAt).getTime();
            valB = new Date(b.createdAt).getTime();
          }
          if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
          if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });

        setUsers(filteredMock);
        setTotalCount(filteredMock.length);
      }
    } catch (error) {
      console.error('Error fetching users, relying on mock fallback:', error);
      setUsers(MOCK_USERS);
      setTotalCount(MOCK_USERS.length);
    } finally {
      setLoading(false);
    }
  };

  // Re-trigger fetch when filters/sort change
  useEffect(() => {
    fetchUsersData();
  }, [
    page, 
    rowsPerPage, 
    searchQuery, 
    selectedRole, 
    selectedStatus, 
    selectedState, 
    selectedDistrict, 
    sortBy, 
    sortOrder,
    statesList
  ]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(users.map(u => u.userId || u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    if (e.target.checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(0);
  };

  const getSortIcon = (field: string) => {
    if (sortBy === field) {
      return sortOrder === 'asc' ? <ArrowUp size={14} style={{ marginLeft: '4px' }} /> : <ArrowDown size={14} style={{ marginLeft: '4px' }} />;
    }
    return <ArrowUpDown size={14} style={{ marginLeft: '4px', opacity: 0.5 }} />;
  };

  const handleEditClick = (user: any) => {
    setActiveUser(user);
    setIsEditOpen(true);
    handleMenuClose();
  };

  const handleSuccessCallback = () => {
    fetchUsersData();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Actions menu triggers
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, row: any) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuActiveRow(row);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuActiveRow(null);
  };

  // Date joined Formatter helper
  const formatDateJoined = (dateStr: string) => {
    if (!dateStr) return '01-01-2026';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '01-01-2026';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (e) {
      return '01-01-2026';
    }
  };

  const addLabel = adminRole === SwadhaarRole.CFL_INCHARGE ? 'Add CFL Incharge' : 'Add User';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Title Block with dynamic selections */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <Box>
         
          {selectedIds.length > 0 && (
            <Typography variant="caption" sx={{ color: SWADHAAR_THEME.secondary, fontWeight: 700, mt: 1, display: 'block' }}>
              {selectedIds.length} user{selectedIds.length > 1 ? 's' : ''} selected
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: '16px' }}>
          {selectedIds.length > 0 && (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setIsBulkOpen(true)}
              sx={{
                borderRadius: '8px',
                borderColor: SWADHAAR_THEME.primary,
                color: SWADHAAR_THEME.primary,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
              }}
            >
              Bulk Edit
            </Button>
          )}

          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus size={18} />}
            onClick={() => setIsAddOpen(true)}
            sx={{
              borderRadius: '8px',
              backgroundColor: SWADHAAR_THEME.primary,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              '&:hover': {
                backgroundColor: '#0D1642',
              },
            }}
          >
            {addLabel}
          </Button>
        </Box>
      </Box>

      {/* Modern Filter Ribbon */}
      <Card
        elevation={0}
        sx={{
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid rgba(26, 35, 126, 0.08)',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <Box sx={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            sx={{ flexGrow: 1, minWidth: '260px' }}
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by full name, phone number, email..."
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color="rgba(26, 35, 126, 0.4)" />
                </InputAdornment>
              ),
            }}
          />
          {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#364153', fontSize: '14px', fontWeight: 600 }}>
            <SlidersHorizontal size={16} />
            Filters
          </Box> */}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: '16px' }}>
          <FormControl size="small" fullWidth>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={selectedRole}
              label="Role"
              onChange={(e: SelectChangeEvent) => {
                setSelectedRole(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="All">All Roles</MenuItem>
              <MenuItem value="CFL Incharge">CFL Incharge</MenuItem>
              <MenuItem value="Trainer">Trainer</MenuItem>
              <MenuItem value="Supervisor">Supervisor</MenuItem>
              <MenuItem value="Staff">Staff</MenuItem>
              <MenuItem value="Content creator">Content creator</MenuItem>
              <MenuItem value="Content reviewer">Content reviewer</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={selectedStatus}
              label="Status"
              onChange={(e: SelectChangeEvent) => {
                setSelectedStatus(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel id="state-select-label">State</InputLabel>
            <Select
              labelId="state-select-label"
              value={selectedState}
              label="State"
              onChange={(e: SelectChangeEvent) => {
                setSelectedState(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="All">All States</MenuItem>
              {statesList.map(s => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth disabled={selectedState === 'All'}>
            <InputLabel id="district-select-label">District</InputLabel>
            <Select
              labelId="district-select-label"
              value={selectedDistrict}
              label="District"
              onChange={(e: SelectChangeEvent) => {
                setSelectedDistrict(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="All">All Districts</MenuItem>
              {districtsList.map(d => (
                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Card>

      {/* Directory Table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '12px', border: '1px solid rgba(26, 35, 126, 0.08)' }}>
        <Table sx={{ minWidth: 800 }} aria-label="user directory table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#9D9D9D33' }}>
              <TableCell padding="checkbox" sx={{ backgroundColor: '#9D9D9D33', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                <Checkbox
                  indeterminate={selectedIds.length > 0 && selectedIds.length < users.length}
                  checked={users.length > 0 && selectedIds.length === users.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              
              <TableCell 
                onClick={() => handleSort('firstName')}
                sx={{
                  backgroundColor: '#9D9D9D33',
                  color: '#364153',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '12.25px',
                  lineHeight: '17.5px',
                  letterSpacing: '0px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  First name {getSortIcon('firstName')}
                </Box>
              </TableCell>

              <TableCell 
                onClick={() => handleSort('lastName')}
                sx={{
                  backgroundColor: '#9D9D9D33',
                  color: '#364153',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '12.25px',
                  lineHeight: '17.5px',
                  letterSpacing: '0px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Last name {getSortIcon('lastName')}
                </Box>
              </TableCell>

              <TableCell 
                onClick={() => handleSort('createdAt')}
                sx={{
                  backgroundColor: '#9D9D9D33',
                  color: '#364153',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '12.25px',
                  lineHeight: '17.5px',
                  letterSpacing: '0px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Date joined {getSortIcon('createdAt')}
                </Box>
              </TableCell>

              <TableCell 
                onClick={() => handleSort('role')}
                sx={{
                  backgroundColor: '#9D9D9D33',
                  color: '#364153',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '12.25px',
                  lineHeight: '17.5px',
                  letterSpacing: '0px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Role {getSortIcon('role')}
                </Box>
              </TableCell>

              <TableCell 
                onClick={() => handleSort('mobile')}
                sx={{
                  backgroundColor: '#9D9D9D33',
                  color: '#364153',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '12.25px',
                  lineHeight: '17.5px',
                  letterSpacing: '0px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Contact Number {getSortIcon('mobile')}
                </Box>
              </TableCell>

              <TableCell 
                onClick={() => handleSort('email')}
                sx={{
                  backgroundColor: '#9D9D9D33',
                  color: '#364153',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '12.25px',
                  lineHeight: '17.5px',
                  letterSpacing: '0px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Email {getSortIcon('email')}
                </Box>
              </TableCell>

              <TableCell 
                onClick={() => handleSort('status')}
                sx={{
                  backgroundColor: '#9D9D9D33',
                  color: '#364153',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '12.25px',
                  lineHeight: '17.5px',
                  letterSpacing: '0px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Status {getSortIcon('status')}
                </Box>
              </TableCell>

              <TableCell 
                align="center"
                sx={{
                  backgroundColor: '#9D9D9D33',
                  color: '#364153',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '12.25px',
                  lineHeight: '17.5px',
                  letterSpacing: '0px',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <CircularProgress sx={{ color: SWADHAAR_THEME.primary }} size={36} />
                  <Typography variant="body2" sx={{ mt: 2, color: '#666666' }}>Fetching operational records...</Typography>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                    No users matched your query. Try resetting filters.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((row) => {
                const id = row.userId || row.id;
                const isSelected = selectedIds.includes(id);
                const roleLabel = row.role || row.roleName || 'Trainer';
                const statusLabel = row.status || 'active';

                return (
                  <TableRow
                    key={id}
                    hover
                    selected={isSelected}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(e, id)}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F1B13' }}>
                      {row.firstName || '-'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F1B13' }}>
                      {row.lastName || '-'}
                    </TableCell>
                    <TableCell sx={{ color: '#4A4A4A', fontSize: '13px' }}>
                      {formatDateJoined(row.createdAt)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: '#1A237E' }}>
                      {roleLabel}
                    </TableCell>
                    <TableCell sx={{ color: '#4A4A4A', fontSize: '13px' }}>
                      {row.mobile && row.mobile !== 'NaN' ? row.mobile : '-'}
                    </TableCell>
                    <TableCell sx={{ color: '#4A4A4A', fontSize: '13px' }}>
                      {row.email || '-'}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          width: '67.31px',
                          height: '19.09px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '3.5px',
                          padding: '1.75px 7px',
                          borderRadius: '6.75px',
                          // border: '0.8px solid #000000',
                          backgroundColor: statusLabel.toLowerCase() === 'active' ? '#DCFCE7' : '#FEE2E2',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '10.5px',
                          lineHeight: '14px',
                          letterSpacing: '0px',
                          color: statusLabel.toLowerCase() === 'active' ? '#016630' : '#991B1B',
                          textAlign: 'center',
                          boxSizing: 'border-box'
                        }}
                      >
                        {statusLabel.toUpperCase()}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={(e) => handleMenuClick(e, row)} size="small">
                        <MoreVertical size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Row Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEditClick(menuActiveRow)}>Edit User</MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'red' }}>Archive User</MenuItem>
      </Menu>

      {/* Side Slide Drawers */}
      <AddUserModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={handleSuccessCallback}
      />

      <EditUserDrawer
        open={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setActiveUser(null);
        }}
        user={activeUser}
        onSuccess={handleSuccessCallback}
      />

      <BulkEditDrawer
        open={isBulkOpen}
        onClose={() => {
          setIsBulkOpen(false);
          setSelectedIds([]);
        }}
        selectedUserIds={selectedIds}
        onSuccess={handleSuccessCallback}
      />
    </Box>
  );
};

export default SwadhaarUserManagement;

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}
