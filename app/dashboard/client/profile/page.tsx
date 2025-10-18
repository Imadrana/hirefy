
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Building, Mail, Phone, MapPin, Edit, Save, Upload } from 'lucide-react';
import Image from 'next/image';

const profileSchema = z.object({
  companyName: z.string().min(2, 'Company name is required.'),
  companyEmail: z.string().email('Invalid email address.'),
  companyPhone: z.string().min(10, 'Please enter a valid phone number.'),
  address: z.string().min(5, 'Address is required.'),
  city: z.string().min(2, 'City is required.'),
  province: z.string().min(2, 'Province is required.'),
  postalCode: z.string().min(6, 'Postal code is required.'),
  companyDescription: z.string().min(20, 'Description must be at least 20 characters.'),
  contactName: z.string().min(2, 'Point of contact name is required.'),
  contactPhone: z.string().min(10, 'Please enter a valid phone number for the contact person.'),
});

// Mock data, in a real app this would come from the AuthContext or a server fetch
const currentProfile = {
    companyName: 'Innovate Inc.',
    companyEmail: 'contact@innovate.com',
    companyPhone: '(403) 555-0101',
    address: '123 Tech Street',
    city: 'Calgary',
    province: 'Alberta',
    postalCode: 'T2N 1N4',
    companyDescription: 'Innovate Inc. is a leading provider of custom software solutions, specializing in web and mobile application development for startups and enterprise clients.',
    contactName: 'Jane Doe',
    contactPhone: '(403) 555-0102',
    logo: 'https://placehold.co/150x150.png',
};


export default function CompanyProfilePage() {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: currentProfile,
    });

    const onSubmit = async (values: z.infer<typeof profileSchema>) => {
        setLoading(true);
        console.log('Profile updated:', values);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setLoading(false);
        setIsEditing(false);
        toast({
        title: 'Profile Updated!',
        description: 'Your company information has been saved successfully.',
        });
    };

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
                    <Building className="h-8 w-8 text-primary" /> Company Profile
                </h1>
                <p className="text-muted-foreground">Manage your company's public information and contact details.</p>
            </div>
            
            <Form {...form}>
                 <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-start">
                            <div>
                                <CardTitle>Business Information</CardTitle>
                                <CardDescription>This information will be visible to professionals.</CardDescription>
                            </div>
                            {isEditing ? (
                                <Button type="submit" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2"/>}
                                    Save Changes
                                </Button>
                            ) : (
                                <Button variant="outline" type="button" onClick={() => setIsEditing(true)}>
                                    <Edit className="mr-2" />
                                    Edit Profile
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-8">
                             <div className="flex items-center gap-6">
                                <Image 
                                    src={currentProfile.logo} 
                                    alt="Company Logo" 
                                    width={100} height={100}
                                    data-ai-hint="company logo"
                                    className="rounded-full border-4 border-muted"
                                />
                                {isEditing && (
                                    <Button variant="outline" type="button">
                                        <Upload className="mr-2" /> Upload Logo
                                    </Button>
                                )}
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                               <FormField control={form.control} name="companyName" render={({ field }) => (
                                   <FormItem>
                                       <FormLabel>Company Name</FormLabel>
                                       <FormControl>
                                            <Input {...field} disabled={!isEditing} placeholder="Your Company LLC" />
                                       </FormControl>
                                       <FormMessage />
                                   </FormItem>
                               )} />
                                <FormField control={form.control} name="companyEmail" render={({ field }) => (
                                   <FormItem>
                                       <FormLabel>Company Email</FormLabel>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <FormControl>
                                                <Input {...field} disabled={!isEditing} placeholder="contact@company.com" className="pl-10" />
                                            </FormControl>
                                        </div>
                                       <FormMessage />
                                   </FormItem>
                               )} />
                               <FormField control={form.control} name="companyPhone" render={({ field }) => (
                                   <FormItem>
                                       <FormLabel>Company Phone</FormLabel>
                                       <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <FormControl>
                                                <Input {...field} disabled={!isEditing} placeholder="(555) 123-4567" className="pl-10" />
                                            </FormControl>
                                        </div>
                                       <FormMessage />
                                   </FormItem>
                               )} />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="address" render={({ field }) => (
                                   <FormItem>
                                       <FormLabel>Street Address</FormLabel>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <FormControl>
                                                <Input {...field} disabled={!isEditing} placeholder="123 Main St" className="pl-10" />
                                            </FormControl>
                                        </div>
                                       <FormMessage />
                                   </FormItem>
                               )} />
                                <div className="grid grid-cols-3 gap-2">
                                     <FormField control={form.control} name="city" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl><Input {...field} disabled={!isEditing} placeholder="Calgary" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                      <FormField control={form.control} name="province" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Province</FormLabel>
                                            <FormControl><Input {...field} disabled={!isEditing} placeholder="AB" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                     <FormField control={form.control} name="postalCode" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Postal</FormLabel>
                                            <FormControl><Input {...field} disabled={!isEditing} placeholder="T2P 1J9" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </div>
                            
                             <FormField control={form.control} name="companyDescription" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} disabled={!isEditing} rows={5} placeholder="Describe what your company does..." />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                             <div>
                                <h3 className="font-semibold text-lg mb-4 border-t pt-6">Point of Contact</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                     <FormField control={form.control} name="contactName" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact Person's Name</FormLabel>
                                             <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <FormControl>
                                                    <Input {...field} disabled={!isEditing} placeholder="John Doe" className="pl-10" />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="contactPhone" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact Person's Phone</FormLabel>
                                             <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <FormControl>
                                                    <Input {...field} disabled={!isEditing} placeholder="(555) 987-6543" className="pl-10" />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                             </div>

                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
