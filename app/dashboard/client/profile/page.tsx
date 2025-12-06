// -------------------------------
//  Developer Reference Notes
// -------------------------------
//
// Project: Hirefy – On-Demand IT Service Platform
// Group: S-Ware 
// Members: Anandjit Kaur, Hassan Mir, Imad Rana, Kishan Patel, Mayur Tirkar
// Folder: app/dashboard/company-profile   File: page.tsx
//
// Description:
// - Client-side Next.js page for managing a client's company profile
// - Allows authenticated users to view and edit business information
// - Integrates with Firebase Firestore to load and persist profile data
// - Uses React Hook Form + Zod for form handling and validation
// - Uses shadcn/ui components and lucide-react icons for UI and layout
//
// Technical Understanding & Research Summary:
// - Learned how to build controlled forms using react-hook-form with zodResolver
// - Implemented validation schema with Zod for strong type safety
// - Used Firebase Firestore (doc, getDoc, setDoc, updateDoc) to read/write user profile data
// - Used Next.js "use client" directive for client-side hooks (useState, useEffect, useAuth)
// - Utilized shadcn/ui components (Form, Input, Textarea, Card, Button) for consistent styling
// - Used a loading state and initial loading spinner for better UX while fetching data
//
// References / Tutorials:
// • React Hook Form: https://react-hook-form.com/get-started
// • Zod Validation: https://zod.dev/?id=basic-usage
// • Firebase Firestore: https://firebase.google.com/docs/firestore/quickstart
// • shadcn/ui Components: https://ui.shadcn.com
// • Next.js Client Components: https://nextjs.org/docs/app/building-your-application/rendering/client-components
//
// -------------------------------
// ChatGPT Prompt Used
// -------------------------------
//
// "Add a Developer Reference Notes section at the top of this CompanyProfilePage
// file and add explanatory comments throughout the code. Keep all logic and 
// structure the same, just add documentation-style notes so it is easy for the
// instructor and group members to understand how the page works."
//
// -------------------------------
// Summary:
// - Language: TypeScript / TSX (React + Next.js)
// - Side: Frontend (Client-side page)
// - Libraries Used: Next.js, React Hook Form, Zod, Firebase Firestore, shadcn/ui, lucide-react
// - Purpose: Let clients manage their public company profile and contact information
// -------------------------------
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Building, Mail, Phone, MapPin, Edit, Save, Upload, Camera, Linkedin, UserCircle } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/firebase';
import InlineRating from '@/components/InlineRating';
import ProfileAvatar from '@/components/ProfileAvatar';


const profileSchema = z.object({
  companyName: z.string().min(2, 'Company name is required.'),
  companyEmail: z.string().email('Invalid email address.'),
  companyPhone: z.string().min(10, 'Please enter a valid phone number.'),
  linkedinUrl: z.string().url('Please enter a valid LinkedIn URL.').optional().or(z.literal('')),
  hrEmail: z.string().email('Please enter a valid HR email address.').optional().or(z.literal('')),
  address: z.string().min(5, 'Address is required.'),
  city: z.string().min(2, 'City is required.'),
  province: z.string().min(2, 'Province is required.'),
  postalCode: z.string().min(6, 'Postal code is required.'),
  businessType: z.string().min(2, 'Business type is required.'),
  companyDescription: z.string().min(20, 'Description must be at least 20 characters.'),
  contactName: z.string().min(2, 'Point of contact name is required.'),
  contactPhone: z.string().min(10, 'Please enter a valid phone number for the contact person.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Default empty profile
const defaultProfile: ProfileFormValues = {
  companyName: '',
  companyEmail: '',
  companyPhone: '',
  linkedinUrl: '',
  hrEmail: '',
  address: '',
  city: '',
  province: '',
  postalCode: '',
  businessType: '',
  companyDescription: '',
  contactName: '',
  contactPhone: '',
};

export default function CompanyProfilePage() {
  const { toast } = useToast();
  const { user, userData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState('https://placehold.co/150x150.png');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shouldSubmitRef = useRef(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultProfile,
  });

  // Fetch client profile data from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const profileRef = doc(db, 'users', user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const data = profileSnap.data();
          const profileData: ProfileFormValues = {
            companyName: data.companyName || '',
            companyEmail: data.companyEmail || data.email || user.email || '',
            companyPhone: data.companyPhone || data.phone || '',
            linkedinUrl: data.linkedinUrl || '',
            hrEmail: data.hrEmail || '',
            address: data.address || '',
            city: data.city || '',
            province: data.province || '',
            postalCode: data.postalCode || '',
            businessType: data.businessType || '',
            companyDescription: data.companyDescription || data.bio || '',
            contactName: data.contactName || data.name || '',
            contactPhone: data.contactPhone || data.phone || '',
          };

          setLogoUrl(data.logo || data.avatar || data.photoURL || 'https://placehold.co/150x150.png');
          
          // Check if profile is complete
          const isComplete = !!(
            data.companyName &&
            data.address &&
            data.city &&
            data.province &&
            data.postalCode &&
            data.businessType &&
            data.companyDescription
          );
          setIsProfileComplete(isComplete);
          
          form.reset(profileData);
        } else {
          // Set email from auth if profile doesn't exist
          form.setValue('companyEmail', user.email || '');
          setIsProfileComplete(false);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load profile data.',
        });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProfile();
  }, [user, form, toast]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please select an image file.',
      });
      return;
    }

    setUploadingImage(true);
    try {
      const timestamp = Date.now();
      const filePath = `profile-images/${user.uid}/${timestamp}_${file.name}`;
      const fileRef = ref(storage, filePath);
      
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      
      // Update Firestore with new logo URL
      const profileRef = doc(db, 'users', user.uid);
      await updateDoc(profileRef, {
        logo: downloadURL,
        photoURL: downloadURL,
        avatar: downloadURL,
      });
      
      setLogoUrl(downloadURL);
      
      toast({
        title: 'Profile picture updated!',
        description: 'Your company logo has been saved successfully.',
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'Could not upload image. Please try again.',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    console.log('🔴 onSubmit called! shouldSubmitRef.current:', shouldSubmitRef.current, 'isEditing:', isEditing);
    
    if (!user) {
      console.log('🚫 No user');
      return;
    }
    
    // Only allow submission when explicitly triggered by Save button
    if (!shouldSubmitRef.current) {
      console.log('🚫 Form submission BLOCKED - not triggered by Save button');
      shouldSubmitRef.current = false; // Reset
      return;
    }

    console.log('✅ Proceeding with save...');
    shouldSubmitRef.current = false; // Reset after allowing
    setLoading(true);
    try {
      const profileRef = doc(db, 'users', user.uid);

      const profileData = {
        companyName: values.companyName,
        companyEmail: values.companyEmail,
        companyPhone: values.companyPhone,
        linkedinUrl: values.linkedinUrl || '',
        hrEmail: values.hrEmail || '',
        address: values.address,
        city: values.city,
        province: values.province,
        postalCode: values.postalCode,
        businessType: values.businessType,
        companyDescription: values.companyDescription,
        contactName: values.contactName,
        contactPhone: values.contactPhone,
        name: values.companyName, // For compatibility
        email: values.companyEmail,
        phone: values.companyPhone,
        bio: values.companyDescription,
        isProfileComplete: true,
        updatedAt: new Date().toISOString(),
      };

      // Check if document exists
      const docSnap = await getDoc(profileRef);
      if (docSnap.exists()) {
        await updateDoc(profileRef, profileData);
      } else {
        await setDoc(profileRef, {
          ...profileData,
          role: 'client',
          createdAt: new Date().toISOString(),
        });
      }

      setIsProfileComplete(true);
      toast({
        title: 'Profile Updated!',
        description: 'Your company information has been saved successfully.',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Debug: Track isEditing changes
  useEffect(() => {
    console.log('📝 isEditing changed to:', isEditing);
  }, [isEditing]);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border-2 border-primary/20">
        <h1 className="text-4xl font-headline font-bold flex items-center gap-3 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          <Building className="h-10 w-10 text-primary" /> Company Profile
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Manage your company's public information and contact details to attract top IT professionals.
        </p>
      </div>

      {/* Profile Completeness Banner */}
      {isProfileComplete ? (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">Profile Complete</span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1 ml-7">
            Your profile is complete and visible to professionals.
          </p>
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">Profile Incomplete</span>
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1 ml-7">
            Please complete all required fields to be visible to professionals.
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (isEditing) {
            form.handleSubmit(onSubmit)(e);
          }
        }}>
          <Card>
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>This information will be visible to professionals.</CardDescription>
              </div>

              {isEditing ? (
                <Button 
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    console.log('💾 Save button clicked!');
                    shouldSubmitRef.current = true;
                    form.handleSubmit(onSubmit)();
                  }}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2" />}
                  Save Changes
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🟢 Edit Profile button clicked!');
                    setIsEditing(true);
                  }}
                >
                  <Edit className="mr-2" /> Edit Profile
                </Button>
              )}
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Logo */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <ProfileAvatar
                    fullName={form.watch('companyName')}
                    avatarUrl={logoUrl}
                    size="lg"
                    editable={isEditing}
                    onEditClick={() => fileInputRef.current?.click()}
                  />
                  {uploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {isEditing && (
                    <p className="text-xs text-muted-foreground">
                      Click camera icon to change logo<br />
                      PNG, JPG or GIF (max. 5MB)
                    </p>
                  )}
                </div>
              </div>

              {/* Company Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} placeholder="Your Company LLC" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} placeholder="e.g., Tech Startup, Retail" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Rating Display */}
              {user && (
                <div className="pt-2 pb-4 border-b">
                  <InlineRating userId={user.uid} size="md" showCount={true} />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="companyEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Email</FormLabel>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditing}
                            placeholder="contact@company.com"
                            className="pl-10"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Phone</FormLabel>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditing}
                            placeholder="(555) 123-4567"
                            className="pl-10"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedinUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Company Page</FormLabel>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditing}
                            placeholder="https://linkedin.com/company/your-company"
                            className="pl-10"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hrEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HR Contact Email</FormLabel>
                      <div className="relative">
                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditing}
                            placeholder="hr@company.com"
                            type="email"
                            className="pl-10"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address */}
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
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
                  )}
                />

                <div className="grid grid-cols-3 gap-2">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} placeholder="Calgary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Province</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} placeholder="AB" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} placeholder="T2P 1J9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Company Description */}
              <FormField
                control={form.control}
                name="companyDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={!isEditing}
                        rows={5}
                        placeholder="Describe what your company does..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Point of Contact */}
              <div>
                <h3 className="font-semibold text-lg mb-4 border-t pt-6">Point of Contact</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
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
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
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
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
