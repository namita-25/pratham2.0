import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Container, CircularProgress } from '@mui/material';
import SwadhaarSidebar from './SwadhaarSidebar';
import SwadhaarHeader from './SwadhaarHeader';

interface SwadhaarFullLayoutProps {
  children: React.ReactNode;
}

const SwadhaarFullLayout: React.FC<SwadhaarFullLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      // If no token exists, redirect to login unless already on the login page itself
      if (!token) {
        setIsAuthenticated(false);
        if (router.pathname !== '/swadhaar/login' && router.pathname !== '/swadhaar') {
          router.replace('/swadhaar/login');
        }
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [router]);

  const handleSidebarToggle = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  const handleSidebarClose = () => {
    setIsMobileSidebarOpen(false);
  };

  // If loading or not authenticated (and not on login), show splash loader
  const isLoginPage = router.pathname === '/swadhaar/login' || router.pathname === '/swadhaar';
  if (isAuthenticated === null && !isLoginPage) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#F3F5F8',
        }}
      >
        <CircularProgress sx={{ color: '#1A237E' }} size={48} />
      </Box>
    );
  }

  // Login page gets no sidebar/header wrapper
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F3F5F8' }}>
      {/* App Header */}
      <SwadhaarHeader 
        onSidebarToggle={handleSidebarToggle} 
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* Navigation Sidebar */}
      <SwadhaarSidebar
        isMobileSidebarOpen={isMobileSidebarOpen}
        onSidebarClose={handleSidebarClose}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Page Canvas Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { lg: `calc(100% - ${isSidebarCollapsed ? '80px' : '280px'})` },
          transition: 'width 0.3s ease',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          pt: { xs: '116px', sm: '128px' }, // Spacious header offset (88px header + margin)
          overflowX: 'hidden',
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            px: '0 !important',
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default SwadhaarFullLayout;
