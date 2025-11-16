import { useState, useEffect } from 'react';
import { userApi } from '../api/userApi';
import { User, UserFormData } from '../types/user.types';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAllUsers();
      setUsers(data);
      setError('');
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createUser = async (userData: UserFormData) => {
    try {
      await userApi.createUser(userData);
      await loadUsers();
      return { success: true };
    } catch (err) {
      setError('Failed to create user');
      console.error(err);
      return { success: false };
    }
  };

  const updateUser = async (id: number, userData: UserFormData) => {
    try {
      await userApi.updateUser(id, userData);
      await loadUsers();
      return { success: true };
    } catch (err) {
      setError('Failed to update user');
      console.error(err);
      return { success: false };
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await userApi.deleteUser(id);
      await loadUsers();
      return { success: true };
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
      return { success: false };
    }
  };

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers: loadUsers,
  };
};
