// registration.service.ts

import axios from "axios";
import { CandidateRegistration } from "./registration.model";

const API_URL = "http://localhost:5000/api/v1/candidates"; // Change if needed

// Create Candidate
export const createCandidate = async (data: CandidateRegistration) => {
	const response = await axios.post(`${API_URL}/create`, data);
	return response.data;
};

// Get All Candidates
export const getAllCandidates = async () => {
	const response = await axios.get(`${API_URL}/get-all`);
	return response.data as CandidateRegistration[];
};

// Get Candidate by ID
export const getCandidateById = async (id: string) => {
	const response = await axios.get(`${API_URL}/get/${id}`);
	return response.data as CandidateRegistration;
};

// Update Candidate by ID
export const updateCandidateById = async (id: string, data: Partial<CandidateRegistration>) => {
	const response = await axios.put(`${API_URL}/update/${id}`, data);
	return response.data;
};

// Bulk update (optional - usually not used in UI)
export const updateAllCandidates = async (data: CandidateRegistration[]) => {
	const response = await axios.put(`${API_URL}/update-all`, data);
	return response.data;
};

// Delete Candidate by ID
export const deleteCandidateById = async (id: string) => {
	const response = await axios.delete(`${API_URL}/delete/${id}`);
	return response.data;
};

// Delete All Candidates
export const deleteAllCandidates = async () => {
	const response = await axios.delete(`${API_URL}/delete-all`);
	return response.data;
};
