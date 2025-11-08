export class EmployeeResponseDto {
    id: number;
    employeeId: string;
    name: string;
    email: string;
    department: string | null;
    position: string | null;
    isAdmin: boolean;
    companyId: number;
    createdAt: Date;
    company?: {
      id: number;
      name: string;
      industry: string | null;
    };
  }