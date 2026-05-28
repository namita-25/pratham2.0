import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress } from '@mui/material';

const SwadhaarIndex = () => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        router.replace('/swadhaar/dashboard');
      } else {
        router.replace('/swadhaar/login');
      }
    }
  }, [router]);

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
      <CircularProgress sx={{ color: '#1A237E' }} size={40} />
    </Box>
  );
};

export default SwadhaarIndex;

export async function getStaticProps() {
  return {
    props: {
      noLayout: true,
    },
  };
}
