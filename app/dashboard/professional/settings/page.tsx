/*Build a Next.js 13 (App Router) page using TypeScript, React Hook Form, Zod, and shadcn/ui components called SettingsPage.

The page should be a user account settings interface divided into four tabs:

Profile

Includes a form for fullName, email, and timezone.

Validate inputs using Zod (name required, valid email, timezone required).

On submit, show a toast (“Profile Updated”).

Payouts

Show existing payout account (mock data) with bank name and masked account number.

Add a form to add a new bank account with fields: bankName, institutionNumber, transitNumber, accountNumber.

Validate all fields with Zod.

Show a loading spinner on submit and a toast (“Payout Method Updated”).

Notifications

Use toggles (Switch components) to manage boolean preferences:

emailOnNewJob, emailOnInvitation, emailOnMessage, emailMarketing.

Submit button saves preferences and shows a toast (“Notifications Updated”).

Security

Add a Change Password form with fields:

currentPassword, newPassword, confirmPassword.

Validate with Zod that passwords match and have a minimum length.

Show loading spinner and success toast (“Password Updated”).

Global Requirements:

Use Tabs, Card, Form, Input, Select, Switch, and Button from @/components/ui.

Use Lucide-react icons (e.g., Settings, User, Bell, Lock, Banknote, Landmark, Loader2).

Use react-hook-form with zodResolver for validation.

Include mock current data for each section (profile, payout, notifications).

Add loading simulation (setTimeout) and form resets where appropriate.

Show all forms styled cleanly with Tailwind spacing and responsive layout.

Include full working code with all imports at the top.*/
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Settings, User, Bell, Lock, Banknote, Save, Landmark } from 'lucide-react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const profileSchema = z.object({
  fullName: z.string().min(2, "Name is required."),
  email: z.string().email("Invalid email address."),
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
    emailOnNewJob: z.boolean().default(true),
    emailOnInvitation: z.boolean().default(true),
    emailOnMessage: z.boolean().default(true),
    emailMarketing: z.boolean().default(false),
});

const payoutSchema = z.object({
    bankName: z.string().min(2, "Bank name is required."),
    institutionNumber: z.string().length(3, "Institution number must be 3 digits."),
    transitNumber: z.string().length(5, "Transit number must be 5 digits."),
    accountNumber: z.string().min(5, "Account number is required."),
});

// Mock data for settings
const currentSettings = {
    fullName: "Alex Johnson",
    email: "alex.johnson@example.com",
    timezone: "America/Edmonton", // Mountain Standard Time
};

const currentNotifications = {
    emailOnNewJob: true,
    emailOnInvitation: true,
    emailOnMessage: true,
    emailMarketing: false,
};

const currentPayoutDetails = {
    bankName: "TD Canada Trust",
    institutionNumber: "004",
    transitNumber: "12345",
    accountNumber: "••••••••1234",
};

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

  const payoutForm = useForm<z.infer<typeof payoutSchema>>({
      resolver: zodResolver(payoutSchema),
      defaultValues: { bankName: "", institutionNumber: "", transitNumber: "", accountNumber: "" },
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

  const onPayoutSubmit = async (values: z.infer<typeof payoutSchema>) => {
      setLoading(true);
      console.log("Payout settings updated:", values);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
      payoutForm.reset();
      toast({ title: 'Payout Method Updated', description: 'Your banking information has been saved.' });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" /> Account Settings
        </h1>
        <p className="text-muted-foreground">Manage your public profile, payouts, and notification preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile"><User className="mr-2"/> Profile</TabsTrigger>
          <TabsTrigger value="payouts"><Banknote className="mr-2"/> Payouts</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2"/> Notifications</TabsTrigger>
          <TabsTrigger value="security"><Lock className="mr-2"/> Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>This information is private and will not be displayed on your public profile.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 max-w-lg">
                            <FormField
                                control={profileForm.control}
                                name="fullName"
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
                                name="email"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
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
        
        <TabsContent value="payouts" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Payout Method</CardTitle>
                    <CardDescription>Manage your connected bank account for receiving payments.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="border rounded-lg p-4 flex justify-between items-center bg-muted/30">
                        <div className="flex items-center gap-4">
                            <Landmark className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <p className="font-medium">{currentPayoutDetails.bankName}</p>
                                <p className="text-sm text-muted-foreground">Account ending in {currentPayoutDetails.accountNumber.slice(-4)}</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">Remove</Button>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Add New Bank Account</CardTitle>
                    <CardDescription>Securely add your banking details to receive payouts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...payoutForm}>
                        <form onSubmit={payoutForm.handleSubmit(onPayoutSubmit)} className="space-y-4 max-w-lg">
                             <FormField
                                control={payoutForm.control}
                                name="bankName"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bank Name</FormLabel>
                                    <FormControl><Input placeholder="e.g., Royal Bank of Canada" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={payoutForm.control}
                                    name="institutionNumber"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Institution No.</FormLabel>
                                        <FormControl><Input placeholder="003" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={payoutForm.control}
                                    name="transitNumber"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Transit No.</FormLabel>
                                        <FormControl><Input placeholder="00000" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                             <FormField
                                control={payoutForm.control}
                                name="accountNumber"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Number</FormLabel>
                                    <FormControl><Input placeholder="123456789" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Bank Account
                            </Button>
                        </form>
                    </Form>
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
                                name="emailOnNewJob"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">New Job Matches</FormLabel>
                                            <FormDescription>Receive an email when a new job posting matches your skills.</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={notificationsForm.control}
                                name="emailOnInvitation"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Job Invitations</FormLabel>
                                            <FormDescription>Get notified when a client invites you to a job.</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={notificationsForm.control}
                                name="emailOnMessage"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">New Messages</FormLabel>
                                            <FormDescription>Receive an email when a client sends you a message.</FormDescription>
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