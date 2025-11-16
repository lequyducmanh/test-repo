import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Stack,
} from '@mui/material';
import { UserFormData } from '../types/user.types';

interface UserFormProps {
  initialData?: UserFormData;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  initialData = { name: '', email: '' },
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState<UserFormData>(initialData);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof UserFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-sm p-6"
    >
      <Stack spacing={3}>
        <TextField
          label="Name"
          value={formData.name}
          onChange={handleChange('name')}
          required
          fullWidth
          disabled={submitting}
          className="bg-white"
        />
        
        <TextField
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          required
          fullWidth
          disabled={submitting}
          className="bg-white"
        />
        
        <Stack direction="row" spacing={2}>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            className="px-6"
          >
            {isEditing ? 'Update User' : 'Create User'}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="outlined"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};
