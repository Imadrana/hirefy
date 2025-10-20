export interface User {
  uid: string;
  email: string;
  role: 'client' | 'professional' | 'admin';
  profile?: ClientProfile | ProfessionalProfile;
  createdAt: string;
}

export interface ClientProfile {
  companyName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  businessType: string;
  companyDescription: string;
}

export interface ProfessionalProfile {
  fullName: string;
  title: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  location: string;
  workExperience: WorkExperience[];
  education: Education[];
  certifications?: string[];
}

export interface Job {
  id: string;
  clientId: string;
  title: string;
  description: string;
  skills: string[];
  budget: number;
  duration: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Closed';
  datePosted: string;
}

export interface Proposal {
  id: string;
  jobId: string;
  professionalId: string;
  coverLetter: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}