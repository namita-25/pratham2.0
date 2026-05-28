import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AppBar, Toolbar, IconButton, Box, Typography, Chip } from '@mui/material';
import { Menu, Calendar } from 'lucide-react';
import { SWADHAAR_THEME } from '../../utils/swadhaar.constants';
import { SwadhaarMenuItems } from './SwadhaarMenuItems';

interface SwadhaarHeaderProps {
  onSidebarToggle: () => void;
  isSidebarCollapsed: boolean;
}

const SwadhaarHeader: React.FC<SwadhaarHeaderProps> = ({ 
  onSidebarToggle,
  isSidebarCollapsed,
}) => {
  const router = useRouter();
  const [academicYear, setAcademicYear] = useState<string>('2025-2026');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedYear = localStorage.getItem('academicYearName') || '2025-2026';
      setAcademicYear(storedYear);
    }
  }, []);

  const getHeaderContent = () => {
    const path = router.pathname;
    
    switch (path) {
      case '/swadhaar/dashboard':
        return {
          title: 'Dashboard',
          subtitle: 'Overview of your educational platform and key metrics',
        };
      case '/swadhaar/user-management':
        return {
          title: 'User Management',
          subtitle: 'Manage Swadhaar platform users, create new profiles, and configure roles',
        };
      case '/swadhaar/role-management':
        return {
          title: 'Role Management',
          subtitle: 'Configure user roles, permissions, and access controls',
        };
      case '/swadhaar/content-library':
        return {
          title: 'Content Library',
          subtitle: 'Browse instructional manuals, download interactive cohort worksheets, and preview trainer guides.',
        };
      case '/swadhaar/course-management':
        return {
          title: 'Course Management',
          subtitle: 'Create and manage training programs, courses, and resources',
        };
      case '/swadhaar/notification-management':
        return {
          title: 'Notification Management',
          subtitle: 'Configure and send notification templates to users',
        };
      case '/swadhaar/analytics':
        return {
          title: 'Metabase Analytics',
          subtitle: 'View platform metrics, analytics, and interactive dashboards',
        };
      default:
        // Match from SwadhaarMenuItems if possible, otherwise fallback
        const item = SwadhaarMenuItems.find(i => i.href === path);
        if (item) {
          return {
            title: item.title,
            subtitle: `Manage your ${item.title.toLowerCase()} platform settings and operations`,
          };
        }
        return {
          title: 'Swadhaar Training of Trainers',
          subtitle: 'Browse instructional manuals, download interactive cohort worksheets, and preview trainer guides.',
        };
    }
  };

  const { title, subtitle } = getHeaderContent();

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: '#FFFFFF',
        color: '#1F1B13',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        width: { lg: `calc(100% - ${isSidebarCollapsed ? '80px' : '280px'})` },
        ml: { lg: isSidebarCollapsed ? '80px' : '280px' },
        transition: 'width 0.3s ease, margin-left 0.3s ease',
        zIndex: (theme) => theme.zIndex.drawer - 1,
      }}
    >
      <Toolbar
        sx={{
          height: '88px',
          display: 'flex',
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3 },
        }}
      >
        {/* Left Toggle and Title/Subtitle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onSidebarToggle}
            sx={{ display: { lg: 'none' }, color: '#1C2B4A' }}
          >
            <Menu size={24} />
          </IconButton>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Typography
              noWrap
              sx={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: { xs: '20px', sm: '26.25px' },
                lineHeight: { xs: '24px', sm: '31.5px' },
                letterSpacing: '0px',
                color: '#101828',
              }}
            >
              {title}
            </Typography>
            <Typography
              noWrap
              sx={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '21px',
                letterSpacing: '0px',
                color: '#4A5565',
                display: { xs: 'none', md: 'block' },
              }}
            >
              {subtitle}
            </Typography>
          </Box>
        </Box>

        {/* Right Info Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Chip
            icon={<Calendar size={14} color={SWADHAAR_THEME.secondary} />}
            label={`AY ${academicYear}`}
            sx={{
              backgroundColor: 'rgba(255, 143, 0, 0.1)',
              color: '#FF8F00',
              fontWeight: 600,
              fontSize: '13px',
              border: '1px solid rgba(255, 143, 0, 0.2)',
              '& .MuiChip-icon': {
                marginLeft: '8px',
                color: 'inherit',
              },
            }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default SwadhaarHeader;
