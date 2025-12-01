/*Create a Next.js "use client" page called ProfessionalProfilePage that allows users to view and edit their professional profile. Use React Hook Form with Zod validation, shadcn/ui components, and TailwindCSS.

Requirements:

Include a profile form with sections:

Profile Summary: avatar, full name, title, bio

Contact & Rate: email, phone, location, hourly rate

Skills: comma-separated list with badges when not editing

Work Experience: dynamic array with fields for title, company, start/end date, description

Education: dynamic array with fields for degree, institution, year

Certifications: textarea, display as list when not editing

Use useState for isEditing and loading.

Use useForm and useFieldArray from react-hook-form to manage dynamic arrays.

Use zod schemas to validate:

fullName, title, email, phone, location, bio, skills, hourlyRate

Array of work experience objects with title, company, startDate, endDate, description

Array of education objects with degree, institution, year

Provide mock data for the profile with avatar, work experience, education, skills, certifications, and other fields.

Include buttons for editing, saving, and canceling with proper loading states and icons (Edit, Save, Loader2).

For work experience and education arrays, provide Add and Remove buttons with proper icons (PlusCircle, Trash2).

Use Form, FormField, FormItem, FormLabel, FormControl, FormMessage from shadcn/ui/form.

Include TailwindCSS layout and styling: responsive grids, spacing, cards, separators, badges for skills.

Use lucide-react icons for avatar section, contact info, education, work experience, and actions (User, Upload, Mail, Phone, MapPin, Star, Briefcase, GraduationCap, Award).

Implement toast notification on save using useToast.

Export the component as default.

Generate the full functional component code including all imports, JSX structure, state handling, form submission logic, and dynamic arrays for work experience and education.*/
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
import { Loader2, User, Building, Mail, Phone, MapPin, Edit, Save, Upload, Camera } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/firebase';

const profileSchema = z.object({
  companyName: z.string().min(2, 'Company name is required.'),
  companyEmail: z.string().email('Invalid email address.'),
  companyPhone: z.string().min(10, 'Please enter a valid phone number.'),
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          form.reset(profileData);
        } else {
          // Set email from auth if profile doesn't exist
          form.setValue('companyEmail', user.email || '');
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
    if (!user) return;

    setLoading(true);
    try {
      const profileRef = doc(db, 'users', user.uid);

      const profileData = {
        companyName: values.companyName,
        companyEmail: values.companyEmail,
        companyPhone: values.companyPhone,
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
      <div>
        <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
          <Building className="h-8 w-8 text-primary" /> Company Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your company's public information and contact details.
        </p>
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
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2" />}
                  Save Changes
                </Button>
              ) : (
                <Button variant="ghost" type="button" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2" /> Edit Profile
                </Button>
              )}
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Logo */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Image
                    src={logoUrl}
                    alt="Company Logo"
                    width={100}
                    height={100}
                    className="rounded-full border-4 border-muted object-cover"
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
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {uploadingImage ? 'Uploading...' : 'Change Logo'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    PNG, JPG or GIF (max. 5MB)
                  </p>
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
