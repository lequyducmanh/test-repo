import React, { useState } from 'react';
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { UserForm } from '../components/UserForm';
import { UserTable } from '../components/UserTable';
import { useUsers } from '../hooks/useUsers';
import { User, UserFormData } from '../types/user.types';

export const UserManagementPage: React.FC = () => {
  const { users, loading, error, createUser, updateUser, deleteUser } = useUsers();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleSubmit = async (data: UserFormData) => {
    let result;
    if (editingUser) {
      result = await updateUser(editingUser.id, data);
      if (result.success) {
        setSnackbar({ open: true, message: 'User updated successfully!', severity: 'success' });
        setEditingUser(null);
      }
    } else {
      result = await createUser(data);
      if (result.success) {
        setSnackbar({ open: true, message: 'User created successfully!', severity: 'success' });
      }
    }
    
    if (!result.success) {
      setSnackbar({ open: true, message: 'Operation failed. Please try again.', severity: 'error' });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id: number) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete !== null) {
      const result = await deleteUser(userToDelete);
      if (result.success) {
        setSnackbar({ open: true, message: 'User deleted successfully!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Failed to delete user.', severity: 'error' });
      }
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleCancel = () => {
    setEditingUser(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-screen">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" className="py-8">
      <Typography variant="h3" component="h1" className="mb-8 text-center font-bold">
        User Management
      </Typography>

      {error && (
        <Alert severity="error" className="mb-6">
          {error}
        </Alert>
      )}

      <Box className="mb-8">
        <Typography variant="h5" className="mb-4">
          {editingUser ? 'Edit User' : 'Create New User'}
        </Typography>
        <UserForm
          initialData={editingUser ? { name: editingUser.name, email: editingUser.email } : undefined}
          onSubmit={handleSubmit}
          onCancel={editingUser ? handleCancel : undefined}
          isEditing={!!editingUser}
        />
      </Box>

      <Box>
        <Typography variant="h5" className="mb-4">
          Users List
        </Typography>
        <UserTable
          users={users}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};
