import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Box, Typography, Grid, Card, Button, LinearProgress, Avatar } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { 
  Users, 
  Percent, 
  Target, 
  Bell, 
  Download, 
  TrendingUp 
} from 'lucide-react';


const SwadhaarDashboard = () => {
  const [adminName, setAdminName] = useState<string>('Super Admin');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const adminInfoStr = localStorage.getItem('adminInfo');
      if (adminInfoStr) {
        try {
          const adminInfo = JSON.parse(adminInfoStr);
          const fullName = `${adminInfo.firstName || ''} ${adminInfo.lastName || ''}`.trim();
          if (fullName) {
            setAdminName(fullName);
          } else if (adminInfo.username) {
            setAdminName(adminInfo.username);
          }
        } catch (e) {
          console.error('Error parsing adminInfo on dashboard page', e);
        }
      }
    }
  }, []);

  // Metrics Data
  const metrics = [
    {
      title: 'ACTIVE LEARNERS',
      value: '1,170',
      trend: '+18.2%',
      icon: Users,
      iconBg: '#F9F5FF',
      iconColor: '#7F56D9',
    },
    {
      title: 'COMPLETION RATE',
      value: '74%',
      trend: '+3.5%',
      icon: Percent,
      iconBg: '#F0FDF9',
      iconColor: '#0E9384',
    },
    {
      title: 'AVG. ASSESSMENT SCORE',
      value: '82',
      trend: '+5.8%',
      icon: Target,
      iconBg: '#ECFDF3',
      iconColor: '#079455',
    },
    {
      title: 'NOTIFICATIONS SENT (30D)',
      value: '8,412',
      trend: '+12.4%',
      icon: Bell,
      iconBg: '#FEF0C7',
      iconColor: '#DC6803',
    },
  ];

  // Cohort Progress Data
  const cohorts = [
    { name: 'Madhya Pradesh', progress: 88 },
    { name: 'Jharkhand', progress: 65 },
    { name: 'Bihar', progress: 54 },
    { name: 'Maharashtra', progress: 12 },
  ];

  // Recent Activity Data
  const activities = [
    {
      user: 'Vikram Singh',
      action: 'published course',
      target: 'Foundations of Microfinance',
      time: '2h ago',
      initials: 'VS',
      avatarBg: '#E0F2FE',
      avatarColor: '#0369A1',
    },
    {
      user: 'Aman Verma',
      action: 'sent notification to',
      target: 'Sub-Cohort: Designer',
      time: '5h ago',
      initials: 'AV',
      avatarBg: '#FEE2E2',
      avatarColor: '#B91C1C',
    },
    {
      user: 'Priya Iyer',
      action: 'enrolled 20 users into',
      target: 'Branch Manager Track',
      time: '1d ago',
      initials: 'PI',
      avatarBg: '#F0FDF4',
      avatarColor: '#15803D',
    },
    {
      user: 'Super Admin',
      action: 'cleared the cache',
      target: '',
      time: '2d ago',
      initials: 'SA',
      avatarBg: '#F3E8FF',
      avatarColor: '#6B21A8',
    },
    {
      user: 'Sakshi Kumar',
      action: 'indexed records for',
      target: 'KYC Process Quick Check',
      time: '4d ago',
      initials: 'SK',
      avatarBg: '#FEF3C7',
      avatarColor: '#B45309',
    },
  ];

  // Active Learning Journeys Data
  const journeys = [
    {
      title: 'New Field Officer Onboarding',
      cohorts: 9,
      enrolled: 120,
      progress: 35,
    },
    {
      title: 'Branch Manager Track',
      cohorts: 5,
      enrolled: 45,
      progress: 40,
    },
    {
      title: 'Compliance Refresher 2026',
      cohorts: 15,
      enrolled: 320,
      progress: 85,
    },
    {
      title: 'Digital Collections Specialist',
      cohorts: 8,
      enrolled: 90,
      progress: 22,
    },
  ];

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '32px', 
        width: '100%',
        paddingBottom: '40px',
        backgroundColor: '#FCFCFD',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* Welcome Greeting & Top Actions Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', md: 'center' }, 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 2 
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#101828',
              fontSize: { xs: '24px', sm: '30px' },
              lineHeight: '38px',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            Welcome back, {adminName}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#475467',
              fontSize: '14px',
              mt: '4px',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            Real-time view of learners, content, and platform activity across all cohorts.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: '12px', width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            startIcon={<Download size={18} />}
            sx={{
              borderColor: '#D0D5DD',
              color: '#344054',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              px: '16px',
              py: '10px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              backgroundColor: '#FFFFFF',
              boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
              '&:hover': {
                borderColor: '#D0D5DD',
                backgroundColor: '#F9FAFB',
              }
            }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#2F54EB', // Premium royal blue
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              px: '16px',
              py: '10px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
              '&:hover': {
                backgroundColor: '#1D39C4',
              }
            }}
          >
            View reports
          </Button>
        </Box>
      </Box>

      {/* 4 Premium Metrics Cards */}
      <Grid container spacing={3}>
        {metrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={metric.title}>
              <Card
                elevation={0}
                sx={{
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #EAECF0',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  boxShadow: 'none',
                }}
              >
                <Box>
                  <Typography 
                    sx={{ 
                      fontSize: '12px', 
                      fontWeight: 600, 
                      color: '#475467', 
                      letterSpacing: '0.05em', 
                      mb: '12px',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {metric.title}
                  </Typography>
                  <Typography 
                    sx={{ 
                      fontSize: '30px', 
                      fontWeight: 700, 
                      color: '#101828', 
                      lineHeight: '38px', 
                      mb: '12px',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {metric.value}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        color: '#12B76A', 
                        fontSize: '12px', 
                        fontWeight: 600,
                        backgroundColor: '#ECFDF3',
                        px: '8px',
                        py: '2px',
                        borderRadius: '12px',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    >
                      <TrendingUp size={12} style={{ marginRight: '4px' }} />
                      {metric.trend}
                    </Box>
                    <Typography 
                      sx={{ 
                        fontSize: '12px', 
                        color: '#475467', 
                        fontWeight: 500,
                        fontFamily: 'Inter, sans-serif' 
                      }}
                    >
                      vs last month
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: metric.iconBg,
                    color: metric.iconColor,
                  }}
                >
                  <IconComponent size={24} />
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Cohort Progress & Recent Activity Column Layout */}
      <Grid container spacing={3}>
        {/* Cohort Progress Chart List */}
        <Grid item xs={12} md={7} lg={8}>
          <Card 
            elevation={0}
            sx={{ 
              p: '24px', 
              borderRadius: '12px', 
              border: '1px solid #EAECF0', 
              backgroundColor: '#FFFFFF', 
              boxShadow: 'none', 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '20px' }}>
                <Box>
                  <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#101828', fontFamily: 'Inter, sans-serif' }}>
                    Cohort progress
                  </Typography>
                  <Typography sx={{ fontSize: '13px', color: '#475467', mt: '2px', fontFamily: 'Inter, sans-serif' }}>
                    Avg. learning completion across top active cohorts
                  </Typography>
                </Box>
                <Link href="/swadhaar/cohort-management" style={{ textDecoration: 'none' }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#2F54EB', display: 'flex', alignItems: 'center', gap: '4px', '&:hover': { color: '#1D39C4' }, fontFamily: 'Inter, sans-serif' }}>
                    All cohorts
                  </Typography>
                </Link>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px', mt: '8px' }}>
                {cohorts.map((cohort) => (
                  <Box key={cohort.name}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '8px' }}>
                      <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#344054', fontFamily: 'Inter, sans-serif' }}>
                        {cohort.name}
                      </Typography>
                      <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#101828', fontFamily: 'Inter, sans-serif' }}>
                        {cohort.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={cohort.progress}
                      sx={{
                        height: '8px',
                        borderRadius: '4px',
                        backgroundColor: '#EAECF0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#6366F1', // Indigo/violet progress bar
                          borderRadius: '4px',
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Recent Activity Logs */}
        <Grid item xs={12} md={5} lg={4}>
          <Card 
            elevation={0}
            sx={{ 
              p: '24px', 
              borderRadius: '12px', 
              border: '1px solid #EAECF0', 
              backgroundColor: '#FFFFFF', 
              boxShadow: 'none', 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ mb: '20px' }}>
              <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#101828', fontFamily: 'Inter, sans-serif' }}>
                Recent activity
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#475467', mt: '2px', fontFamily: 'Inter, sans-serif' }}>
                Latest updates across system
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
              {activities.map((activity, index) => (
                <Box key={index} sx={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Avatar
                    sx={{
                      width: '36px',
                      height: '36px',
                      fontSize: '14px',
                      fontWeight: 600,
                      backgroundColor: activity.avatarBg,
                      color: activity.avatarColor,
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {activity.initials}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '14px', color: '#344054', lineHeight: 1.4, fontFamily: 'Inter, sans-serif' }}>
                      <span style={{ fontWeight: 700, color: '#101828' }}>{activity.user}</span>{' '}
                      {activity.action}{' '}
                      {activity.target && (
                        <span style={{ fontWeight: 600, color: '#2F54EB' }}>{activity.target}</span>
                      )}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#475467', mt: '2px', fontFamily: 'Inter, sans-serif' }}>
                      {activity.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Active Learning Journeys Section */}
      <Box sx={{ mt: '16px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '20px' }}>
          <Box>
            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#101828', fontFamily: 'Inter, sans-serif' }}>
              Active learning journeys
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#475467', mt: '2px', fontFamily: 'Inter, sans-serif' }}>
              Top journeys by enrollment and progress
            </Typography>
          </Box>
          <Link href="/swadhaar/course-management" style={{ textDecoration: 'none' }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#2F54EB', display: 'flex', alignItems: 'center', gap: '4px', '&:hover': { color: '#1D39C4' }, fontFamily: 'Inter, sans-serif' }}>
              Manage
            </Typography>
          </Link>
        </Box>
        
        <Grid container spacing={3}>
          {journeys.map((journey) => (
            <Grid item xs={12} sm={6} md={3} key={journey.title}>
              <Card
                elevation={0}
                sx={{
                  p: '20px',
                  borderRadius: '12px',
                  border: '1px solid #EAECF0',
                  backgroundColor: '#FFFFFF',
                  boxShadow: 'none',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 10px 20px rgba(16, 24, 40, 0.05)',
                    borderColor: '#2F54EB',
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '16px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', px: '8px', py: '2px', borderRadius: '12px', backgroundColor: '#ECFDF3' }}>
                    <Box sx={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#12B76A' }} />
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#027A48', fontFamily: 'Inter, sans-serif' }}>
                      Active
                    </Typography>
                  </Box>
                </Box>
                
                <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#101828', mb: '8px', minHeight: '44px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
                  {journey.title}
                </Typography>
                
                <Typography sx={{ fontSize: '13px', color: '#475467', mb: '20px', fontFamily: 'Inter, sans-serif' }}>
                  {journey.cohorts} cohorts • {journey.enrolled} enrolled
                </Typography>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '6px' }}>
                    <Typography sx={{ fontSize: '12px', color: '#475467', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
                      Progress
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#101828', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                      {journey.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={journey.progress}
                    sx={{
                      height: '6px',
                      borderRadius: '3px',
                      backgroundColor: '#EAECF0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#6366F1',
                        borderRadius: '3px',
                      }
                    }}
                  />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default SwadhaarDashboard;

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}
