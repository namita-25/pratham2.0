import React from 'react';
import { Box } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import SwadhaarLoginCard from '../../swadhaar/components/login/SwadhaarLoginCard';

const SwadhaarLoginPage = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F5F8',
        position: 'relative',
        overflow: 'hidden',
        px: 2,
      }}
    >
      {/* Concentric Decorative Rings in Background for Sleek Corporate Tech feel */}
      <Box
        sx={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          border: '1px solid rgba(26, 35, 126, 0.03)',
          top: '-150px',
          right: '-150px',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          border: '1px solid rgba(26, 35, 126, 0.03)',
          bottom: '-100px',
          left: '-100px',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          border: '2px solid rgba(255, 143, 0, 0.015)',
          top: '20%',
          left: '-300px',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Branded login card */}
      <SwadhaarLoginCard />
    </Box>
  );
};

export default SwadhaarLoginPage;

// Declare noLayout to prevent FullLayout wrapper wrapping the page
export async function getStaticProps({ locale }: any) {
  return {
    props: {
      noLayout: true,
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}
