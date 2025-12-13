// ---------------------------------------------
// Developer Reference Notes
// ---------------------------------------------
//
// Project: Hirefy – On-Demand IT Service Platform
// Group: S-Ware
// Members: Hassan Mir, Imad Rana, Kishan Patel, Mayur Tirkar, Anandjit Kaur
// File: app/manage-jobs/page.tsx
//
// What this page is for:
// This page is basically the professional’s “My Jobs” dashboard. It shows the jobs I’ve been hired for
// after a client accepts my proposal. Instead of showing every proposal, it focuses on the accepted ones,
// so it feels like a real “active work” section.
//
// How it works (high level):
// - First, it listens to the `proposals` collection in Firestore for the logged-in professional.
// - Then, it filters down to only proposals with status = "accepted".
// - For each accepted proposal, it pulls extra details from the related `jobs` doc and the client’s `users` doc,
//   so the UI can display the job title, client name, skills, budget, duration, and my proposed rate.
// - The job card gives a quick summary, and the dialog shows the full details + my original cover letter.
//
// What I learned while building it:
// - I got more comfortable doing “chained” Firestore lookups (proposal → job → client) without breaking the UI.
// - I practiced using onSnapshot for real-time updates, and still keeping things clean with loading/empty states.
// - I added a simple getTimeAgo() helper so the page shows when a job was accepted in a more natural way.
// - I tried to make the page feel polished with shadcn/ui Cards/Badges + a Details dialog instead of dumping text.
// - I also made sure the “no jobs yet” state looks friendly and doesn’t feel like an error.
//
// References I used while working on this:
// • Firestore queries + where filters: https://firebase.google.com/docs/firestore/query-data/queries
// • Reading documents with getDoc(): https://firebase.google.com/docs/firestore/query-data/get-data
// • Firestore real-time listeners (onSnapshot): https://firebase.google.com/docs/firestore/query-data/listen
// • shadcn/ui components: https://ui.shadcn.com
// • TailwindCSS utilities (spacing/layout/responsive): https://tailwindcss.com/docs
// • lucide-react icons: https://lucide.dev/icons
//
// Notes:
// The main goal here was to keep the data accurate and easy to scan, while still making the “details” view
// available when the professional actually needs to review the job or their proposal.
'use client'; // Next.js directive: this component runs on the client side

import { useEffect, useState } from "react"; // React hooks for state and side effects
import { db } from "@/lib/firebase/firebase"; // Firestore database instance
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore"; // Firestore helpers for querying and listening
import { useAuth } from "@/context/AuthContext"; // Custom hook to access authenticated user
import { Card, CardContent } from "@/components/ui/card"; // UI card components
import { Badge } from "@/components/ui/badge"; // UI badge component
import { Button } from "@/components/ui/button"; // UI button component
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Dialog/modal components
import { Briefcase, Loader2, Eye, DollarSign, Clock, User, FileText } from "lucide-react"; // Icon components from lucide-react
import { useToast } from "@/hooks/use-toast"; // Custom hook to show toast notifications

interface AcceptedJob { // Type definition for an accepted job record
  id: string; // Firestore document ID
  proposalId: string; // ID of the proposal document
  jobId: string; // ID of the related job
  jobTitle: string; // Title of the job
  clientId: string; // User ID of the client
  clientName?: string; // Optional: client's display name
  clientEmail?: string; // Optional: client's email
  proposedRate: number; // Rate offered by the professional
  coverLetter: string; // Cover letter text from the proposal
  jobDescription?: string; // Optional: detailed job description
  jobBudget?: number; // Optional: client's budget for the job
  jobDuration?: string; // Optional: expected duration of the job
  jobSkills?: string[]; // Optional: list of required skills
  acceptedAt: any; // Timestamp when proposal was accepted (Firestore type)
}

const statusVariant = { // Mapping from job status string to badge variant
  'accepted': 'secondary' as const, // Accepted jobs will use the "secondary" badge style
};

export default function ManageJobsPage() { // Main React component for managing jobs
  const [jobs, setJobs] = useState<AcceptedJob[]>([]); // State: list of accepted jobs
  const [loading, setLoading] = useState(true); // State: whether data is still loading
  const [selectedJob, setSelectedJob] = useState<AcceptedJob | null>(null); // State: job currently selected in dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false); // State: whether the view-details dialog is open

  const { user } = useAuth(); // Get currently logged-in user from auth context
  const { toast } = useToast(); // Toast function to show error/info messages

  useEffect(() => { // Effect to subscribe to accepted jobs when user changes
    if (!user) return; // If no user is logged in, do nothing

    // Query proposals where professionalId matches current user (respects Firestore rules)
    const proposalsCollection = collection(db, 'proposals'); // Reference to "proposals" collection
    const proposalsQuery = query( // Build Firestore query
      proposalsCollection, // From the proposals collection
      where('professionalId', '==', user.uid) // Only proposals for this professional
    );

    const unsubscribe = onSnapshot( // Real-time listener on the proposals query
      proposalsQuery, // Listen to the filtered proposals
      async (snapshot) => { // Callback when snapshot updates
        // Filter for accepted proposals client-side
        const relevantDocs = snapshot.docs.filter(doc => { // Keep only docs where status is accepted
          const data = doc.data(); // Get document data
          return data.status === 'accepted'; // Check proposal status
        });

        console.log('✅ Found', relevantDocs.length, 'accepted proposals for professional'); // Debug log to console
        
        const jobsData: AcceptedJob[] = []; // Temporary array to build list of accepted jobs

        for (const docSnap of relevantDocs) { // Loop through each accepted proposal document
          const proposalData = docSnap.data(); // Get proposal data
          
          // Fetch job details
          try {
            const jobDoc = await getDoc(doc(db, 'jobs', proposalData.jobId)); // Load related job document
            let jobDetails: any = {}; // Default empty job details
            if (jobDoc.exists()) { // Check if job document exists
              jobDetails = jobDoc.data(); // Use job data from Firestore
            }

            // Fetch client details
            const clientDoc = await getDoc(doc(db, 'users', proposalData.clientId)); // Load client user document
            let clientName = proposalData.clientId; // Default client name as ID
            let clientEmail = ''; // Default empty email
            if (clientDoc.exists()) { // If client document exists
              const clientData = clientDoc.data(); // Get client data
              clientName = clientData.name || clientData.email; // Prefer name, fall back to email
              clientEmail = clientData.email; // Store client email
            }

            jobsData.push({ // Push a new AcceptedJob object into jobsData array
              id: docSnap.id, // Use proposal document ID as job ID for this list
              proposalId: docSnap.id, // Store proposal ID
              jobId: proposalData.jobId, // Reference to job document ID
              jobTitle: proposalData.jobTitle || jobDetails.title, // Use proposal title or job title
              clientId: proposalData.clientId, // Client user ID
              clientName, // Resolved client name
              clientEmail, // Resolved client email
              proposedRate: proposalData.proposedRate, // Professional's proposed rate
              coverLetter: proposalData.coverLetter, // Stored cover letter text
              jobDescription: jobDetails.description, // Job description from job document
              jobBudget: jobDetails.budget, // Job budget from job document
              jobDuration: jobDetails.duration, // Estimated job duration
              jobSkills: jobDetails.skills, // Required skills array
              acceptedAt: proposalData.updatedAt || proposalData.createdAt, // Use last update or creation time
            });
          } catch (error) { // Catch any errors in fetching job/client data
            console.error('Error fetching job/client details:', error); // Log error to console
          }
        }

        // Sort by accepted date
        jobsData.sort((a, b) => { // Sort jobs so most recently accepted appear first
          const aTime = a.acceptedAt?.toDate?.() || new Date(0); // Convert acceptedAt to Date with fallback
          const bTime = b.acceptedAt?.toDate?.() || new Date(0); // Same for second job
          return bTime.getTime() - aTime.getTime(); // Newest first
        });

        setJobs(jobsData); // Save processed jobs into state
        setLoading(false); // Mark loading as finished
      },
      (error) => { // Error callback for onSnapshot
        console.error('Error fetching accepted jobs:', error); // Log error for debugging
        toast({ // Show toast notification for failure
          variant: 'destructive', // Use error style
          title: 'Error', // Toast title
          description: 'Failed to load your jobs.', // Toast message
        });
        setLoading(false); // Stop loading state even on error
      }
    );

    return () => unsubscribe(); // Cleanup: unsubscribe from snapshot listener on unmount
  }, [user, toast]); // Re-run effect when user or toast function changes

  const handleViewJob = (job: AcceptedJob) => { // Handler when "View Details" is clicked
    setSelectedJob(job); // Store selected job in state
    setViewDialogOpen(true); // Open the details dialog
  };

  const getTimeAgo = (timestamp: any): string => { // Utility function to show "time ago" text
    if (!timestamp) return 'Recently'; // Fallback if no timestamp
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp); // Normalize Firestore or JS date
    const now = new Date(); // Current time
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000); // Difference in seconds
    
    if (seconds < 60) return 'Just now'; // Less than a minute ago
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`; // Less than an hour
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`; // Less than a day
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`; // Less than a week
    return `${Math.floor(seconds / 604800)} weeks ago`; // One week or more
  };

  return ( // JSX returned by the component
    // Outer page container
    <div className="space-y-6">
      {/* Header section */}
      <div>
        {/* Page title with briefcase icon */}
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Briefcase className="h-8 w-8 text-primary" /> My Jobs
        </h1>
        {/* Subtitle text */}
        <p className="text-muted-foreground mt-1">
          Jobs you've been hired for
        </p>
      </div>

      {/* Jobs List area */}
      {loading ? ( // If still loading, show spinner
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading your jobs...</span>
        </div>
      ) : jobs.length === 0 ? ( // If no jobs, show empty state
        <Card>
          <CardContent className="text-center py-12">
            {/* Empty-state icon */}
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-6">
                <Briefcase className="h-12 w-12 text-primary" />
              </div>
            </div>
            {/* Empty-state title */}
            <h3 className="text-xl font-semibold mb-2">No active jobs yet</h3>
            {/* Empty-state description */}
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              When clients accept your proposals, they'll appear here.
            </p>
          </CardContent>
        </Card>
      ) : ( // If there are jobs, show list
        <div className="grid gap-4">
          {jobs.map((job) => ( // Loop over each accepted job
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* Card content layout */}
                <div className="flex items-start justify-between gap-4">
                  {/* Left Section with job info */}
                  <div className="flex-1 min-w-0">
                    {/* Job icon and basic details */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="rounded-lg bg-primary/10 p-2.5 mt-0.5">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Job title */}
                        <h3 className="text-lg font-semibold mb-1">{job.jobTitle}</h3>
                        {/* Client name/email row */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <User className="h-4 w-4" />
                          <span>{job.clientName || job.clientEmail}</span>
                        </div>
                        
                        {/* Short job description preview */}
                        {job.jobDescription && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {job.jobDescription}
                          </p>
                        )}

                        {/* Skills list */}
                        {job.jobSkills && job.jobSkills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {job.jobSkills.slice(0, 4).map((skill, index) => ( // Show first 4 skills
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {job.jobSkills.length > 4 && ( // If more skills, show "+X more"
                              <Badge variant="outline" className="text-xs">
                                +{job.jobSkills.length - 4} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Job Meta Info row */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      {/* Proposed rate display */}
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-foreground">${job.proposedRate.toLocaleString()}</span>
                        <span>Your Rate</span>
                      </div>
                      {/* Job duration display */}
                      {job.jobDuration && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>{job.jobDuration}</span>
                        </div>
                      )}
                      {/* Accepted time display */}
                      <div className="flex items-center gap-1.5">
                        <span>Accepted {getTimeAgo(job.acceptedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section with status and actions */}
                  <div className="flex flex-col items-end gap-3">
                    {/* Accepted status badge */}
                    <Badge variant={statusVariant.accepted}>
                      Accepted
                    </Badge>
                    {/* View details button */}
                    <Button size="sm" onClick={() => handleViewJob(job)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Job Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            {/* Dialog title with job title */}
            <DialogTitle className="text-2xl">{selectedJob?.jobTitle}</DialogTitle>
            {/* Dialog subtitle */}
            <DialogDescription className="text-base">
              Job details and your proposal
            </DialogDescription>
          </DialogHeader>

          {selectedJob && ( // Only render details if a job is selected
            <div className="space-y-6 mt-2">
              {/* Client Info section */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Client
                </h3>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-semibold">{selectedJob.clientName || selectedJob.clientEmail}</span>
                </div>
              </div>

              {/* Job Description section */}
              {selectedJob.jobDescription && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Job Description
                  </h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedJob.jobDescription}
                  </p>
                </div>
              )}

              {/* Key Details cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* Your rate card */}
                <div className="border rounded-lg p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Your Rate
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${selectedJob.proposedRate.toLocaleString()}
                  </div>
                </div>
                {/* Client budget card */}
                <div className="border rounded-lg p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Client Budget
                  </div>
                  <div className="text-2xl font-bold">
                    ${selectedJob.jobBudget?.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Duration section */}
              {selectedJob.jobDuration && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Duration
                  </h3>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{selectedJob.jobDuration}</span>
                  </div>
                </div>
              )}

              {/* Skills section */}
              {selectedJob.jobSkills && selectedJob.jobSkills.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.jobSkills.map((skill, index) => ( // List all required skills
                      <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Your Proposal section */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Your Proposal
                </h3>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedJob.coverLetter}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {/* Close dialog button */}
            <Button onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
