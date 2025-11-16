import { axiosInstance } from '@/core/api/axiosInstance';
import { User, UserFormData } from '../types/user.types';

const USERS_ENDPOINT = '/users';

export const userApi = {
  async getAllUsers(): Promise<User[]> {
    const response = await axiosInstance.get<User[]>(USERS_ENDPOINT);
    return response.data;
  },

  async getUserById(id: number): Promise<User> {
    const response = await axiosInstance.get<User>(`${USERS_ENDPOINT}/${id}`);
    return response.data;
  },

  async createUser(userData: UserFormData): Promise<User> {
    const response = await axiosInstance.post<User>(USERS_ENDPOINT, userData);
    return response.data;
  },

  async updateUser(id: number, userData: UserFormData): Promise<User> {
    const response = await axiosInstance.put<User>(`${USERS_ENDPOINT}/${id}`, userData);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await axiosInstance.delete(`${USERS_ENDPOINT}/${id}`);
  },
};
