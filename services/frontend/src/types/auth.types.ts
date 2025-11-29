export interface User {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  department: string | null;
  position: string | null;
  isAdmin: boolean;
  companyId: number;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  employeeId: string;
  name: string;
  email: string;
  password: string;
  department?: string;
  position?: string;
  companyId: number;
}