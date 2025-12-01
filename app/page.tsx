import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { ArrowRight, Briefcase, Users, Zap } from 'lucide-react';
import Link from 'next/link';
 
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="flex flex-col items-center text-center p-4">
    <div className="mb-4 text-primary bg-primary/10 p-3 rounded-full">
      {icon}
    </div>
    <h3 className="font-bold text-lg mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);
 
 
export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background">
      <section className="flex-grow flex items-center justify-center text-center p-8 bg-grid-pattern">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <h1 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tight text-foreground">
              Connecting Calgary's IT Talent with Opportunity.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl">
              Hirefy is the premier on-demand platform for sourcing elite IT professionals in Calgary. Find the right expert for your project, right when you need them.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="font-bold text-lg group">
                <Link href="/register">Get Started <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold text-lg">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
      </section>
 
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Why Hirefy?</h2>
            <p className="text-muted-foreground mt-2">The features that make hiring and working seamless.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap size={28} />}
              title="Fast Connections"
              description="Quickly post jobs and find qualified local IT professionals ready to start."
            />
            <FeatureCard
              icon={<Briefcase size={28} />}
              title="Vetted Professionals"
              description="Access a curated network of skilled IT experts with detailed profiles and work history."
            />
            <FeatureCard
              icon={<Users size={28} />}
              title="Direct Communication"
              description="Collaborate seamlessly with built-in messaging and project management tools."
            />
          </div>
        </div>
      </section>
 
       <footer className="bg-card/50 border-t">
        <div className="container mx-auto py-6 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Hirefy Inc. All rights reserved. Proudly Canadian.</p>
        </div>
      </footer>
    </div>
  );
}