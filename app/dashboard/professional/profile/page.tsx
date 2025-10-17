
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Edit, Save, Upload, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, PlusCircle, Trash2, Building, Calendar, Star } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
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

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required.'),
  title: z.string().min(5, 'Professional title is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
  location: z.string().min(3, 'Location is required.'),
  bio: z.string().min(50, 'Biography must be at least 50 characters.'),
  skills: z.string().min(2, 'Please list at least one skill.'),
  hourlyRate: z.coerce.number().min(10, 'Hourly rate must be at least $10.'),
  workExperience: z.array(workExperienceSchema),
  education: z.array(educationSchema),
  certifications: z.string().optional(),
});

// Mock data, in a real app this would come from the AuthContext or a server fetch
const currentProfile = {
    fullName: 'Alex Johnson',
    title: 'Senior Full-Stack Developer',
    email: 'alex.johnson@example.com',
    phone: '(403) 555-0110',
    location: 'Calgary, AB',
    bio: "With over a decade of hands-on experience, I specialize in building robust, scalable web applications from the ground up. My expertise spans the full stack, with a deep focus on creating efficient backend systems with Node.js and seamless user experiences with React and Next.js. I'm passionate about clean code, performance optimization, and collaborating with teams to bring innovative ideas to life. I thrive in agile environments and am dedicated to delivering high-quality software that solves real-world problems.",
    skills: "React, Node.js, TypeScript, Next.js, Firebase, AWS, Docker, CI/CD, PostgreSQL",
    hourlyRate: 95,
    avatar: 'https://placehold.co/150x150.png',
    workExperience: [
        { title: "Senior Software Engineer", company: "Tech Innovations Inc.", startDate: "Jan 2018", endDate: "Present", description: "Led development of a new SaaS platform using React and Node.js, architected and implemented a microservices-based backend, and mentored junior developers." },
        { title: "Full-Stack Developer", company: "Digital Solutions Co.", startDate: "Jun 2015", endDate: "Dec 2017", description: "Developed and maintained full-stack web applications for various clients, focusing on e-commerce and content management systems." },
    ],
    education: [
        { degree: "Bachelor of Science in Computer Science", institution: "University of Calgary", year: "2015" }
    ],
    certifications: "AWS Certified Developer - Associate, Certified Kubernetes Application Developer (CKAD)"
};


export default function ProfessionalProfilePage() {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: currentProfile,
    });
    
    const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({ control: form.control, name: "workExperience" });
    const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control: form.control, name: "education" });

    const onSubmit = async (values: z.infer<typeof profileSchema>) => {
        setLoading(true);
        console.log('Profile updated:', values);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setLoading(false);
        setIsEditing(false);
        toast({
            title: 'Profile Updated!',
            description: 'Your professional profile has been saved successfully.',
        });
    };

    const handleCancel = () => {
        form.reset(currentProfile);
        setIsEditing(false);
    }

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
                    <User className="h-8 w-8 text-primary" /> My Professional Profile
                </h1>
                <p className="text-muted-foreground">This is how clients will see you. Keep it up-to-date to attract the best opportunities.</p>
            </div>
            
            <Form {...form}>
                 <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-start">
                            <div>
                                <CardTitle>Your Public Profile</CardTitle>
                                <CardDescription>Manage your professional information.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                {isEditing && (
                                    <Button variant="ghost" type="button" onClick={handleCancel} disabled={loading}>Cancel</Button>
                                )}
                                {isEditing ? (
                                    <Button type="submit" disabled={loading}>
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2"/>}
                                        Save Profile
                                    </Button>
                                ) : (
                                    <Button variant="outline" type="button" onClick={() => setIsEditing(true)}>
                                        <Edit className="mr-2" />
                                        Edit Profile
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-10">
                            {/* --- PROFILE SUMMARY --- */}
                            <div className="flex flex-col md:flex-row items-start gap-6">
                                <div className="flex flex-col items-center gap-4">
                                    <Image 
                                        src={currentProfile.avatar} 
                                        alt="Profile Avatar" 
                                        width={120} height={120}
                                        data-ai-hint="professional headshot"
                                        className="rounded-full border-4 border-primary/20"
                                    />
                                    {isEditing && (
                                        <Button variant="outline" size="sm" type="button">
                                            <Upload className="mr-2" /> Upload Photo
                                        </Button>
                                    )}
                                </div>
                                <div className="flex-grow space-y-2">
                                    <FormField control={form.control} name="fullName" render={({ field }) => (
                                       <FormItem>
                                           <FormLabel>Full Name</FormLabel>
                                           <FormControl><Input {...field} disabled={!isEditing} placeholder="Your Full Name" className="text-2xl font-bold h-auto p-1 bg-transparent border-0 disabled:text-foreground disabled:cursor-default" /></FormControl>
                                           <FormMessage />
                                       </FormItem>
                                   )} />
                                    <FormField control={form.control} name="title" render={({ field }) => (
                                       <FormItem>
                                           <FormLabel className="sr-only">Title</FormLabel>
                                           <FormControl><Input {...field} disabled={!isEditing} placeholder="e.g., Senior Software Developer" className="text-lg text-primary font-medium h-auto p-1 bg-transparent border-0 disabled:text-primary disabled:cursor-default" /></FormControl>
                                           <FormMessage />
                                       </FormItem>
                                   )} />
                                    <FormField control={form.control} name="bio" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Your Bio</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} disabled={!isEditing} rows={5} placeholder="Tell clients about yourself..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </div>
                            
                            <Separator/>

                             {/* --- CONTACT & SKILLS --- */}
                            <div className="grid md:grid-cols-5 gap-8">
                                <div className="md:col-span-2 space-y-6">
                                     <h3 className="font-semibold text-lg">Contact & Rate</h3>
                                      <FormField control={form.control} name="email" render={({ field }) => (
                                         <FormItem>
                                             <FormLabel className="flex items-center gap-2 text-muted-foreground"><Mail/>Email</FormLabel>
                                             <FormControl><Input {...field} disabled={!isEditing} /></FormControl>
                                             <FormMessage />
                                         </FormItem>
                                     )} />
                                     <FormField control={form.control} name="phone" render={({ field }) => (
                                         <FormItem>
                                             <FormLabel className="flex items-center gap-2 text-muted-foreground"><Phone/>Phone</FormLabel>
                                             <FormControl><Input {...field} disabled={!isEditing} /></FormControl>
                                             <FormMessage />
                                         </FormItem>
                                     )} />
                                     <FormField control={form.control} name="location" render={({ field }) => (
                                         <FormItem>
                                             <FormLabel className="flex items-center gap-2 text-muted-foreground"><MapPin/>Location</FormLabel>
                                             <FormControl><Input {...field} disabled={!isEditing} /></FormControl>
                                             <FormMessage />
                                         </FormItem>
                                     )} />
                                     <FormField control={form.control} name="hourlyRate" render={({ field }) => (
                                         <FormItem>
                                             <FormLabel className="flex items-center gap-2 text-muted-foreground"><Star/>Hourly Rate (CAD)</FormLabel>
                                             <FormControl><Input type="number" {...field} disabled={!isEditing} /></FormControl>
                                             <FormMessage />
                                         </FormItem>
                                     )} />
                                </div>
                                <div className="md:col-span-3">
                                     <h3 className="font-semibold text-lg mb-6">Skills</h3>
                                     <FormField control={form.control} name="skills" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Your skills (comma separated)</FormLabel>
                                            <FormControl>
                                                {isEditing ? (
                                                     <Textarea {...field} disabled={!isEditing} rows={5} placeholder="React, Node.js, Figma..." />
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {field.value.split(',').map(skill => (
                                                            <Badge key={skill.trim()} variant="secondary" className="text-base px-3 py-1">{skill.trim()}</Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </div>

                            <Separator/>

                            {/* --- WORK EXPERIENCE --- */}
                            <div>
                                <h3 className="font-semibold text-lg mb-4">Work Experience</h3>
                                <div className="space-y-6">
                                {workFields.map((field, index) => (
                                    <Card key={field.id} className="p-4 bg-muted/30">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name={`workExperience.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} disabled={!isEditing}/></FormControl><FormMessage/></FormItem>)} />
                                            <FormField control={form.control} name={`workExperience.${index}.company`} render={({ field }) => (<FormItem><FormLabel>Company</FormLabel><FormControl><Input {...field} disabled={!isEditing}/></FormControl><FormMessage/></FormItem>)} />
                                            <FormField control={form.control} name={`workExperience.${index}.startDate`} render={({ field }) => (<FormItem><FormLabel>Start Date</FormLabel><FormControl><Input {...field} disabled={!isEditing} placeholder="e.g., Jan 2020"/></FormControl><FormMessage/></FormItem>)} />
                                            <FormField control={form.control} name={`workExperience.${index}.endDate`} render={({ field }) => (<FormItem><FormLabel>End Date</FormLabel><FormControl><Input {...field} disabled={!isEditing} placeholder="e.g., Present"/></FormControl><FormMessage/></FormItem>)} />
                                            <div className="md:col-span-2">
                                                <FormField control={form.control} name={`workExperience.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} disabled={!isEditing} rows={3}/></FormControl><FormMessage/></FormItem>)} />
                                            </div>
                                        </div>
                                        {isEditing && <Button type="button" variant="destructive" size="sm" onClick={() => removeWork(index)} className="mt-4"><Trash2/> Remove</Button>}
                                    </Card>
                                ))}
                                {isEditing && <Button type="button" variant="outline" onClick={() => appendWork({title: '', company: '', startDate: '', endDate: '', description: ''})}><PlusCircle className="mr-2"/> Add Experience</Button>}
                                </div>
                            </div>

                             <Separator/>

                             {/* --- EDUCATION & CERTIFICATIONS --- */}
                             <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-semibold text-lg mb-4">Education</h3>
                                    <div className="space-y-4">
                                        {eduFields.map((field, index) => (
                                            <Card key={field.id} className="p-4 bg-muted/30">
                                                <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => (<FormItem className="mb-2"><FormLabel>Degree/Program</FormLabel><FormControl><Input {...field} disabled={!isEditing}/></FormControl><FormMessage/></FormItem>)} />
                                                <FormField control={form.control} name={`education.${index}.institution`} render={({ field }) => (<FormItem className="mb-2"><FormLabel>Institution</FormLabel><FormControl><Input {...field} disabled={!isEditing}/></FormControl><FormMessage/></FormItem>)} />
                                                <FormField control={form.control} name={`education.${index}.year`} render={({ field }) => (<FormItem className="mb-2"><FormLabel>Year</FormLabel><FormControl><Input {...field} disabled={!isEditing}/></FormControl><FormMessage/></FormItem>)} />
                                                {isEditing && <Button type="button" variant="destructive" size="sm" onClick={() => removeEdu(index)} className="mt-2"><Trash2/> Remove</Button>}
                                            </Card>
                                        ))}
                                        {isEditing && <Button type="button" variant="outline" onClick={() => appendEdu({degree: '', institution: '', year: ''})}><PlusCircle className="mr-2"/> Add Education</Button>}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-4">Licenses & Certifications</h3>
                                     <FormField control={form.control} name="certifications" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>List your certifications (one per line)</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} disabled={!isEditing} rows={5} />
                                            </FormControl>
                                            {!isEditing && field.value && (
                                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                                    {field.value.split('\n').map(cert => cert.trim() && <li key={cert}>{cert.trim()}</li>)}
                                                </ul>
                                            )}
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
