import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { AlertCircle } from 'lucide-react';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    employeeId: z.string().min(3, 'Employee ID must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    department: z.string().min(2, 'Department is required'),
    companyId: z.string().transform((val) => parseInt(val, 10)),
});

type RegisterForm = z.infer<typeof registerSchema>;

export function Register() {
    const navigate = useNavigate();
    const { register: registerUser } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema) as any,
    });

    const onSubmit = async (data: RegisterForm) => {
        try {
            setIsLoading(true);
            setError(null);
            await registerUser(data);
            // Navigation is handled by useAuth hook's onSuccess callback
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to register');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
                    <CardDescription className="text-center">
                        Enter your details to get started
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" {...register('name')} placeholder="John Doe" />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="employeeId">Employee ID</Label>
                            <Input id="employeeId" {...register('employeeId')} placeholder="EMP001" />
                            {errors.employeeId && (
                                <p className="text-sm text-red-500">{errors.employeeId.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...register('email')} placeholder="john@example.com" />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input id="department" {...register('department')} placeholder="Engineering" />
                            {errors.department && (
                                <p className="text-sm text-red-500">{errors.department.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="companyId">Company ID</Label>
                            <Input id="companyId" type="number" {...register('companyId')} placeholder="1" />
                            {errors.companyId && (
                                <p className="text-sm text-red-500">{errors.companyId.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" {...register('password')} />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Creating account...' : 'Create account'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
