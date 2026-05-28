import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Box, 
  Drawer, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Avatar, 
  Button, 
  IconButton 
} from '@mui/material';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { SwadhaarMenuItems } from './SwadhaarMenuItems';

interface SwadhaarSidebarProps {
  isMobileSidebarOpen: boolean;
  onSidebarClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 80;

const SwadhaarSidebar: React.FC<SwadhaarSidebarProps> = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('Admin User');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('roleName') || '';
      setUserRole(storedRole);

      const adminInfoStr = localStorage.getItem('adminInfo');
      if (adminInfoStr) {
        try {
          const adminInfo = JSON.parse(adminInfoStr);
          const fullName = `${adminInfo.firstName || ''} ${adminInfo.lastName || ''}`.trim();
          if (fullName) {
            setUserName(fullName);
          } else if (adminInfo.username) {
            setUserName(adminInfo.username);
          }
        } catch (e) {
          console.error('Error parsing adminInfo in sidebar', e);
        }
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      router.push('/swadhaar/login');
    }
  };

  // Filter menu items by user role
  const filteredMenuItems = SwadhaarMenuItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.some(
      (role) => role.toLowerCase() === userRole.toLowerCase()
    );
  });

  const sidebarContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        color: '#1C2B4A',
        transition: 'width 0.3s ease',
        width: isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Top Branding Section */}
      <Box
        sx={{
          padding: isCollapsed ? '24px 8px' : '24px',
          display: 'flex',
          alignItems: 'center',
          gap: isCollapsed ? '0' : '12px',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid #E5E7EB',
          position: 'relative',
          height: '88px',
          boxSizing: 'border-box',
        }}
      >
        {/* Swadhaar Logo Image Container */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
            padding: '2px',
            flexShrink: 0,
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: '#D9D9D933',
            },
          }}
        >
          <img
            src="/tenants/swadhaar-logo.png"
            alt="Swadhaar Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </Box>

        {/* Title - only shown when expanded */}
        {!isCollapsed && (
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: '#1C2B4A',
                lineHeight: 1.2,
                fontSize: '18px',
              }}
            >
              Admin Panel
            </Typography>
          </Box>
        )}

        {/* Collapse Toggle Button (Desktop only, positioned overlapping the right border) */}
        <IconButton
          onClick={onToggleCollapse}
          sx={{
            display: { xs: 'none', lg: 'flex' },
            position: 'absolute',
            right: '-14px',
            top: '30px',
            width: '28px',
            height: '28px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '50%',
            boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
            zIndex: 1300,
            '&:hover': {
              backgroundColor: '#D9D9D933',
            },
          }}
        >
          {isCollapsed ? (
            <ChevronRight size={16} color="#1C2B4A" />
          ) : (
            <ChevronLeft size={16} color="#1C2B4A" />
          )}
        </IconButton>
      </Box>

      {/* Menu List */}
      <Box sx={{ flex: 1, padding: isCollapsed ? '16px 8px' : '16px 12px', overflowY: 'auto' }}>
        <List sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href;
            const isMetabase = item.title === 'Metabase Analytics';

            return (
              <Link key={item.title} href={item.href} passHref style={{ textDecoration: 'none' }}>
                <ListItemButton
                  selected={isActive}
                  onClick={onSidebarClose}
                  sx={{
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    transition: 'all 0.25s ease',
                    minHeight: '44px',
                    opacity: 1,
                    transform: 'rotate(0deg)',
                    
                    // Menu item styling
                    color: isActive ? '#1C2B4A' : '#7C766F',
                    backgroundColor: isActive ? '#1C2B4A0D' : 'transparent',
                    borderLeft: isActive ? '2.4px solid #1C2B4A' : '2.4px solid transparent',
                    borderRadius: isActive ? '8.75px' : '8px',
                    gap: isCollapsed ? '0px' : '10.5px',
                    paddingTop: '10.5px',
                    paddingBottom: '10.5px',
                    paddingLeft: isCollapsed ? '0px' : '14px',
                    paddingRight: isCollapsed ? '0px' : '14px',
                    
                    '&:hover': {
                      backgroundColor: '#1C2B4A',
                      color: '#FFFFFF',
                      boxShadow: '0px 2px 4px -2px rgba(0,0,0,0.15), 0px 4px 6px -1px rgba(0,0,0,0.15)',
                      borderLeftColor: 'transparent',
                      '& .MuiListItemIcon-root': {
                        color: '#FFFFFF',
                      },
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#1C2B4A0D',
                      color: '#1C2B4A',
                      borderLeft: '2.4px solid #1C2B4A',
                      '&:hover': {
                        backgroundColor: '#1C2B4A',
                        color: '#FFFFFF',
                        boxShadow: '0px 2px 4px -2px rgba(0,0,0,0.15), 0px 4px 6px -1px rgba(0,0,0,0.15)',
                        borderLeftColor: 'transparent',
                        '& .MuiListItemIcon-root': {
                          color: '#FFFFFF',
                        },
                      },
                    }
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: 'auto', 
                      color: 'inherit',
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={20} />
                  </ListItemIcon>
                  {!isCollapsed && (
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{
                        fontSize: '14px',
                        fontWeight: isActive ? 600 : 500,
                      }}
                    />
                  )}
                </ListItemButton>
              </Link>
            );
          })}
        </List>
      </Box>

      {/* Footer Profile Section (Non-interactive view-only) & Logout */}
      <Box
        sx={{
          padding: isCollapsed ? '20px 8px' : '20px',
          borderTop: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
        }}
      >
        {isCollapsed ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Avatar
              sx={{
                bgcolor: '#1C2B4A',
                color: '#FFFFFF',
                width: '40px',
                height: '40px',
                fontWeight: 700,
                fontSize: '16px',
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </Avatar>
            <IconButton
              onClick={handleLogout}
              sx={{
                color: '#1C2B4A',
                transition: 'all 0.2s',
                '&:hover': {
                  color: '#BA1A1A',
                  backgroundColor: 'rgba(186, 26, 26, 0.1)',
                },
              }}
            >
              <LogOut size={20} />
            </IconButton>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                pointerEvents: 'none',
              }}
            >
              <Avatar
                sx={{
                  bgcolor: '#1C2B4A',
                  color: '#FFFFFF',
                  width: '40px',
                  height: '40px',
                  fontWeight: 700,
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{ fontWeight: 600, color: '#1C2B4A' }}
                >
                  {userName}
                </Typography>
                <Typography
                  variant="caption"
                  noWrap
                  sx={{ color: '#7C766F', display: 'block', textTransform: 'capitalize' }}
                >
                  {userRole || 'Administrator'}
                </Typography>
              </Box>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<LogOut size={16} />}
              onClick={handleLogout}
              sx={{
                borderRadius: '8px',
                color: '#1C2B4A',
                borderColor: 'rgba(28, 43, 74, 0.2)',
                textTransform: 'none',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#BA1A1A',
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(186, 26, 26, 0.1)',
                },
              }}
            >
              Logout
            </Button>
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { lg: isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH },
        flexShrink: { lg: 0 },
        transition: 'width 0.3s ease',
      }}
    >
      {/* Mobile Drawer (Always full width when open) */}
      <Drawer
        variant="temporary"
        open={isMobileSidebarOpen}
        onClose={onSidebarClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
            border: 'none',
            transition: 'width 0.3s ease',
            overflow: 'visible',
            zIndex: 1200,
          },
        }}
        open
      >
        {sidebarContent}
      </Drawer>
    </Box>
  );
};

export default SwadhaarSidebar;
