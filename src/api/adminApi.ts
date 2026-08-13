import api from "./httpApi";

import type { ApiResponse, UsersListResponse } from "../types";

export const getAllUsers = async (): Promise<UsersListResponse> => {
  try {
    const { data } = await api.get<UsersListResponse>("/api/admin/users");
    return data;
  } catch (error: any) {
    const server = error?.response?.data;
    if (server) return server;

    return { success: false, message: "שגיאת תקשורת עם השרת." };
  }
};

export const approveUser = async (userId: string): Promise<ApiResponse> => {
  try {
    const { data } = await api.patch<ApiResponse>(`/api/admin/users/${userId}/approve`);
    return data;
  } catch (error: any) {
    const server = error?.response?.data;
    if (server) return server;

    return { success: false, message: "שגיאת תקשורת עם השרת." };
  }
};

export const rejectUser = async (userId: string): Promise<ApiResponse> => {
  try {
    const { data } = await api.patch<ApiResponse>(`/api/admin/users/${userId}/reject`);
    return data;
  } catch (error: any) {
    const server = error?.response?.data;
    if (server) return server;

    return { success: false, message: "שגיאת תקשורת עם השרת." };
  }
};

export const blockUser = async (userId: string): Promise<ApiResponse> => {
  try {
    const { data } = await api.patch<ApiResponse>(`/api/admin/users/${userId}/block`);
    return data;
  } catch (error: any) {
    const server = error?.response?.data;
    if (server) return server;

    return { success: false, message: "שגיאת תקשורת עם השרת." };
  }
};

export const unblockUser = async (userId: string): Promise<ApiResponse> => {
  try {
    const { data } = await api.patch<ApiResponse>(`/api/admin/users/${userId}/unblock`);
    return data;
  } catch (error: any) {
    const server = error?.response?.data;
    if (server) return server;

    return { success: false, message: "שגיאת תקשורת עם השרת." };
  }
};
