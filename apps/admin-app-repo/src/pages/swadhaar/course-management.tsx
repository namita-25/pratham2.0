import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Chip, 
  Divider, 
  Button, 
  Tab, 
  Tabs 
} from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BookOpen, Calendar, GraduationCap, Users } from 'lucide-react';
import CohortUserBadges from '../../swadhaar/components/cohort-management/CohortUserBadges';
import { SWADHAAR_THEME } from '../../swadhaar/utils/swadhaar.constants';

const SwadhaarCourseManagement = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Mock training cohorts
  const [cohorts, setCohorts] = useState([
    {
      cohortId: 'cohort-101',
      name: 'Swadhaar Basic Financial Literacy Cohort A',
      description: 'Training module for entry level trainers in Mumbai region.',
      startDate: '2025-06-01',
      endDate: '2025-12-31',
      members: [
        { userId: 'usr-002', name: 'Priya Patil' },
        { userId: 'usr-003', name: 'Rajesh Verma' }
      ]
    },
    {
      cohortId: 'cohort-102',
      name: 'Advanced Business Mentorship Cohort B',
      description: 'Specialized enterprise coaching techniques.',
      startDate: '2025-07-15',
      endDate: '2026-01-15',
      members: [
        { userId: 'usr-003', name: 'Rajesh Verma' }
      ]
    }
  ]);

  // Mock curriculum courses
  const courses = [
    {
      id: 'crs-01',
      title: 'Financial Literacy Trainer Handbook',
      category: 'Financial Literacy',
      duration: '4 Weeks',
      modules: 8,
    },
    {
      id: 'crs-02',
      title: 'Digital Banking & Security Procedures',
      category: 'Digital Services',
      duration: '2 Weeks',
      modules: 4,
    },
    {
      id: 'crs-03',
      title: 'Micro-Enterprise Debt & Management Rules',
      category: 'Business Development',
      duration: '6 Weeks',
      modules: 12,
    }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMemberRemovedCallback = () => {
    console.log('Member membership removed successfully!');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      {/* Header Title */}
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: SWADHAAR_THEME.primary,
            fontSize: { xs: '22px', sm: '26px' },
            marginBottom: '4px',
          }}
        >
          Curriculum & Cohort Control
        </Typography>
        <Typography variant="body2" sx={{ color: '#666666', fontSize: '14px' }}>
          Organize classroom cohorts, map learner enrollment limits, and view assigned trainers.
        </Typography>
      </Box>

      {/* Tabs Menu */}
      <Box sx={{ borderBottom: '1px solid rgba(26, 35, 126, 0.08)' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: SWADHAAR_THEME.primary,
            },
            '& .MuiTab-root': {
              fontWeight: 600,
              color: 'rgba(26, 35, 126, 0.6)',
              '&.Mui-selected': {
                color: SWADHAAR_THEME.primary,
              },
            },
          }}
        >
          <Tab label="Operational Cohorts" />
          <Tab label="Curriculum Library" />
        </Tabs>
      </Box>

      {/* Tab Panel 1: Operational Cohorts */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {cohorts.map((cohort) => (
            <Grid item xs={12} key={cohort.cohortId}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  border: '1px solid rgba(26, 35, 126, 0.08)',
                  backgroundColor: '#FFFFFF',
                  padding: '24px',
                }}
              >
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                  <Grid container spacing={3}>
                    {/* Cohort metadata */}
                    <Grid item xs={12} md={5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <GraduationCap size={22} color={SWADHAAR_THEME.secondary} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: SWADHAAR_THEME.primary }}>
                          {cohort.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="textSecondary" sx={{ marginBottom: '16px' }}>
                        {cohort.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} color="rgba(0,0,0,0.4)" />
                          <Typography variant="caption" sx={{ fontWeight: 500 }}>
                            {cohort.startDate} to {cohort.endDate}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={1}>
                      <Divider orientation="vertical" sx={{ display: { xs: 'none', md: 'block' }, height: '100%' }} />
                      <Divider sx={{ display: { xs: 'block', md: 'none' }, my: 1 }} />
                    </Grid>

                    {/* Member chips with removal cross handles */}
                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: SWADHAAR_THEME.primary, marginBottom: '12px' }}
                      >
                        Assigned Training Personnel
                      </Typography>
                      <CohortUserBadges
                        cohortId={cohort.cohortId}
                        members={cohort.members}
                        onMemberRemoved={handleMemberRemovedCallback}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Tab Panel 2: Curriculum Library */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card
                sx={{
                  borderRadius: '16px',
                  border: '1px solid rgba(26, 35, 126, 0.05)',
                  backgroundColor: '#FFFFFF',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(26, 35, 126, 0.05)',
                  },
                }}
              >
                <CardContent sx={{ padding: '24px' }}>
                  <Chip
                    label={course.category}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 143, 0, 0.08)',
                      color: '#FF8F00',
                      fontWeight: 600,
                      marginBottom: '16px',
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: SWADHAAR_THEME.primary,
                      fontSize: '16px',
                      marginBottom: '8px',
                      lineHeight: 1.3,
                    }}
                  >
                    {course.title}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '20px',
                      paddingTop: '16px',
                      borderTop: '1px solid rgba(26, 35, 126, 0.05)',
                    }}
                  >
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                      {course.modules} Modules
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                      {course.duration}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default SwadhaarCourseManagement;

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}
