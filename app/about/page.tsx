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
import { Building, Target, Users, Heart, Sparkles, Rocket, Shield, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const ValueCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/50">
    <CardContent className="flex flex-col items-center text-center p-6">
      <div className="mb-4 text-primary bg-gradient-to-br from-primary/20 to-primary/5 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-3 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground overflow-hidden">
      {/* Hero Section with Gradient Background */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-500">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Building Canada's Tech Future</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-in fade-in-0 slide-in-from-bottom-6 duration-700">
            We're building the future of work in Canada.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-in fade-in-0 slide-in-from-bottom-8 duration-1000">
            Hirefy is more than just a platform; it's a <span className="text-primary font-semibold">community</span> dedicated to empowering IT professionals and connecting businesses with the talent they need to succeed, starting right here in <span className="text-primary font-semibold">Calgary</span>.
          </p>
          <div className="mt-8 flex gap-4 justify-center animate-in fade-in-0 slide-in-from-bottom-10 duration-1000">
            <Button asChild size="lg" className="font-bold shadow-lg hover:shadow-xl transition-all">
              <Link href="/register">Get Started <Rocket className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-bold shadow-md hover:shadow-lg transition-all">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Our Story Section with Enhanced Design */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="animate-in fade-in-0 slide-in-from-left-12 duration-500">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-4">
                <Building className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Our Journey</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-headline font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Our Story
              </h2>
              <div className="space-y-4">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Founded in <span className="text-primary font-semibold">Calgary</span>, Hirefy was born from a simple observation: a wealth of incredible IT talent was disconnected from the businesses that needed them most. We saw an opportunity to bridge this gap, creating a localized, on-demand marketplace that fosters community, trust, and mutual success.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Our journey started with a focus on our city, with a vision to expand nationwide. We believe in the power of local expertise and are committed to building a robust, proudly Canadian network of IT professionals and clients.
                </p>
              </div>
              <div className="mt-8 flex gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Professionals</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">200+</div>
                  <div className="text-sm text-muted-foreground">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">98%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction</div>
                </div>
              </div>
            </div>
            <div className="animate-in fade-in-0 slide-in-from-right-12 duration-500 relative">
              {/* Main Image with Decorative Elements */}
              <div className="relative max-w-md mx-auto">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-2xl"></div>
                <div className="relative">
                  <Image 
                    src="/calgary-tech.png"
                    alt="Calgary Tower with Technology Stack"
                    width={400}
                    height={300}
                    className="rounded-2xl shadow-2xl w-full border-4 border-white/10 relative z-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Core Values Section with Cards */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-card/30 to-background relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-4">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">What Drives Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-headline font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Our Core Values
            </h2>
            <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
              These principles guide every decision we make and every feature we build.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <ValueCard 
              icon={<Building size={32} />}
              title="Community First"
              description="We prioritize the growth and success of our local Calgary tech community, fostering connections and opportunities."
            />
            <ValueCard 
              icon={<Heart size={32} />}
              title="Built on Trust"
              description="Transparency, reliability, and integrity are the cornerstones of our platform and relationships."
            />
            <ValueCard 
              icon={<Target size={32} />}
              title="Empowering People"
              description="We provide the tools and opportunities for professionals and clients to achieve their ambitious goals."
            />
          </div>
        </div>
      </section>

      {/* CTA Section with Gradient */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-purple-500/20"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <Zap className="h-16 w-16 text-primary mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Join the Hirefy Network
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Whether you're looking for your next exciting project or the perfect talent to bring your vision to life, your journey starts here.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild size="lg" className="font-bold text-lg px-8 py-6 shadow-2xl hover:shadow-primary/50 hover:scale-105 transition-all">
                <Link href="/register">
                  Get Started Today <Rocket className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-bold text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                <Link href="/contact">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
