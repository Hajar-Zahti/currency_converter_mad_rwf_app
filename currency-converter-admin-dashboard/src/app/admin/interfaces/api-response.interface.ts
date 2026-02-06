export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
  statusCode?: number;
  rates?: any;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  user?: User;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
  lastLogin: string;
  active: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}
