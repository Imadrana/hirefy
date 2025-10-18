'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Settings, User, Bell, Lock, CreditCard, Save } from 'lucide-react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const profileSchema = z.object({
  contactName: z.string().min(2, "Name is required."),
  contactEmail: z.string().email("Invalid email address."),
  timezone: z.string().min(1, "Timezone is required."),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(6, "Current password is required."),
    newPassword: z.string().min(6, "New password must be at least 6 characters."),
    confirmPassword: z.string().min(6, "Please confirm your new password."),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
});


const notificationsSchema = z.object({
    emailOnMessage: z.boolean().default(true),
    emailOnProposal: z.boolean().default(true),
    emailOnStatusChange: z.boolean().default(false),
    emailMarketing: z.boolean().default(true),
});


// Mock data for settings
const currentSettings = {
    contactName: "Jane Doe",
    contactEmail: "jane.doe@innovate.com",
    timezone: "America/Edmonton", // Mountain Standard Time
};

const currentNotifications = {
    emailOnMessage: true,
    emailOnProposal: true,
    emailOnStatusChange: false,
    emailMarketing: true,
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: currentSettings,
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: ""},
  });

  const notificationsForm = useForm<z.infer<typeof notificationsSchema>>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: currentNotifications,
  });


  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    setLoading(true);
    console.log("Profile settings updated:", values);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    toast({ title: 'Profile Updated', description: 'Your contact information has been saved.' });
  };
  
  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setLoading(true);
    console.log("Password change requested:", values);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    passwordForm.reset();
    toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
  };

  const onNotificationsSubmit = async (values: z.infer<typeof notificationsSchema>) => {
    setLoading(true);
    console.log("Notification settings updated:", values);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    toast({ title: 'Notifications Updated', description: 'Your notification preferences have been saved.' });
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" /> Account Settings
        </h1>
        <p className="text-muted-foreground">Manage your account, billing, and notification preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile"><User className="mr-2"/> Profile</TabsTrigger>
          <TabsTrigger value="billing"><CreditCard className="mr-2"/> Billing & Payments</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2"/> Notifications</TabsTrigger>
          <TabsTrigger value="security"><Lock className="mr-2"/> Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>Manage the primary contact for your company account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 max-w-lg">
                            <FormField
                                control={profileForm.control}
                                name="contactName"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl><Input placeholder="Your Name" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={profileForm.control}
                                name="contactEmail"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl><Input placeholder="you@company.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={profileForm.control}
                                name="timezone"
                                render={({ field }) => (
                                <FormItem>
                                <FormLabel>Timezone</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your timezone" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="America/Edmonton">Mountain Time (MDT)</SelectItem>
                                    <SelectItem value="America/Vancouver">Pacific Time (PDT)</SelectItem>
                                    <SelectItem value="America/Winnipeg">Central Time (CDT)</SelectItem>
                                    <SelectItem value="America/Toronto">Eastern Time (EDT)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your connected payment methods for funding projects.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="border rounded-lg p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <CreditCard className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Visa ending in 4242</p>
                                <p className="text-sm text-muted-foreground">Expires 12/2026</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">Remove</Button>
                    </div>
                    <Button>Add New Payment Method</Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Currency</CardTitle>
                    <CardDescription>Set your preferred currency for browsing and posting jobs.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select defaultValue="CAD">
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Email Notifications</CardTitle>
                    <CardDescription>Manage how you receive notifications from Hirefy.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <Form {...notificationsForm}>
                        <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
                            <FormField
                                control={notificationsForm.control}
                                name="emailOnMessage"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">New Messages</FormLabel>
                                            <FormDescription>Receive an email when a professional sends you a message.</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={notificationsForm.control}
                                name="emailOnProposal"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">New Proposals</FormLabel>
                                            <FormDescription>Get notified when a new proposal is submitted for your job.</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={notificationsForm.control}
                                name="emailOnStatusChange"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Project Updates</FormLabel>
                                            <FormDescription>Receive emails for project status changes and milestone updates.</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={notificationsForm.control}
                                name="emailMarketing"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Marketing & Promotions</FormLabel>
                                            <FormDescription>Receive occasional emails about new features and offers.</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Preferences
                            </Button>
                        </form>
                    </Form>
                 </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>For your security, we recommend using a long, unique password.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-lg">
                            <FormField
                                control={passwordForm.control}
                                name="currentPassword"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl><Input type="password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl><Input type="password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl><Input type="password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Change Password
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
