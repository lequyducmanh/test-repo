import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { User } from '../types/user.types';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onEdit,
  onDelete,
}) => {
  if (users.length === 0) {
    return (
      <Box className="text-center py-12">
        <Typography variant="h6" color="text.secondary">
          No users found
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} className="shadow-md rounded-lg">
      <Table>
        <TableHead>
          <TableRow className="bg-gray-50">
            <TableCell className="font-semibold">ID</TableCell>
            <TableCell className="font-semibold">Name</TableCell>
            <TableCell className="font-semibold">Email</TableCell>
            <TableCell align="right" className="font-semibold">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              hover
              className="transition-colors"
            >
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell align="right">
                <IconButton
                  onClick={() => onEdit(user)}
                  color="primary"
                  size="small"
                  className="mr-2"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => onDelete(user.id)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
