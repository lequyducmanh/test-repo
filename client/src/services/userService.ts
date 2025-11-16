import axios from 'axios';
import { User, UserFormData } from '../types/User';

const API_URL = '/api/users';

export const userService = {
  async getAllUsers(): Promise<User[]> {
    const response = await axios.get<User[]>(API_URL);
    return response.data;
  },

  async getUserById(id: number): Promise<User> {
    const response = await axios.get<User>(`${API_URL}/${id}`);
    return response.data;
  },

  async createUser(userData: UserFormData): Promise<User> {
    const response = await axios.post<User>(API_URL, userData);
    return response.data;
  },

  async updateUser(id: number, userData: UserFormData): Promise<User> {
    const response = await axios.put<User>(`${API_URL}/${id}`, userData);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await axios.delete(`${API_URL}/${id}`);
  },
};
