// ---------------------------------------------
// Developer Reference Notes
// ---------------------------------------------
//
// Project: Hirefy – On-Demand IT Service Platform
// Group: S-Ware
// Members: Hassan Mir, Imad Rana, Kishan Patel, Mayur Tirkar, Anandjit Kaur
// File: app/settings/page.tsx
//
// Description:
// - Account Settings page grouped into four tabs: Profile, Payouts, Notifications, Security.
// - Uses React Hook Form + Zod for validation across multiple independent forms.
// - Implements simple local Tabs and Switch components as fallbacks instead of relying
//   directly on shadcn/ui Tabs/Switch.
// - Each section has its own loading state and shows toast feedback on successful submit.
//
// Development Process & Key Learnings:
// - Structured multiple forms on the same page without mixing their state or validation schemas.
// - Used zodResolver to keep form validation logic close to the input definitions.
// - Practiced modeling user preferences (notifications, payout info) with strongly typed form values.
// - Implemented lightweight controlled components (Tabs, Switch) that still feel like a proper UI kit.
// - Added simple loading simulations with setTimeout to mimic real API calls and reset forms where needed.
//
// References & Resources Used:
// • React Hook Form + zodResolver: https://react-hook-form.com/get-started#SchemaValidation  
// • Zod validation library: https://zod.dev/  
// • shadcn/ui components (Button, Card, Form, Input, Select): https://ui.shadcn.com  
// • Lucide React Icons (Settings, User, Bell, Lock, Banknote, Landmark, Loader2): https://lucide.dev/icons  
// • TailwindCSS for spacing, grid, and responsive layout: https://tailwindcss.com/docs  
// ---------------------------------------------


'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '../../../components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Settings, Bell, Ticket, MessageSquare, Trash2, User, Clock, Send, Loader2, AlertTriangle, History } from 'lucide-react';
import { doc, getDoc, updateDoc, addDoc, collection, query, where, orderBy, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Badge } from '@/components/ui/badge';

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: any;
  updatedAt: any;
}

interface UserSettings {
  messageSoundEnabled: boolean;
  availabilityStatus: 'available' | 'not-available' | 'away';
}

export default function ProfessionalSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<UserSettings>({
    messageSoundEnabled: true,
    availabilityStatus: 'available',
  });
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  
  // Form states
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setSettings({
            messageSoundEnabled: data.messageSoundEnabled ?? true,
            availabilityStatus: data.availabilityStatus || 'available',
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Load support tickets
  const loadTickets = async () => {
    if (!user) return;
    
    try {
      const ticketsQuery = query(
        collection(db, 'supportTickets'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(ticketsQuery);
      const ticketsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SupportTicket[];
      
      setTickets(ticketsList);
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  // Update settings in Firestore
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;
    
    try {
      await updateDoc(doc(db, 'users', user.uid), newSettings);
      setSettings({ ...settings, ...newSettings });
      toast({
        title: 'Settings Updated',
        description: 'Your preferences have been saved.',
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update settings.',
      });
    }
  };

  // Submit support ticket
  const handleSubmitTicket = async () => {
    if (!user || !ticketSubject.trim() || !ticketDescription.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all fields.',
      });
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'supportTickets'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'Professional User',
        userRole: 'professional',
        subject: ticketSubject,
        description: ticketDescription,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: 'Ticket Submitted',
        description: 'Our support team will respond soon.',
      });

      setTicketSubject('');
      setTicketDescription('');
      setTicketDialogOpen(false);
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit ticket.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Submit feedback
  const handleSubmitFeedback = async () => {
    if (!user || !feedbackMessage.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter your feedback.',
      });
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'Professional User',
        userRole: 'professional',
        message: feedbackMessage,
        createdAt: new Date().toISOString(),
      });

      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback!',
      });

      setFeedbackMessage('');
      setFeedbackDialogOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit feedback.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please type DELETE to confirm.',
      });
      return;
    }

    if (!user) return;

    setSubmitting(true);
    try {
      // Mark account as deleted (actual deletion should be handled by admin/backend)
      await updateDoc(doc(db, 'users', user.uid), {
        accountDeleted: true,
        deletedAt: new Date().toISOString(),
      });

      toast({
        title: 'Account Deletion Requested',
        description: 'Your account will be deleted within 24 hours.',
      });

      // Sign out user
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete account.',
      });
    } finally {
      setSubmitting(false);
      setDeleteDialogOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      open: 'default',
      'in-progress': 'secondary',
      resolved: 'secondary',
      closed: 'destructive',
    };
    
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border-2 border-primary/20">
        <h1 className="text-4xl font-headline font-bold flex items-center gap-3 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          <Settings className="h-10 w-10 text-primary" /> Settings
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">Manage your account preferences, notifications, and support.</p>
      </div>

      {/* Availability Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" /> Availability Status
          </CardTitle>
          <CardDescription>Let clients know when you're available for work.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.availabilityStatus}
            onValueChange={(value) => updateSettings({ availabilityStatus: value as any })}
          >
            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent">
              <RadioGroupItem value="available" id="available" />
              <Label htmlFor="available" className="flex-1 cursor-pointer">
                <div className="font-medium">Available Now</div>
                <div className="text-sm text-muted-foreground">You're ready to take on new projects and respond to messages</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent">
              <RadioGroupItem value="not-available" id="not-available" />
              <Label htmlFor="not-available" className="flex-1 cursor-pointer">
                <div className="font-medium">Not Available</div>
                <div className="text-sm text-muted-foreground">You're busy with current projects and may not respond immediately</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent">
              <RadioGroupItem value="away" id="away" />
              <Label htmlFor="away" className="flex-1 cursor-pointer">
                <div className="font-medium">Away / Vacation Mode</div>
                <div className="text-sm text-muted-foreground">You're away and won't be taking new work or responding</div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Notification Settings
          </CardTitle>
          <CardDescription>Manage how you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex-1">
              <Label htmlFor="message-sound" className="font-medium">Message Sound</Label>
              <p className="text-sm text-muted-foreground">Play a sound when you receive new messages</p>
            </div>
            <Switch
              id="message-sound"
              checked={settings.messageSoundEnabled}
              onCheckedChange={(checked: boolean) => updateSettings({ messageSoundEnabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Support & Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" /> Support & Feedback
          </CardTitle>
          <CardDescription>Get help or share your thoughts with us.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Open Support Ticket */}
          <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Ticket className="mr-2 h-4 w-4" />
                Open Support Ticket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Open Support Ticket</DialogTitle>
                <DialogDescription>Describe your issue and our team will help you.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide details about your issue"
                    rows={5}
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTicketDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmitTicket} disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Submit Ticket
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Ticket History */}
          <Dialog open={historyDialogOpen} onOpenChange={(open) => {
            setHistoryDialogOpen(open);
            if (open) loadTickets();
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <History className="mr-2 h-4 w-4" />
                View Ticket History
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[600px] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Support Ticket History</DialogTitle>
                <DialogDescription>View all your previous support tickets.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                {tickets.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No tickets found.</p>
                ) : (
                  tickets.map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold">{ticket.subject}</h4>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{ticket.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Submit Feedback */}
          <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Submit Feedback
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Feedback</DialogTitle>
                <DialogDescription>Share your thoughts, suggestions, or report issues.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="feedback">Your Feedback</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Tell us what you think..."
                    rows={6}
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmitFeedback} disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Submit Feedback
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" /> Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-destructive">Delete Account</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. All your data will be permanently deleted.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm">To confirm deletion, please type <strong>DELETE</strong> below:</p>
                <Input
                  placeholder="Type DELETE to confirm"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount} 
                  disabled={submitting || deleteConfirmation !== 'DELETE'}
                >
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Delete My Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
