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
