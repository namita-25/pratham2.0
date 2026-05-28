import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Switch, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Shield, Users, Lock } from 'lucide-react';
import { SWADHAAR_THEME } from '../../swadhaar/utils/swadhaar.constants';

const SwadhaarRoleManagement = () => {
  const roles = [
    {
      name: 'admin',
      description: 'Super administrative control over all parameters.',
      usersCount: 2,
      color: '#BA1A1A',
    },
    {
      name: 'CFL Incharge',
      description: 'Manages trainers, cohorts, and assigns geographical Village coverage.',
      usersCount: 5,
      color: '#1A237E',
    },
    {
      name: 'Trainer',
      description: 'Active trainer delivering curriculums and submitting completion audits.',
      usersCount: 28,
      color: '#FF8F00',
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: SWADHAAR_THEME.primary, fontSize: { xs: '22px', sm: '26px' }, marginBottom: '4px' }}>
          Role & Access Security
        </Typography>
        <Typography variant="body2" sx={{ color: '#666666', fontSize: '14px' }}>
          Overview of platform privilege assignments and active credentials.
        </Typography>
      </Box>

      {/* Role list cards */}
      <Grid container spacing={3}>
        {roles.map((r) => (
          <Grid item xs={12} md={4} key={r.name}>
            <Card
              elevation={0}
              sx={{
                borderRadius: '16px',
                border: '1px solid rgba(26, 35, 126, 0.08)',
                backgroundColor: '#FFFFFF',
                height: '100%',
              }}
            >
              <CardContent sx={{ padding: '24px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Shield size={20} color={r.color} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: SWADHAAR_THEME.primary }}>
                    {r.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ minHeight: '40px', marginBottom: '16px' }}>
                  {r.description}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: r.color }}>
                    Active Personnel: {r.usersCount}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Permissions matrix table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '12px', border: '1px solid rgba(26, 35, 126, 0.08)' }}>
        <Table aria-label="permissions matrix table">
          <TableHead sx={{ backgroundColor: 'rgba(26, 35, 126, 0.03)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: SWADHAAR_THEME.primary }}>Privilege Scope</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: SWADHAAR_THEME.primary }}>Admin</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: SWADHAAR_THEME.primary }}>CFL Incharge</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: SWADHAAR_THEME.primary }}>Trainer</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow hover>
              <TableCell sx={{ fontWeight: 600 }}>Create/Delete Cohorts</TableCell>
              <TableCell align="center"><Switch checked={true} disabled /></TableCell>
              <TableCell align="center"><Switch checked={false} disabled /></TableCell>
              <TableCell align="center"><Switch checked={false} disabled /></TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell sx={{ fontWeight: 600 }}>Invite CFL Incharge Users</TableCell>
              <TableCell align="center"><Switch checked={true} disabled /></TableCell>
              <TableCell align="center"><Switch checked={false} disabled /></TableCell>
              <TableCell align="center"><Switch checked={false} disabled /></TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell sx={{ fontWeight: 600 }}>Assign Village Geographic Coverage</TableCell>
              <TableCell align="center"><Switch checked={true} disabled /></TableCell>
              <TableCell align="center"><Switch checked={true} disabled /></TableCell>
              <TableCell align="center"><Switch checked={false} disabled /></TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell sx={{ fontWeight: 600 }}>Submit Student Audits</TableCell>
              <TableCell align="center"><Switch checked={true} disabled /></TableCell>
              <TableCell align="center"><Switch checked={true} disabled /></TableCell>
              <TableCell align="center"><Switch checked={true} disabled /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SwadhaarRoleManagement;

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}
