'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase/firebase';
import { Loader2, PlusCircle, Trash2, User, Briefcase, GraduationCap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '@/components/ui/separator';

const workExperienceSchema = z.object({
  title: z.string().min(2, "Job title is required."),
  company: z.string().min(2, "Company name is required."),
  startDate: z.string().min(4, "Start date is required."),
  endDate: z.string().min(4, "End date is required (or 'Present')."),
  description: z.string().min(20, "Description must be at least 20 characters."),
});

const educationSchema = z.object({
  degree: z.string().min(2, "Degree/Program is required."),
  institution: z.string().min(2, "Institution name is required."),
  year: z.string().min(4, "Graduation year is required."),
});

const formSchema = z.object({
  fullName: z.string().min(2, 'Full name is required.'),
  title: z.string().min(5, 'Professional title is required.'),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
  location: z.string().min(3, 'Location is required.'),
  bio: z.string().min(50, 'Biography must be at least 50 characters.'),
  skills: z.string().min(2, 'Please list at least one skill.'),
  hourlyRate: z.coerce.number().min(10, 'Hourly rate must be at least $10.'),
  workExperience: z.array(workExperienceSchema).min(1, 'Please add at least one work experience.'),
  education: z.array(educationSchema).min(1, 'Please add at least one education entry.'),
  certifications: z.string().optional(),
});

export default function ProfessionalDetailsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  // Guard route: redirect if no user
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        variant: 'destructive',
        title: 'Unauthorized',
        description: 'You must be logged in to complete your profile.',
      });
      router.push('/login');
    }
  }, [user, authLoading, router, toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      title: '',
      phone: '',
      location: '',
      bio: '',
      skills: '',
      hourlyRate: 50,
      workExperience: [{ title: '', company: '', startDate: '', endDate: '', description: '' }],
      education: [{ degree: '', institution: '', year: '' }],
      certifications: '',
    },
  });

  const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({ 
    control: form.control, 
    name: "workExperience" 
  });
  
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ 
    control: form.control, 
    name: "education" 
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'No user is signed in.' });
      return;
    }
    
    setLoading(true);
    try {
      const profileRef = doc(db, 'users', user.uid);
      
      // Convert skills string to array and certifications to array
      const skillsArray = values.skills.split(',').map(s => s.trim()).filter(Boolean);
      const certificationsArray = values.certifications 
        ? values.certifications.split('\n').map(c => c.trim()).filter(Boolean)
        : [];

      const profileData = {
        name: values.fullName,
        fullName: values.fullName,
        title: values.title,
        email: user.email,
        phone: values.phone,
        location: values.location,
        bio: values.bio,
        skills: skillsArray,
        hourlyRate: values.hourlyRate,
        workExperience: values.workExperience,
        education: values.education,
        certifications: certificationsArray,
        updatedAt: new Date().toISOString(),
        role: 'professional',
      };

      // Check if document exists
      const docSnap = await getDoc(profileRef);
      if (docSnap.exists()) {
        await setDoc(profileRef, profileData, { merge: true });
      } else {
        await setDoc(profileRef, {
          ...profileData,
          createdAt: new Date().toISOString(),
        });
      }

      toast({
        title: 'Profile Complete!',
        description: "Welcome to Hirefy! We're redirecting you to your dashboard.",
      });
      
      router.push('/dashboard/professional');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50 p-4 py-12">
      <Card className="w-full max-w-4xl shadow-lg animate-in fade-in-80">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            Complete Your Professional Profile
          </CardTitle>
          <CardDescription>
            Tell us about yourself so clients can find and hire you for their projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Senior Software Developer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (403) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location *</FormLabel>
                        <FormControl>
                          <Input placeholder="Calgary, AB" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate (CAD) *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Bio *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell clients about your experience, expertise, and what makes you unique..." 
                          {...field} 
                          rows={4} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills (comma separated) *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="React, Node.js, Python, AWS, Docker, PostgreSQL..." 
                          {...field} 
                          rows={3} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Work Experience */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Work Experience *
                </h3>
                
                <div className="space-y-4">
                  {workFields.map((field, index) => (
                    <Card key={field.id} className="p-4 bg-muted/30">
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`workExperience.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Job Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Software Engineer" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`workExperience.${index}.company`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company</FormLabel>
                                <FormControl>
                                  <Input placeholder="Tech Corp Inc." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`workExperience.${index}.startDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                  <Input placeholder="Jan 2020" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`workExperience.${index}.endDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                  <Input placeholder="Present" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`workExperience.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe your responsibilities and achievements..." 
                                  {...field} 
                                  rows={3} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {workFields.length > 1 && (
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => removeWork(index)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Remove
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => appendWork({ title: '', company: '', startDate: '', endDate: '', description: '' })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Work Experience
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Education */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education *
                </h3>
                
                <div className="space-y-4">
                  {eduFields.map((field, index) => (
                    <Card key={field.id} className="p-4 bg-muted/30">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name={`education.${index}.degree`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Degree/Program</FormLabel>
                              <FormControl>
                                <Input placeholder="Bachelor of Computer Science" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`education.${index}.institution`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Institution</FormLabel>
                                <FormControl>
                                  <Input placeholder="University of Calgary" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`education.${index}.year`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Graduation Year</FormLabel>
                                <FormControl>
                                  <Input placeholder="2020" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {eduFields.length > 1 && (
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => removeEdu(index)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Remove
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => appendEdu({ degree: '', institution: '', year: '' })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Education
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Certifications (Optional) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Licenses & Certifications (Optional)</h3>
                
                <FormField
                  control={form.control}
                  name="certifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>List your certifications (one per line)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="AWS Certified Solutions Architect&#10;Google Cloud Professional&#10;CompTIA Security+" 
                          {...field} 
                          rows={4} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full font-bold" disabled={loading || authLoading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Profile & Go to Dashboard
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
