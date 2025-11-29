/*// -------------------------------
//  Developer Reference Notes
// -------------------------------
//
// Project: Hirefy – On-Demand IT Service Platform
// Group: S-Ware 
// Members: Anandjit Kaur, Hassan Mir, Imad Rana, Kishan Patel, Mayur Tirkar
// Folder: find-professionals/page.tsx
//
// Description:
// - Front-end React (TypeScript/TSX) page for the Hirefy Contact section
// - Displays contact form and key contact details (email, office address, phone)
// - Uses reusable UI components: Card, CardContent, and ContactForm
// - Uses lucide-react icons for visual clarity (Mail, MapPin, Phone)
// - Layout: Two-column grid (form on left, contact info on right) with responsive design
//
// Technical Understanding & Research Summary:
// - Learned how Next.js app router maps /app/contact/page.tsx to /contact route
// - Practiced TailwindCSS layout utilities (grid, flex, spacing, responsive breakpoints)
// - Used lucide-react for scalable SVG icons in React components
// - Applied Card and CardContent components to create a clean, boxed form layout
// - Structured semantic JSX with headings, paragraphs, and anchor tags for email/phone links
//
// References / Tutorials:
// • Next.js App Router & Routing: https://nextjs.org/docs/app/building-your-application/routing
// • TailwindCSS Utility Classes: https://tailwindcss.com/docs
// • Lucide Icons Documentation: https://lucide.dev
//
// -------------------------------
// ChatGPT Prompt Used
// -------------------------------
//
// "I need you to add a reference section and detailed comments to my Contact page 
// code for the Hirefy project. Keep the existing layout, components, and logic the same, 
// but include a 'Developer Reference Notes' block at the top (similar to the About page) 
// and make sure the code is well-documented so it’s easy for our group members and 
// instructor to understand."
//
// -------------------------------
// Summary:
// - Language: TypeScript / TSX (React + Next.js)
// - Side: Frontend Page (Client-side)
// - Libraries Used: Next.js, TailwindCSS, lucide-react, custom UI components
// - Purpose: Provide users with a way to contact Hirefy via form, email, address, and phone
// -------------------------------
*/
'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, UserSearch, Mail, MapPin, Briefcase, Search, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface Professional {
  id: string;
  displayName: string;
  email: string;
  role: string;
  skills?: string[];
  location?: string;
  bio?: string;
  experience?: string;
  hourlyRate?: number;
  availability?: string;
  photoURL?: string;
}

export default function FindProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!db || !user) return;

    const fetchProfessionals = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'professional'));
        const snapshot = await getDocs(q);

        const fetchedProfessionals: Professional[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            displayName: data.displayName || data.email?.split('@')[0] || 'Professional',
            email: data.email || '',
            role: data.role || 'professional',
            skills: data.skills || [],
            location: data.location || 'Not specified',
            bio: data.bio || 'No bio available',
            experience: data.experience || 'Not specified',
            hourlyRate: data.hourlyRate || 0,
            availability: data.availability || 'Not specified',
            photoURL: data.photoURL || '',
          };
        });

        setProfessionals(fetchedProfessionals);
        setFilteredProfessionals(fetchedProfessionals);
      } catch (error: any) {
        console.error('Error fetching professionals:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to fetch professionals. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, [db, user, toast]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProfessionals(professionals);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = professionals.filter(pro => 
      pro.displayName.toLowerCase().includes(query) ||
      pro.email.toLowerCase().includes(query) ||
      pro.bio?.toLowerCase().includes(query) ||
      pro.skills?.some(skill => skill.toLowerCase().includes(query)) ||
      pro.location?.toLowerCase().includes(query)
    );

    setFilteredProfessionals(filtered);
  }, [searchQuery, professionals]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleContactProfessional = async (professional: Professional) => {
    if (!user || !userData) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to contact professionals.',
      });
      return;
    }

    try {
      // Create a conversation ID using both user IDs (sorted to ensure consistency)
      const conversationId = [user.uid, professional.id].sort().join('_');
      
      // Create or update the conversation document
      const conversationRef = doc(db, 'conversations', conversationId);
      await setDoc(conversationRef, {
        participants: [user.uid, professional.id],
        participantDetails: {
          [user.uid]: {
            name: user.email?.split('@')[0] || 'Client',
            email: user.email,
            role: 'client',
          },
          [professional.id]: {
            name: professional.displayName,
            email: professional.email,
            role: 'professional',
          }
        },
        lastMessage: '',
        lastMessageTimestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      toast({
        title: 'Success!',
        description: `You can now message ${professional.displayName}`,
      });

      // Redirect to messages page
      router.push('/dashboard/client/message');
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to start conversation. Please try again.',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
          <UserSearch className="h-8 w-8 text-primary" /> Find IT Professionals
        </h1>
        <p className="text-muted-foreground mt-2">
          Browse and connect with talented IT professionals for your projects
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, skills, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredProfessionals.length === 0 
            ? 'No professionals found' 
            : `Showing ${filteredProfessionals.length} professional${filteredProfessionals.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Professionals Grid */}
      {filteredProfessionals.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <UserSearch className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? 'No results found' : 'No professionals available'}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'Check back later for available professionals'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfessionals.map((professional) => (
            <Card key={professional.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={professional.photoURL} alt={professional.displayName} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {getInitials(professional.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{professional.displayName}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {professional.location}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Bio */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {professional.bio}
                </p>

                {/* Skills */}
                {professional.skills && professional.skills.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {professional.skills.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {professional.skills.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{professional.skills.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Experience & Rate */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Experience</p>
                    <p className="text-sm font-medium">{professional.experience}</p>
                  </div>
                  {professional.hourlyRate && professional.hourlyRate > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Hourly Rate</p>
                      <p className="text-sm font-medium">${professional.hourlyRate}/hr</p>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex gap-2">
                <Button 
                  className="flex-1" 
                  size="sm"
                  onClick={() => handleContactProfessional(professional)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contact
                </Button>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
