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
    // Personal
    bodyType: z.enum(['underweight', 'normal', 'overweight', 'obese']).default('normal'),
    sex: z.enum(['female', 'male']).default('female'),
    diet: z.enum(['omnivore', 'pescatarian', 'vegetarian', 'vegan']).default('omnivore'),
    showerFrequency: z.enum(['daily', 'less frequently', 'more frequently', 'twice a day']).default('daily'),
    socialActivity: z.enum(['often', 'never', 'sometimes']).default('often'),

    // Travel
    transport: z.enum(['public', 'private', 'walk/bicycle']).default('public'),
    vehicleType: z.enum(['petrol', 'diesel', 'hybrid', 'lpg', 'electric']).default('petrol'),
    vehicleKm: z.coerce.number().min(0),
    airTravel: z.enum(['never', 'rarely', 'frequently', 'very frequently']).default('never'),

    // Waste
    wasteBagSize: z.enum(['small', 'medium', 'large', 'extra large']).default('medium'),
    wasteBagCount: z.coerce.number().min(0),
    recyclePaper: z.boolean().default(false),
    recyclePlastic: z.boolean().default(false),
    recycleGlass: z.boolean().default(false),
    recycleMetal: z.boolean().default(false),

    // Energy
    heatingEnergy: z.enum(['natural gas', 'electricity', 'wood', 'coal']).default('electricity'),
    cookingMicrowave: z.boolean().default(false),
    cookingOven: z.boolean().default(false),
    cookingGrill: z.boolean().default(false),
    cookingAirfryer: z.boolean().default(false),
    cookingStove: z.boolean().default(false),
    energyEfficiency: z.enum(['No', 'Sometimes', 'Yes']).default('Sometimes'), // Note: app.py maps 'never', 'sometimes', 'always' but also accepts raw strings. Let's match UI to common sense.
    dailyTvPc: z.coerce.number().min(0),
    internetDaily: z.coerce.number().min(0),

    // Consumption
    groceryBill: z.coerce.number().min(0),
    clothesMonthly: z.coerce.number().min(0),
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
            bodyType: 'normal',
            sex: 'female',
            diet: 'omnivore',
            showerFrequency: 'daily',
            socialActivity: 'often',
            transport: 'public',
            vehicleType: 'petrol',
            vehicleKm: 0,
            airTravel: 'never',
            wasteBagSize: 'medium',
            wasteBagCount: 0,
            recyclePaper: false,
            recyclePlastic: false,
            recycleGlass: false,
            recycleMetal: false,
            heatingEnergy: 'electricity',
            cookingMicrowave: false,
            cookingOven: false,
            cookingGrill: false,
            cookingAirfryer: false,
            cookingStove: false,
            energyEfficiency: 'Sometimes',
            dailyTvPc: 0,
            internetDaily: 0,
            groceryBill: 0,
            clothesMonthly: 0,
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
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
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
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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

                        {/* Personal Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold border-b pb-2">Personal Details</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="sex">Sex</Label>
                                    <select id="sex" {...register('sex')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                        <option value="female">Female</option>
                                        <option value="male">Male</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bodyType">Body Type</Label>
                                    <select id="bodyType" {...register('bodyType')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                        <option value="underweight">Underweight</option>
                                        <option value="normal">Normal</option>
                                        <option value="overweight">Overweight</option>
                                        <option value="obese">Obese</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="diet">Diet</Label>
                                    <select id="diet" {...register('diet')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                        <option value="omnivore">Omnivore</option>
                                        <option value="pescatarian">Pescatarian</option>
                                        <option value="vegetarian">Vegetarian</option>
                                        <option value="vegan">Vegan</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="showerFrequency">Shower Frequency</Label>
                                    <select id="showerFrequency" {...register('showerFrequency')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                        <option value="daily">Daily</option>
                                        <option value="less frequently">Less Frequently</option>
                                        <option value="more frequently">More Frequently</option>
                                        <option value="twice a day">Twice a day</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="socialActivity">Social Activity</Label>
                                    <select id="socialActivity" {...register('socialActivity')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                        <option value="often">Often</option>
                                        <option value="sometimes">Sometimes</option>
                                        <option value="never">Never</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Travel Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold border-b pb-2">Travel</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="transport">Main Transport</Label>
                                    <select id="transport" {...register('transport')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                        <option value="public">Public</option>
                                        <option value="private">Private</option>
                                        <option value="walk/bicycle">Walk/Bicycle</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vehicleType">Vehicle Type</Label>
                                    <select id="vehicleType" {...register('vehicleType')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                        <option value="petrol">Petrol</option>
                                        <option value="diesel">Diesel</option>
                                        <option value="hybrid">Hybrid</option>
                                        <option value="lpg">LPG</option>
                                        <option value="electric">Electric</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vehicleKm">Vehicle Distance (km)</Label>
                                    <Input id="vehicleKm" type="number" {...register('vehicleKm')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="airTravel">Air Travel</Label>
                                    <select id="airTravel" {...register('airTravel')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                        <option value="never">Never</option>
                                        <option value="rarely">Rarely</option>
                                        <option value="frequently">Frequently</option>
                                        <option value="very frequently">Very Frequently</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Waste Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold border-b pb-2">Waste</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="wasteBagSize">Waste Bag Size</Label>
                                    <select id="wasteBagSize" {...register('wasteBagSize')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                        <option value="extra large">Extra Large</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="wasteBagCount">Waste Bags (count)</Label>
                                    <Input id="wasteBagCount" type="number" {...register('wasteBagCount')} />
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
                        </div>

                        {/* Energy Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold border-b pb-2">Energy</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="heatingEnergy">Heating Energy Source</Label>
                                    <select id="heatingEnergy" {...register('heatingEnergy')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                        <option value="natural gas">Natural Gas</option>
                                        <option value="electricity">Electricity</option>
                                        <option value="wood">Wood</option>
                                        <option value="coal">Coal</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="energyEfficiency">Consider Energy Efficiency?</Label>
                                    <select id="energyEfficiency" {...register('energyEfficiency')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                        <option value="No">No</option>
                                        <option value="Sometimes">Sometimes</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dailyTvPc">TV/PC Daily (hours)</Label>
                                    <Input id="dailyTvPc" type="number" {...register('dailyTvPc')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="internetDaily">Internet Daily (hours)</Label>
                                    <Input id="internetDaily" type="number" {...register('internetDaily')} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Cooking Appliances Used</Label>
                                <div className="flex flex-wrap gap-4">
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" {...register('cookingStove')} className="rounded border-gray-300" />
                                        <span className="text-sm">Stove</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" {...register('cookingOven')} className="rounded border-gray-300" />
                                        <span className="text-sm">Oven</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" {...register('cookingMicrowave')} className="rounded border-gray-300" />
                                        <span className="text-sm">Microwave</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" {...register('cookingGrill')} className="rounded border-gray-300" />
                                        <span className="text-sm">Grill</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" {...register('cookingAirfryer')} className="rounded border-gray-300" />
                                        <span className="text-sm">Airfryer</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Consumption Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold border-b pb-2">Consumption</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="groceryBill">Grocery Bill ($)</Label>
                                    <Input id="groceryBill" type="number" {...register('groceryBill')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="clothesMonthly">New Clothes (count)</Label>
                                    <Input id="clothesMonthly" type="number" {...register('clothesMonthly')} />
                                </div>
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
