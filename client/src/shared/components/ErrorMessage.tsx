import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

interface ErrorMessageProps {
  message: string;
  title?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, title = 'Error' }) => {
  return (
    <Alert severity="error" className="my-4">
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
};
