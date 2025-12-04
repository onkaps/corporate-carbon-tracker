import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Building, Mail } from 'lucide-react';

export function Profile() {
    const { user, logout, isLoadingProfile } = useAuth();

    if (isLoadingProfile || !user) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary">
                                {user.name?.charAt(0) || 'U'}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">{user.name}</h2>
                            <p className="text-muted-foreground">Employee ID: {user.employeeId}</p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center space-x-3 p-4 border rounded-lg">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Email</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-4 border rounded-lg">
                            <Building className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Department</p>
                                <p className="text-sm text-muted-foreground">{user.department}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <Button variant="destructive" onClick={logout}>
                            Sign Out
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
