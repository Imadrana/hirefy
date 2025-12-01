// -------------------------------
//  Developer Reference Notes
// -------------------------------
//
// Project: Hirefy – On-Demand IT Service Platform
// Group: S-Ware 
// Members: Anandjit Kaur, Hassan Mir, Imad Rana, Kishan Patel, Mayur Tirkar
// Folder: app/about   File: page.tsx
//
// Description:
// - Front-end React (TypeScript/TSX) page for the Hirefy About section
// - Displays company story, mission, and core values
// - Uses reusable UI components: Button, Card, and ValueCard
// - Includes responsive design using TailwindCSS utilities
// - Sections: Hero, Story (with image), Core Values, and CTA
//
// Technical Understanding & Research Summary:
// - Learned about Next.js pages structure and how files in /app folder map to routes
// - Studied TailwindCSS grid, spacing, and responsive design techniques
// - Used lucide-react for SVG icons (Building, Heart, Target, etc.)
// - Implemented reusable subcomponent (ValueCard) to avoid code duplication
// - Used Next.js Image for optimized rendering of images
//
// References / Tutorials:
// • Next.js Pages Routing: https://nextjs.org/docs/app/building-your-application/routing
// • TailwindCSS Utilities: https://tailwindcss.com/docs
// • Lucide Icons: https://lucide.dev
//
// -------------------------------
// ChatGPT Prompt Used
// -------------------------------
//
// "I need you to create an AboutPage for my Hirefy web application. 
// The page should include a hero section, a story section with text and an image, 
// a core values section using reusable value cards with icons, 
// and a call-to-action with a button. Use Next.js with TypeScript/TSX, 
// TailwindCSS for styling, and import UI components like Card and Button. 
// The layout should be fully responsive and visually engaging."
//
// -------------------------------
// Summary:
// - Language: TypeScript / TSX (React + Next.js)
// - Side: Frontend Page (Client-side)
// - Libraries Used: Next.js, TailwindCSS, lucide-react
// - Purpose: Display About content for Hirefy with story, values, and CTA
// -------------------------------
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Building, Target, Users, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const ValueCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="flex flex-col items-center text-center p-4">
    <div className="mb-4 text-primary bg-primary/10 p-3 rounded-full">
      {icon}
    </div>
    <h3 className="font-bold text-lg mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground">
      <section className="py-20 md:py-32 bg-grid-pattern">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tight">
            We're building the future of work in Canada.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Hirefy is more than just a platform; it's a community dedicated to empowering IT professionals and connecting businesses with the talent they need to succeed, starting right here in Calgary.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-in fade-in-0 slide-in-from-left-12 duration-500">
              <h2 className="text-3xl font-headline font-bold mb-4">Our Story</h2>
              <p className="text-muted-foreground mb-4">
                Founded in Calgary, Hirefy was born from a simple observation: a wealth of incredible IT talent was disconnected from the businesses that needed them most. We saw an opportunity to bridge this gap, creating a localized, on-demand marketplace that fosters community, trust, and mutual success.
              </p>
              <p className="text-muted-foreground">
                Our journey started with a focus on our city, with a vision to expand nationwide. We believe in the power of local expertise and are committed to building a robust, proudly Canadian network of IT professionals and clients.
              </p>
            </div>
            <div className="animate-in fade-in-0 slide-in-from-right-12 duration-500">
              <Image 
                src="https://placehold.co/600x400.png"
                alt="Our Team"
                width={600}
                height={400}
                data-ai-hint="team collaboration"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 md:py-24 bg-card/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Our Core Values</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">These principles guide every decision we make and every feature we build.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard 
              icon={<Building size={28} />}
              title="Community First"
              description="We prioritize the growth and success of our local Calgary tech community."
            />
            <ValueCard 
              icon={<Heart size={28} />}
              title="Built on Trust"
              description="Transparency, reliability, and integrity are the cornerstones of our platform."
            />
            <ValueCard 
              icon={<Target size={28} />}
              title="Empowering People"
              description="We provide the tools and opportunities for professionals and clients to achieve their goals."
            />
          </div>
        </div>
      </section>

      <section className="py-20 text-center">
        <div className="container mx-auto">
           <h2 className="text-3xl md:text-4xl font-headline font-bold">Join the Hirefy Network</h2>
           <p className="text-muted-foreground mt-2 mb-8 max-w-2xl mx-auto">Whether you're looking for your next project or the perfect talent, your journey starts here.</p>
           <Button asChild size="lg" className="font-bold">
            <Link href="/register">Get Started Today</Link>
           </Button>
        </div>
      </section>
    </div>
  );
}
