import React from 'react';
import Link from 'next/link';
import { Card, Box, Typography } from '@mui/material';
import { LucideIcon } from 'lucide-react';
import { SWADHAAR_THEME } from '../../utils/swadhaar.constants';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  accentColor?: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon: Icon,
  href,
  accentColor = SWADHAAR_THEME.secondary,
}) => {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <Card
        sx={{
          padding: '24px',
          borderRadius: '16px',
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(26, 35, 126, 0.05)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0 12px 24px rgba(26, 35, 126, 0.08)',
            borderColor: SWADHAAR_THEME.primary,
          },
        }}
      >
        {/* Icon wrapper */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: `${accentColor}15`, // Light transparent variant of accent
            color: accentColor,
            flexShrink: 0,
          }}
        >
          <Icon size={24} strokeWidth={2.2} />
        </Box>

        {/* Text descriptions */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontWeight: 700,
              fontSize: '16px',
              color: SWADHAAR_THEME.primary,
              marginBottom: '4px',
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#666666',
              fontSize: '13px',
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            {description}
          </Typography>
        </Box>
      </Card>
    </Link>
  );
};

export default QuickActionCard;
