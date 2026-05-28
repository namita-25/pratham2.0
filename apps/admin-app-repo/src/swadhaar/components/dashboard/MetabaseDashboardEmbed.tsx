import React, { useState, useEffect } from 'react';
import { Card, Box, Typography, Button, CircularProgress } from '@mui/material';
import { AlertTriangle, RotateCw, BarChart4 } from 'lucide-react';
import { SWADHAAR_THEME } from '../../utils/swadhaar.constants';

interface MetabaseDashboardEmbedProps {
  height?: string | number;
  fullPage?: boolean;
}

const MetabaseDashboardEmbed: React.FC<MetabaseDashboardEmbedProps> = ({
  height = '500px',
  fullPage = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [embedUrl, setEmbedUrl] = useState<string>('');

  useEffect(() => {
    // Read from environment variables or fallback safely
    const configuredUrl = 
      process.env.NEXT_PUBLIC_SWADHAAR_METABASE_URL || 
      'https://shiksha-dev-interface.tekdinext.com/metabase-mock-dashboard'; // Fallback demo url

    setEmbedUrl(configuredUrl);

    // Timeout logic: If the metabase frame doesn't clear load state in 10 seconds, trigger connection error alert
    const timer = setTimeout(() => {
      if (loading) {
        setError(true);
        setLoading(false);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleFrameLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleReload = () => {
    setLoading(true);
    setError(false);
    // Force iframe reload by updating endpoint query parameter slightly
    const originalUrl = process.env.NEXT_PUBLIC_SWADHAAR_METABASE_URL || 'https://shiksha-dev-interface.tekdinext.com/metabase-mock-dashboard';
    setEmbedUrl(`${originalUrl}?t=${Date.now()}`);
  };

  return (
    <Card
      elevation={0}
      sx={{
        width: '100%',
        borderRadius: '16px',
        border: '1px solid rgba(26, 35, 126, 0.08)',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: fullPage ? 'none' : '0px 4px 12px rgba(26, 35, 126, 0.02)',
      }}
    >
      {/* Analytics Card Header */}
      {!fullPage && (
        <Box
          sx={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(26, 35, 126, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <BarChart4 size={20} color={SWADHAAR_THEME.primary} />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, fontSize: '16px', color: SWADHAAR_THEME.primary }}
          >
            Metabase Embedded Reporting Suite
          </Typography>
        </Box>
      )}

      {/* Embedded Iframe Container */}
      <Box sx={{ position: 'relative', height: height, width: '100%', backgroundColor: '#F8F9FA' }}>
        {/* Loading Spinner */}
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              zIndex: 3,
              gap: '16px',
            }}
          >
            <CircularProgress sx={{ color: SWADHAAR_THEME.primary }} />
            <Typography variant="body2" sx={{ color: '#666666', fontWeight: 500 }}>
              Securely loading Metabase analytics canvas...
            </Typography>
          </Box>
        )}

        {/* Handshake/Network Connection Failure State */}
        {error && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#FFF8F8',
              zIndex: 4,
              padding: '24px',
              textAlign: 'center',
              gap: '20px',
            }}
          >
            <Box
              sx={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(186, 26, 26, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: SWADHAAR_THEME.error,
              }}
            >
              <AlertTriangle size={32} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: SWADHAAR_THEME.error, marginBottom: '6px' }}
              >
                Connection Handshake Error
              </Typography>
              <Typography variant="body2" sx={{ color: '#555555', maxWidth: '400px' }}>
                Unable to securely load analytics data. Please reload.
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RotateCw size={16} />}
              onClick={handleReload}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                backgroundColor: SWADHAAR_THEME.primary,
                '&:hover': {
                  backgroundColor: '#0D1642',
                },
              }}
            >
              Reload Frame
            </Button>
          </Box>
        )}

        {/* Actual Iframe */}
        {!error && embedUrl && (
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 'none', display: 'block' }}
            onLoad={handleFrameLoad}
            title="Metabase Analytics Embed"
            sandbox="allow-scripts allow-same-origin"
          />
        )}
      </Box>
    </Card>
  );
};

export default MetabaseDashboardEmbed;
