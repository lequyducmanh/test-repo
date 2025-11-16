import React, { useState, useEffect } from 'react';
import { User, UserFormData } from '../types/User';
import { userService } from '../services/userService';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
      setError('');
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await userService.updateUser(editingId, formData);
        setEditingId(null);
      } else {
        await userService.createUser(formData);
      }
      setFormData({ name: '', email: '' });
      loadUsers();
    } catch (err) {
      setError('Failed to save user');
      console.error(err);
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setFormData({ name: user.name, email: user.email });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(id);
        loadUsers();
      } catch (err) {
        setError('Failed to delete user');
        console.error(err);
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', email: '' });
  };

  if (loading) return <div className='loading'>Loading...</div>;

  return (
    <div className='container'>
      <h1>User Management</h1>

      {error && <div className='error'>{error}</div>}

      <form onSubmit={handleSubmit} className='user-form'>
        <input
          type='text'
          placeholder='Name'
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type='email'
          placeholder='Email'
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <div className='button-group'>
          <button type='submit'>{editingId ? 'Update' : 'Create'} User</button>
          {editingId && (
            <button type='button' onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className='users-list'>
        <h2>Users</h2>
        {users.length === 0 ? (
          <p>No users found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(user)}
                      className='btn-edit'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className='btn-delete'
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserList;
