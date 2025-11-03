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

import React, { useState, createContext, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Settings, User, Bell, Lock, Banknote, Landmark } from 'lucide-react';

/* Local lightweight Tabs implementation as a fallback for '@/components/ui/tabs' */
type TabsContextType = { value: string | null; setValue: (v: string) => void };
const TabsContext = createContext<TabsContextType | undefined>(undefined);

function Tabs({ defaultValue, children, className }: { defaultValue?: string; children: React.ReactNode; className?: string }) {
  const [value, setValue] = useState<string | null>(defaultValue ?? null);
  return <TabsContext.Provider value={{ value, setValue }}>{children}</TabsContext.Provider>;
}

function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div role="tablist" className={className}>{children}</div>;
}

function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext);
  if (!ctx) return null;
  const selected = ctx.value === value;
  return (
    <button
      role="tab"
      aria-selected={selected}
      onClick={() => ctx.setValue(value)}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded ${selected ? 'font-medium' : 'text-muted-foreground'}`}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext);
  if (!ctx) return null;
  return ctx.value === value ? <div>{children}</div> : null;
}

/* Local lightweight Switch component as a fallback for '@/components/ui/switch' */
const Switch = ({
  checked,
  onCheckedChange,
  disabled = false,
  className = '',
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
  className?: string;
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-primary' : 'bg-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
  );
};

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- ZOD Schemas ---
const profileSchema = z.object({
  fullName: z.string().min(2, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  timezone: z.string().min(1, 'Timezone is required.'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Current password is required.'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
    confirmPassword: z.string().min(6, 'Please confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match.',
    path: ['confirmPassword'],
  });

const notificationsSchema = z.object({
  emailOnNewJob: z.boolean(),
  emailOnInvitation: z.boolean(),
  emailOnMessage: z.boolean(),
  emailMarketing: z.boolean(),
});

const payoutSchema = z.object({
  bankName: z.string().min(2, 'Bank name is required.'),
  institutionNumber: z.string().length(3, 'Institution number must be 3 digits.'),
  transitNumber: z.string().length(5, 'Transit number must be 5 digits.'),
  accountNumber: z.string().min(5, 'Account number is required (min 5 digits).'),
});

// --- Types ---
type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type NotificationsFormValues = z.infer<typeof notificationsSchema>;
type PayoutFormValues = z.infer<typeof payoutSchema>;

// --- Mock Data ---
const currentSettings: ProfileFormValues = {
  fullName: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  timezone: 'America/Edmonton',
};

const currentNotifications: NotificationsFormValues = {
  emailOnNewJob: true,
  emailOnInvitation: true,
  emailOnMessage: true,
  emailMarketing: false,
};

const currentPayoutDetails = {
  bankName: 'TD Canada Trust',
  maskedAccountNumber: '••••••••1234',
};

// --- Component ---
export default function SettingsPage() {
  const { toast } = useToast();

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingPayout, setLoadingPayout] = useState(false);

  // Forms
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: currentSettings,
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const notificationsForm = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: currentNotifications,
  });

  const payoutForm = useForm<PayoutFormValues>({
    resolver: zodResolver(payoutSchema),
    defaultValues: { bankName: '', institutionNumber: '', transitNumber: '', accountNumber: '' },
  });

  // --- Submit Handlers ---
  const handleProfileSubmit = async (values: ProfileFormValues) => {
    setLoadingProfile(true);
    console.log('Profile:', values);
    await new Promise((r) => setTimeout(r, 1000));
    setLoadingProfile(false);
    toast({ title: 'Profile Updated', description: 'Your profile information has been saved.' });
  };

  const handlePasswordSubmit = async (values: PasswordFormValues) => {
    setLoadingPassword(true);
    console.log('Password:', values);
    await new Promise((r) => setTimeout(r, 1000));
    setLoadingPassword(false);
    passwordForm.reset();
    toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
  };

  const handleNotificationsSubmit = async (values: NotificationsFormValues) => {
    setLoadingNotifications(true);
    console.log('Notifications:', values);
    await new Promise((r) => setTimeout(r, 1000));
    setLoadingNotifications(false);
    toast({ title: 'Notifications Updated', description: 'Notification preferences saved.' });
  };

  const handlePayoutSubmit = async (values: PayoutFormValues) => {
    setLoadingPayout(true);
    console.log('Payout:', values);
    await new Promise((r) => setTimeout(r, 1000));
    setLoadingPayout(false);
    payoutForm.reset();
    toast({ title: 'Payout Updated', description: 'Banking information has been saved.' });
  };

  // --- Render ---
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" /> Account Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your profile, payouts, and notification preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile"><User className="mr-2" /> Profile</TabsTrigger>
          <TabsTrigger value="payouts"><Banknote className="mr-2" /> Payouts</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2" /> Notifications</TabsTrigger>
          <TabsTrigger value="security"><Lock className="mr-2" /> Security</TabsTrigger>
        </TabsList>

        {/* PROFILE */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Private info, not displayed publicly.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4 max-w-lg">
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
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Edmonton">America/Edmonton</SelectItem>
                            <SelectItem value="America/Vancouver">America/Vancouver</SelectItem>
                            <SelectItem value="America/Winnipeg">America/Winnipeg</SelectItem>
                            <SelectItem value="America/Toronto">America/Toronto</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loadingProfile}>
                  {loadingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYOUTS */}
        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Current Payout Method</CardTitle>
              <CardDescription>Current bank account used for payouts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 flex justify-between items-center bg-muted/30">
                <div className="flex items-center gap-4">
                  <Landmark className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{currentPayoutDetails.bankName}</p>
                    <p className="text-sm text-muted-foreground">
                      Account ending in {currentPayoutDetails.maskedAccountNumber.slice(-4)}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Remove</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add New Bank Account</CardTitle>
              <CardDescription>Add banking details to receive payouts.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={payoutForm.handleSubmit(handlePayoutSubmit)} className="space-y-4 max-w-lg">
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
                        <FormControl><Input placeholder="003" {...field} inputMode="numeric" pattern="[0-9]*" /></FormControl>
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
                        <FormControl><Input placeholder="00000" {...field} inputMode="numeric" pattern="[0-9]*" /></FormControl>
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
                      <FormControl><Input placeholder="123456789" {...field} inputMode="numeric" pattern="[0-9]*" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loadingPayout}>
                  {loadingPayout && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Bank Account
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Manage how you receive notifications from Hirefy.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={notificationsForm.handleSubmit(handleNotificationsSubmit)} className="space-y-4 max-w-lg">
                {Object.entries(currentNotifications).map(([key, _]) => (
                  <FormField
                    key={key}
                    control={notificationsForm.control}
                    name={key as keyof NotificationsFormValues}
                    render={({ field }) => (
                      <FormItem className="flex justify-between items-center border rounded-lg p-4">
                        <FormLabel className="m-0">{key}</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
                <Button type="submit" disabled={loadingNotifications}>
                  {loadingNotifications && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Preferences
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Use a strong and unique password for security.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4 max-w-lg">
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
                <Button type="submit" disabled={loadingPassword}>
                  {loadingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
