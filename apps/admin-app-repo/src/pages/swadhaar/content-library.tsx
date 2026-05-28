import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, Chip, Button } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { FolderGit2, BookOpen, Download, ExternalLink } from 'lucide-react';
import { SWADHAAR_THEME } from '../../swadhaar/utils/swadhaar.constants';

const SwadhaarContentLibrary = () => {
  const contentItems = [
    {
      id: 'doc-001',
      title: 'Trainer Facilitator Resource Handbook V1',
      type: 'PDF Document',
      size: '4.8 MB',
      category: 'Guides',
    },
    {
      id: 'doc-002',
      title: 'Basic Financial Literacy Classroom Exercises',
      type: 'Worksheet',
      size: '1.2 MB',
      category: 'Worksheets',
    },
    {
      id: 'doc-003',
      title: 'Cohort Pre-Assessment Question Matrix',
      type: 'Excel Sheet',
      size: '840 KB',
      category: 'Assessments',
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: SWADHAAR_THEME.primary, fontSize: { xs: '22px', sm: '26px' }, marginBottom: '4px' }}>
            Resource & Content Library
          </Typography>
          <Typography variant="body2" sx={{ color: '#666666', fontSize: '14px' }}>
            Browse instructional manuals, download interactive cohort worksheets, and preview trainer guides.
          </Typography>
        </Box>
      </Box>

      {/* Resource catalog grid */}
      <Grid container spacing={3}>
        {contentItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card
              elevation={0}
              sx={{
                borderRadius: '16px',
                border: '1px solid rgba(26, 35, 126, 0.08)',
                backgroundColor: '#FFFFFF',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(26, 35, 126, 0.05)',
                },
              }}
            >
              <CardContent sx={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={item.category}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 143, 0, 0.08)',
                      color: '#FF8F00',
                      fontWeight: 600,
                    }}
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                    {item.size}
                  </Typography>
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: SWADHAAR_THEME.primary,
                    fontSize: '15px',
                    lineHeight: 1.4,
                    flexGrow: 1,
                  }}
                >
                  {item.title}
                </Typography>

                <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.5)', fontWeight: 600, textTransform: 'uppercase' }}>
                  {item.type}
                </Typography>
              </CardContent>

              <Box
                sx={{
                  padding: '16px 24px',
                  borderTop: '1px solid rgba(26, 35, 126, 0.05)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Download size={14} />}
                  sx={{
                    borderRadius: '6px',
                    fontSize: '12px',
                    borderColor: 'rgba(26, 35, 126, 0.2)',
                    color: SWADHAAR_THEME.primary,
                  }}
                >
                  Download
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SwadhaarContentLibrary;

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}
