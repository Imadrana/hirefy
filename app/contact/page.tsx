import ContactForm from '../components/ContactForm';
import { Card, CardContent } from '../components/ui/card';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)] py-12 md:py-24">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight">
            Get in Touch
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a question, a project proposal, or just want to say hello? We'd love to hear from you.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12">
            <Card className="shadow-lg">
                <CardContent className="p-8">
                    <ContactForm />
                </CardContent>
            </Card>
            <div className="flex flex-col justify-center space-y-8">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full">
                        <Mail className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Email Us</h3>
                        <p className="text-muted-foreground">Our team is here to help.</p>
                        <a href="mailto:contact@hirefy.ca" className="text-primary hover:underline font-medium">contact@hirefy.ca</a>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full">
                        <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Our Office</h3>
                        <p className="text-muted-foreground">111 Hirefy Ave NW</p>
                        <p className="text-muted-foreground">Calgary, AB, T2P 1J9</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full">
                        <Phone className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Call Us</h3>
                        <p className="text-muted-foreground">Mon-Fri from 9am to 5pm.</p>
                         <a href="tel:+1-123-456-7890" className="text-primary hover:underline font-medium">(123) 456-7890</a>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}