export class AuthResponseDto {
    access_token: string;
    user: {
      id: number;
      employeeId: string;
      name: string;
      email: string;
      department: string | null;
      position: string | null;
      isAdmin: boolean;
      companyId: number;
    };
  }