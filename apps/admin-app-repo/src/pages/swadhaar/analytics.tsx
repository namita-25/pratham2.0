import React from 'react';
import { Box, Typography } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import MetabaseDashboardEmbed from '../../swadhaar/components/dashboard/MetabaseDashboardEmbed';
import { SWADHAAR_THEME } from '../../swadhaar/utils/swadhaar.constants';

const SwadhaarAnalyticsPage = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', height: '100%' }}>
      {/* Title Header */}
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
          Metabase Analytics Portal
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#666666',
            fontSize: '14px',
            margin: 0,
          }}
        >
          Real-time insights, cohort completion metrics, engagement graphs, and performance breakdowns.
        </Typography>
      </Box>

      {/* Embed Canvas */}
      <Box sx={{ flex: 1, minHeight: '650px' }}>
        <MetabaseDashboardEmbed height="650px" fullPage={true} />
      </Box>
    </Box>
  );
};

export default SwadhaarAnalyticsPage;

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}
