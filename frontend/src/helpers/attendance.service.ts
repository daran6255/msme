// src/helpers/attendance.service.ts

import axios from "axios";
import { AttendanceModel } from "./attendance.model";

const API_URL = "http://127.0.0.1:5000/api/v1/attendance"; // Change base URL only if needed

// Create Attendance
export const createAttendance = async (data: AttendanceModel): Promise<{ message: string; id: string }> => {
  const response = await axios.post(`${API_URL}/create`, data);
  return response.data;
};

// Get All Attendance Records
export const getAllAttendance = async (): Promise<AttendanceModel[]> => {
  const response = await axios.get(`${API_URL}/get-all`);
  return response.data as AttendanceModel[];
};

// Get Attendance by ID
export const getAttendanceById = async (id: string): Promise<AttendanceModel> => {
  const response = await axios.get(`${API_URL}/get/${id}`);
  return response.data as AttendanceModel;
};

// Update Attendance by ID
export const updateAttendance = async (
  id: string,
  data: Partial<AttendanceModel>
): Promise<{ message: string }> => {
  const response = await axios.put(`${API_URL}/update/${id}`, data);
  return response.data;
};

// Bulk Update (Usually not used in UI)
export const updateAllAttendance = async (
  data: AttendanceModel[]
): Promise<{ message: string }> => {
  const response = await axios.put(`${API_URL}/update-all`, data);
  return response.data;
};

// Delete Attendance by ID
export const deleteAttendanceById = async (id: string): Promise<{ message: string }> => {
  const response = await axios.delete(`${API_URL}/delete/${id}`);
  return response.data;
};

// Delete All Attendance Records
export const deleteAllAttendance = async (): Promise<{ message: string }> => {
  const response = await axios.delete(`${API_URL}/delete-all`);
  return response.data;
};
