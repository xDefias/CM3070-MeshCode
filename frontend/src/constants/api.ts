// src/constants/api.ts

// Construct the API URL from environment variables
export const API_URL = `${import.meta.env.VITE_API_URL}:${import.meta.env.VITE_API_PORT}/api`;

// Define a list of API endpoints
export const API_LIST = {
  LOGIN: `${API_URL}/auth/login`,
  REGISTER: `${API_URL}/auth/register`,
  FORGOTPASSWORD: `${API_URL}/users/register`,

  CREATE_PROJECT: `${API_URL}/projects/add`,
  GET_PROJECTS: `${API_URL}/projects`,
  GET_PROJECT_DETAILS: (project_id: number) => `${API_URL}/projects/${project_id}`,
  UPDATE_PROJECT: (project_id: number) => `${API_URL}/projects/edit/${project_id}`,
  DELETE_PROJECT: (project_id: number) => `${API_URL}/projects/${project_id}`,

  GET_PROJECT_FILES: (project_id: number) => `${API_URL}/projects/${project_id}/files`,

  // Updated routes
  GET_FILE_CONTENT: (project_id: number, filePath: string) => `${API_URL}/projects/${project_id}/files/${encodeURIComponent(filePath)}`,
  CREATE_FILE: (project_id: number) => `${API_URL}/projects/${project_id}/files`,

  // Updated routes for updating file content and name
  UPDATE_FILE_CONTENT: (project_id: number, filePath: string) => `${API_URL}/projects/${project_id}/files/content/${encodeURIComponent(filePath)}`,
  UPDATE_FILE_NAME: (project_id: number, filePath: string) => `${API_URL}/projects/${project_id}/files/rename/${encodeURIComponent(filePath)}`,

  DELETE_FILE: (project_id: number, filePath: string) => `${API_URL}/projects/${project_id}/files/${encodeURIComponent(filePath)}`,

  SHARE_PROJECT: (project_id: number) => `${API_URL}/projects/${project_id}/share`,

  TERMINAL: `${API_URL}/terminal`,
};
