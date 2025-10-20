import axios from "axios";

// Type definitions
export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
  isActive: boolean;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string;
  tags: string[];
  assignedTo: User;
  createdBy: User;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  task: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface File {
  _id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  task: string;
  uploadedBy: User;
  createdAt: string;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateTaskData {
  title: string;
  description: string;
  status?: "todo" | "in-progress" | "review" | "done";
  priority?: "low" | "medium" | "high" | "urgent";
  dueDate: string;
  assignedTo: string;
  tags?: string[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: "todo" | "in-progress" | "review" | "done";
  priority?: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  assignedTo?: string;
  tags?: string[];
}

export interface AnalyticsOverview {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
}

export interface PerformanceMetrics {
  userId: string;
  username: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageCompletionTime: number;
}

export interface TrendData {
  date: string;
  completed: number;
  created: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => api.post<AuthResponse>("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>("/auth/login", data),
  getProfile: () => api.get<User>("/auth/profile"),
};

// Tasks API
export const tasksAPI = {
  getAll: (params?: TaskFilters) => api.get<{ tasks: Task[]; total: number; page: number; pages: number }>("/tasks", { params }),
  getTask: (id: string) => api.get<Task>(`/tasks/${id}`),
  createTask: (data: CreateTaskData) => api.post<Task>("/tasks", data),
  updateTask: (id: string, data: UpdateTaskData) => api.put<Task>(`/tasks/${id}`, data),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),
  bulkCreateTasks: (data: { tasks: CreateTaskData[] }) => api.post<Task[]>("/tasks/bulk", data),
};

// Comments API
export const commentsAPI = {
  getComments: (taskId: string) => api.get<Comment[]>(`/comments/${taskId}`),
  addComment: (taskId: string, data: { content: string }) =>
    api.post<Comment>(`/comments/${taskId}`, data),
  updateComment: (id: string, data: { content: string }) =>
    api.put<Comment>(`/comments/${id}`, data),
  deleteComment: (id: string) => api.delete(`/comments/${id}`),
};

// Files API
export const filesAPI = {
  uploadFiles: (taskId: string, files: FormData) =>
    api.post<File[]>(`/files/${taskId}`, files, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getFiles: (taskId: string) => api.get<File[]>(`/files/task/${taskId}`),
  downloadFile: (id: string) =>
    api.get<Blob>(`/files/${id}`, { responseType: "blob" }),
  deleteFile: (id: string) => api.delete(`/files/${id}`),
};

// Users API
export const usersAPI = {
  getUsers: () => api.get<User[]>("/users"),
};

// Analytics API
export const analyticsAPI = {
  getOverview: () => api.get<AnalyticsOverview>("/analytics/overview"),
  getPerformance: () => api.get<{ users: PerformanceMetrics[] }>("/analytics/performance"),
  getTrends: (params?: { days?: number }) => api.get<{ trends: TrendData[] }>("/analytics/trends", { params }),
  exportTasks: (format?: "csv" | "json") =>
    api.get<Blob>("/analytics/export", { params: { format }, responseType: "blob" }),
};
 