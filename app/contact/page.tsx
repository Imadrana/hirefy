// -------------------------------
//  Developer Reference Notes
// -------------------------------
//
// Project: Hirefy – On-Demand IT Service Platform
// Group: S-Ware 
// Members: Anandjit Kaur, Hassan Mir, Imad Rana, Kishan Patel, Mayur Tirkar
// Folder: app/contact   File: page.tsx
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

import ContactForm from '../components/ContactForm'; // imports the ContactForm component
import { Card, CardContent } from '../components/ui/card'; // imports Card and CardContent for layout container
import { Mail, MapPin, Phone } from 'lucide-react'; // imports icons for mail, location, and phone

export default function ContactPage() { // defines and exports the ContactPage component
  return ( // returns the JSX layout for the page
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)] py-12 md:py-24"> {/* sets light background and vertical spacing; ensures min height minus navbar */}
      <div className="container mx-auto"> {/* centers content and constrains max width */}
        <div className="text-center mb-12"> {/* centers title section and adds bottom margin */}
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight"> {/* main heading with responsive font sizes */}
            Get in Touch {/* page title text */}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"> {/* subtitle paragraph with muted color and max width */}
            Have a question, a project proposal, or just want to say hello? We'd love to hear from you. {/* short description encouraging contact */}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12"> {/* responsive grid: single column on mobile, two columns on md+ screens */}
          <Card className="shadow-lg"> {/* left column: card container for the contact form with shadow for elevation */}
            <CardContent className="p-8"> {/* card inner padding for comfortable spacing */}
              <ContactForm /> {/* renders the reusable ContactForm component */}
            </CardContent>
          </Card>

          <div className="flex flex-col justify-center space-y-8"> {/* right column: vertical stack of contact info blocks */}
            <div className="flex items-start gap-4"> {/* email section: icon + text side-by-side */}
              <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full"> {/* circular icon background using primary color tint */}
                <Mail className="h-6 w-6" /> {/* mail icon sized to 24px */}
              </div>
              <div> {/* text content for email contact */}
                <h3 className="text-lg font-semibold">Email Us</h3> {/* subsection heading */}
                <p className="text-muted-foreground">Our team is here to help.</p> {/* supporting text */}
                <a
                  href="mailto:contact@hirefy.ca"
                  className="text-primary hover:underline font-medium"
                >
                  contact@hirefy.ca
                </a> {/* clickable email link opens default mail client */}
              </div>
            </div>

            <div className="flex items-start gap-4"> {/* office section: icon + address text */}
              <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full"> {/* circular background for location icon */}
                <MapPin className="h-6 w-6" /> {/* location/pin icon */}
              </div>
              <div> {/* text content for office address */}
                <h3 className="text-lg font-semibold">Our Office</h3> {/* subsection heading */}
                <p className="text-muted-foreground">111 Hirefy Ave NW</p> {/* street address line */}
                <p className="text-muted-foreground">Calgary, AB, T2P 1J9</p> {/* city, province, and postal code */}
              </div>
            </div>

            <div className="flex items-start gap-4"> {/* phone section: icon + phone details */}
              <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full"> {/* circular background for phone icon */}
                <Phone className="h-6 w-6" /> {/* phone icon */}
              </div>
              <div> {/* text content for phone contact */}
                <h3 className="text-lg font-semibold">Call Us</h3> {/* subsection heading */}
                <p className="text-muted-foreground">Mon-Fri from 9am to 5pm.</p> {/* business hours */}
                <a
                  href="tel:+1-123-456-7890"
                  className="text-primary hover:underline font-medium"
                >
                  (123) 456-7890
                </a> {/* clickable phone link for mobile devices */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} // end of ContactPage component
