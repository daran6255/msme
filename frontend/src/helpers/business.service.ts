// src/helpers/business.service.ts

import axios from "axios"; // Make sure you already have this
import { BusinessModel } from "./business.model";

const API_URL = "https://msme.winvinayafoundation.org/api/v1/business";

// Create Business record
export const createBusiness = async (data: BusinessModel): Promise<{ message: string; id: string }> => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

// Get all business data
export const getAllBusiness = async (): Promise<BusinessModel[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get business record by ID
export const getBusinessById = async (id: string): Promise<BusinessModel> => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Update specific business record
export const updateBusiness = async (id: string, data: BusinessModel): Promise<{ message: string }> => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

// Bulk update list of business data
export const bulkUpdateBusiness = async (
  records: Partial<BusinessModel>[]
): Promise<{ message: string }> => {
  const response = await axios.put(API_URL, records);
  return response.data;
};

// Delete one record
export const deleteBusiness = async (id: string): Promise<{ message: string }> => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

// Delete all records
export const deleteAllBusiness = async (): Promise<{ message: string }> => {
  const response = await axios.delete(API_URL);
  return response.data;
};
