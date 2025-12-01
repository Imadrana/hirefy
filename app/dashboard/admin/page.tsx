/*Create a simple Next.js 14 page component at /app/dashboard/admin/page.tsx using Tailwind CSS and UI components from @/components/ui/card. Import Card, CardHeader, CardTitle, and CardContent, and use the UserCog icon from lucide-react.

The page should display a centered admin dashboard card inside a responsive container (mx-auto p-4 md:p-8). The card header should show the UserCog icon next to the title “Admin Dashboard” with a bold, clean font style (font-headline).

Inside the card content, include a short description:
“Welcome to the admin dashboard. Here you can manage users, projects, and site settings.”

Keep the design minimal, professional, and aligned with the overall dashboard theme.*/
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <UserCog className="text-primary" /> Admin Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Welcome to the admin dashboard. Here you can manage users, projects, and site settings.</p>
        </CardContent>
      </Card>
    </div>
  );
}
