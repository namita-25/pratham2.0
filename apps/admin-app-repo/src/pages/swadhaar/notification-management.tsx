import React from 'react';
import { Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BellRing, Send, Clock, Plus } from 'lucide-react';
import { SWADHAAR_THEME } from '../../swadhaar/utils/swadhaar.constants';

const SwadhaarNotificationManagement = () => {
  const alerts = [
    {
      id: 'alt-01',
      title: 'Classroom Assessment Reminder Trigger',
      channel: 'SMS/WhatsApp',
      recipient: 'All Active Trainers',
      status: 'Active Schedule',
      lastSent: '2025-05-24',
    },
    {
      id: 'alt-02',
      title: 'Monthly Progress Completion Notice',
      channel: 'Email',
      recipient: 'CFL Incharge List',
      status: 'Monthly Auto',
      lastSent: '2025-05-01',
    },
    {
      id: 'alt-03',
      title: 'New Content Update Broadcaster',
      channel: 'WhatsApp',
      recipient: 'All Learners',
      status: 'Manual Event',
      lastSent: '2025-04-15',
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: SWADHAAR_THEME.primary, fontSize: { xs: '22px', sm: '26px' }, marginBottom: '4px' }}>
            Alert & Notification Broadcaster
          </Typography>
          <Typography variant="body2" sx={{ color: '#666666', fontSize: '14px' }}>
            Schedule message templates, dispatch WhatsApp cohort reminders, and audit notification registers.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<Plus size={18} />}
          sx={{
            borderRadius: '8px',
            backgroundColor: SWADHAAR_THEME.primary,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#0D1642',
            },
          }}
        >
          Create Template
        </Button>
      </Box>

      {/* Broadcaster tables */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '12px', border: '1px solid rgba(26, 35, 126, 0.08)' }}>
        <Table aria-label="notification list table">
          <TableHead sx={{ backgroundColor: 'rgba(26, 35, 126, 0.03)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: SWADHAAR_THEME.primary }}>Template Title</TableCell>
              <TableCell sx={{ fontWeight: 700, color: SWADHAAR_THEME.primary }}>Dispatch Channel</TableCell>
              <TableCell sx={{ fontWeight: 700, color: SWADHAAR_THEME.primary }}>Target Recipient</TableCell>
              <TableCell sx={{ fontWeight: 700, color: SWADHAAR_THEME.primary }}>Frequency Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: SWADHAAR_THEME.primary }}>Last Dispatched</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: SWADHAAR_THEME.primary }}>Manual Run</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{row.title}</TableCell>
                <TableCell>
                  <Chip label={row.channel} size="small" sx={{ fontWeight: 500, backgroundColor: 'rgba(26, 35, 126, 0.05)', color: SWADHAAR_THEME.primary }} />
                </TableCell>
                <TableCell sx={{ fontSize: '13px', fontWeight: 500 }}>{row.recipient}</TableCell>
                <TableCell>
                  <Chip
                    label={row.status}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(76, 175, 80, 0.08)',
                      color: '#4CAF50',
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '13px', fontWeight: 500 }}>{row.lastSent}</TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<Send size={12} />}
                    sx={{ color: SWADHAAR_THEME.secondary, fontWeight: 700 }}
                  >
                    Dispatch
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SwadhaarNotificationManagement;

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}
