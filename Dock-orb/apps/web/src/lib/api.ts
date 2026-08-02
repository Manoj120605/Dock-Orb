"use client";

import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Mocked functions for MVP UI to work without full backend connectivity
export const api = {
  chat: {
    getConversations: async (workspaceId: string) => {
      // Mock data
      return [
        { id: '1', title: 'Setup NestJS Backend', updatedAt: new Date().toISOString() },
        { id: '2', title: 'Debug FEA Simulation', updatedAt: new Date(Date.now() - 86400000).toISOString() },
      ];
    }
  },
  capsules: {
    getWorkspaceCapsules: async (workspaceId: string) => {
      // Mock data
      return [
        { id: 'cap_1', name: 'Capsule Platform', type: 'PROJECT', isActive: true },
        { id: 'cap_2', name: 'GSGMK Preferences', type: 'USER', isActive: true },
      ];
    }
  },
  skills: {
    getWorkspaceSkills: async (workspaceId: string) => {
      return [
        { id: 'skill_1', name: 'NestJS Expert', domain: 'software/backend' },
        { id: 'skill_2', name: 'Threat Modeler', domain: 'cybersecurity' },
      ];
    }
  }
};
