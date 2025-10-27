import ContactForm from '../components/ContactForm'; // imports the contact form component
import { Card, CardContent } from '../components/ui/card'; // imports Card and CardContent for layout
import { Mail, MapPin, Phone } from 'lucide-react'; // imports icons for mail, location, and phone

export default function ContactPage() { // defines and exports ContactPage component
  return ( // returns the page layout
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)] py-12 md:py-24"> {/* sets background and spacing */}
      <div className="container mx-auto"> {/* centers content in the page */}
        <div className="text-center mb-12"> {/* centers title and adds margin bottom */}
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight"> {/* main heading */}
            Get in Touch {/* title text */}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"> {/* subtitle paragraph */}
            Have a question, a project proposal, or just want to say hello? We'd love to hear from you. {/* description */}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12"> {/* grid with two columns on medium screens */}
            <Card className="shadow-lg"> {/* card for contact form with shadow */}
                <CardContent className="p-8"> {/* padding inside card */}
                    <ContactForm /> {/* renders contact form */}
                </CardContent>
            </Card>
            <div className="flex flex-col justify-center space-y-8"> {/* right side info column */}
                <div className="flex items-start gap-4"> {/* email section layout */}
                    <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full"> {/* circle icon background */}
                        <Mail className="h-6 w-6" /> {/* mail icon */}
                    </div>
                    <div> {/* text content for email */}
                        <h3 className="text-lg font-semibold">Email Us</h3> {/* subheading */}
                        <p className="text-muted-foreground">Our team is here to help.</p> {/* small text */}
                        <a href="mailto:contact@hirefy.ca" className="text-primary hover:underline font-medium">contact@hirefy.ca</a> {/* clickable email */}
                    </div>
                </div>
                <div className="flex items-start gap-4"> {/* office section layout */}
                    <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full"> {/* circle icon background */}
                        <MapPin className="h-6 w-6" /> {/* location icon */}
                    </div>
                    <div> {/* text content for office */}
                        <h3 className="text-lg font-semibold">Our Office</h3> {/* subheading */}
                        <p className="text-muted-foreground">111 Hirefy Ave NW</p> {/* address line 1 */}
                        <p className="text-muted-foreground">Calgary, AB, T2P 1J9</p> {/* address line 2 */}
                    </div>
                </div>
                 <div className="flex items-start gap-4"> {/* phone section layout */}
                    <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full"> {/* circle icon background */}
                        <Phone className="h-6 w-6" /> {/* phone icon */}
                    </div>
                    <div> {/* text content for phone */}
                        <h3 className="text-lg font-semibold">Call Us</h3> {/* subheading */}
                        <p className="text-muted-foreground">Mon-Fri from 9am to 5pm.</p> {/* working hours */}
                         <a href="tel:+1-123-456-7890" className="text-primary hover:underline font-medium">(123) 456-7890</a> {/* clickable phone number */}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
} // 
