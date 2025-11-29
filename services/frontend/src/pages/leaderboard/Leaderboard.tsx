import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leaderboardService } from '@/services/leaderboard.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trophy, Medal, Users, Building } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Leaderboard() {
    const [view, setView] = useState<'employees' | 'departments'>('employees');

    const { data: employees, isLoading: isLoadingEmployees } = useQuery({
        queryKey: ['leaderboard', 'employees'],
        queryFn: () => leaderboardService.getEmployeeLeaderboard({ limit: 10 }),
        enabled: view === 'employees',
    });

    const { data: departments, isLoading: isLoadingDepartments } = useQuery({
        queryKey: ['leaderboard', 'departments'],
        queryFn: leaderboardService.getDepartmentRankings,
        enabled: view === 'departments',
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
                    <p className="text-muted-foreground">
                        See who's leading the charge in sustainability.
                    </p>
                </div>
                <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                    <Button
                        variant={view === 'employees' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setView('employees')}
                    >
                        <Users className="w-4 h-4 mr-2" />
                        Employees
                    </Button>
                    <Button
                        variant={view === 'departments' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setView('departments')}
                    >
                        <Building className="w-4 h-4 mr-2" />
                        Departments
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                        Top {view === 'employees' ? 'Performers' : 'Departments'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {view === 'employees' ? (
                            isLoadingEmployees ? (
                                <div>Loading...</div>
                            ) : (
                                employees?.map((entry, index) => (
                                    <div
                                        key={entry.employeeId}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={cn(
                                                "w-8 h-8 flex items-center justify-center rounded-full font-bold",
                                                index === 0 ? "bg-yellow-100 text-yellow-600" :
                                                    index === 1 ? "bg-gray-200 text-gray-600" :
                                                        index === 2 ? "bg-orange-100 text-orange-600" :
                                                            "bg-white text-gray-500 border"
                                            )}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium">{entry.name}</p>
                                                <p className="text-sm text-muted-foreground">{entry.department}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary">{entry.totalFootprint} kg</p>
                                            <p className="text-xs text-muted-foreground">CO2e</p>
                                        </div>
                                    </div>
                                ))
                            )
                        ) : (
                            isLoadingDepartments ? (
                                <div>Loading...</div>
                            ) : (
                                departments?.map((dept: any, index: number) => (
                                    <div
                                        key={dept.department}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={cn(
                                                "w-8 h-8 flex items-center justify-center rounded-full font-bold",
                                                index === 0 ? "bg-yellow-100 text-yellow-600" :
                                                    index === 1 ? "bg-gray-200 text-gray-600" :
                                                        index === 2 ? "bg-orange-100 text-orange-600" :
                                                            "bg-white text-gray-500 border"
                                            )}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium">{dept.department}</p>
                                                <p className="text-sm text-muted-foreground">{dept.employeeCount} employees</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary">{dept.averageFootprint} kg</p>
                                            <p className="text-xs text-muted-foreground">Avg CO2e</p>
                                        </div>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
