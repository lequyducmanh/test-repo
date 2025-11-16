import React from 'react';
import { CircularProgress, Box } from '@mui/material';

export const LoadingSpinner: React.FC = () => {
  return (
    <Box className="flex justify-center items-center py-12">
      <CircularProgress />
    </Box>
  );
};
