import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { footprintService } from '@/services/footprint.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { AlertCircle, CheckCircle } from 'lucide-react';

const footprintSchema = z.object({
    transport: z.string().default('private'),
    vehicleKm: z.coerce.number().min(0),
    wasteBagCount: z.coerce.number().min(0),
    dailyTvPc: z.coerce.number().min(0),
    groceryBill: z.coerce.number().min(0),
    clothesMonthly: z.coerce.number().min(0),
    internetDaily: z.coerce.number().min(0),
    recyclePaper: z.boolean().default(false),
    recyclePlastic: z.boolean().default(false),
    recycleGlass: z.boolean().default(false),
    recycleMetal: z.boolean().default(false),
});

type FootprintForm = z.infer<typeof footprintSchema>;

export function FootprintCalculator() {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FootprintForm>({
        resolver: zodResolver(footprintSchema) as any,
        defaultValues: {
            transport: 'private',
            vehicleKm: 0,
            wasteBagCount: 0,
            dailyTvPc: 0,
            groceryBill: 0,
            clothesMonthly: 0,
            internetDaily: 0,
            recyclePaper: false,
            recyclePlastic: false,
            recycleGlass: false,
            recycleMetal: false,
        },
    });

    const calculateMutation = useMutation({
        mutationFn: footprintService.calculate,
        onSuccess: (data) => {
            setSuccess(`Calculation complete! Total footprint: ${data.totalFootprint} kg CO2e`);
            setTimeout(() => navigate('/dashboard'), 2000);
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to calculate footprint');
        },
    });

    const onSubmit = (data: FootprintForm) => {
        setError(null);
        setSuccess(null);
        // @ts-ignore
        calculateMutation.mutate(data);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Carbon Calculator</h1>
                <p className="text-muted-foreground">
                    Enter your monthly activities to calculate your carbon footprint.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Monthly Activity</CardTitle>
                    <CardDescription>
                        Please provide accurate estimates for the last month.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-50 text-green-500 p-3 rounded-md text-sm flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {success}
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="vehicleKm">Vehicle Distance (km)</Label>
                                <Input id="vehicleKm" type="number" {...register('vehicleKm')} />
                                {errors.vehicleKm && (
                                    <p className="text-sm text-red-500">{errors.vehicleKm.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="wasteBagCount">Waste Bags (count)</Label>
                                <Input id="wasteBagCount" type="number" {...register('wasteBagCount')} />
                                {errors.wasteBagCount && (
                                    <p className="text-sm text-red-500">{errors.wasteBagCount.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dailyTvPc">TV/PC Daily (hours)</Label>
                                <Input id="dailyTvPc" type="number" {...register('dailyTvPc')} />
                                {errors.dailyTvPc && (
                                    <p className="text-sm text-red-500">{errors.dailyTvPc.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="internetDaily">Internet Daily (hours)</Label>
                                <Input id="internetDaily" type="number" {...register('internetDaily')} />
                                {errors.internetDaily && (
                                    <p className="text-sm text-red-500">{errors.internetDaily.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="groceryBill">Grocery Bill ($)</Label>
                                <Input id="groceryBill" type="number" {...register('groceryBill')} />
                                {errors.groceryBill && (
                                    <p className="text-sm text-red-500">{errors.groceryBill.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="clothesMonthly">New Clothes (count)</Label>
                                <Input id="clothesMonthly" type="number" {...register('clothesMonthly')} />
                                {errors.clothesMonthly && (
                                    <p className="text-sm text-red-500">{errors.clothesMonthly.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Recycling</Label>
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" {...register('recyclePaper')} className="rounded border-gray-300" />
                                    <span className="text-sm">Paper</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" {...register('recyclePlastic')} className="rounded border-gray-300" />
                                    <span className="text-sm">Plastic</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" {...register('recycleGlass')} className="rounded border-gray-300" />
                                    <span className="text-sm">Glass</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" {...register('recycleMetal')} className="rounded border-gray-300" />
                                    <span className="text-sm">Metal</span>
                                </label>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting || calculateMutation.isPending}>
                            {calculateMutation.isPending ? 'Calculating...' : 'Calculate Footprint'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
