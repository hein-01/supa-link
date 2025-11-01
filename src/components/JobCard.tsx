import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface JobCardProps {
  id: string;
  businessName: string;
  jobTitle: string;
  salaryAmount: string;
  salaryType: string;
  jobLocation: string;
  jobType: string;
  educationRequirement: string;
  ageMin: number | null;
  ageMax: number | null;
  benefits: string[] | null;
  applicationDeadline: string;
  description: string;
  contactNumber: string;
}

export const JobCard = ({
  id,
  businessName,
  jobTitle,
  salaryAmount,
  salaryType,
  jobLocation,
  jobType,
  educationRequirement,
  ageMin,
  ageMax,
  benefits,
  applicationDeadline,
  description,
  contactNumber,
}: JobCardProps) => {
  const [showDescription, setShowDescription] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const { toast } = useToast();

  const handleApply = () => {
    const viberLink = `viber://chat?url=viber://call&uri=viber://call/chat?number=+95${contactNumber.replace(/\+/g, '')}`;
    window.open(viberLink, '_blank');
  };

  const handleReport = () => {
    setShowReport(true);
  };

  const submitReport = async () => {
    try {
      if (!reportReason.trim()) {
        toast({
          title: "Reason required",
          description: "Please enter a reason for your report.",
          variant: "destructive",
        });
        return;
      }
      setSubmittingReport(true);
      const { error } = await supabase
        .from("job_reports")
        .insert({ reason: reportReason.trim(), job_post_id: id });
      if (error) throw error;
      toast({
        title: "Report submitted",
        description: "Thanks for helping us keep listings safe.",
      });
      setReportReason("");
      setShowReport(false);
    } catch (err) {
      console.error("Error submitting report", err);
      const anyErr = err as any;
      const desc = anyErr?.message || anyErr?.error_description || anyErr?.hint || anyErr?.details || "We couldn't submit your report. Please try again.";
      toast({
        title: "Submission failed",
        description: desc,
        variant: "destructive",
      });
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <>
  <div className="bg-card border border-border px-6 pb-6 pt-4 shadow-sm relative h-full flex flex-col">
        {/* Report Button */}
        <Button
          variant="destructive"
          onClick={handleReport}
          className="absolute top-0 right-0 text-[10px] px-2 py-1 h-auto leading-none rounded-none"
        >
          REPORT THIS JOB
        </Button>

        {/* Body (grows to push footer down) */}
        <div className="flex-grow">
          {/* Header */}
          <div className="mb-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase mb-1">{businessName}</p>
              <h3 className="text-2xl font-bold text-foreground mb-2">{jobTitle}</h3>
              <p className="text-base font-semibold text-[hsl(var(--primary))]">
                MMK {salaryAmount} <span className="text-muted-foreground">({salaryType})</span>
              </p>
            </div>
          </div>

          {/* Info Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary" className="bg-muted text-muted-foreground rounded-none">
              {jobLocation}
            </Badge>
            <Badge variant="secondary" className="bg-muted text-muted-foreground rounded-none">
              {jobType}
            </Badge>
            <Badge variant="secondary" className="bg-muted text-muted-foreground rounded-none">
              {educationRequirement}
            </Badge>
          </div>

          {/* Age Range */}
          {(ageMin || ageMax) && (
            <p className="text-xs text-muted-foreground mb-2">
              Age: {ageMin} - {ageMax}
            </p>
          )}

          {/* Benefits (comma-separated; allow wrapping to avoid overflow) */}
          {benefits && benefits.length > 0 && (
            <div className="mb-3">
              <p className="text-[13px] text-[#4da7a6] whitespace-normal break-words">
                {benefits.join(", ")}
              </p>
            </div>
          )}

          {/* Deadline and Description Button */}
          <div className="flex items-center gap-4 mb-2 w-full justify-between">
            <Button
              variant="default"
              onClick={() => setShowDescription(true)}
              className="bg-foreground text-background rounded-none text-xs h-8 px-3 py-1 leading-none border border-transparent hover:bg-white hover:text-black hover:border-black"
            >
              SEE JOB DESCRIPTION
            </Button>
            <p className="text-sm text-muted-foreground ml-auto">
              Deadline: {new Date(applicationDeadline).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Apply Section (light lavender background with button on the right) */}
  <div className="bg-[#f3edfb] text-foreground p-4 -mx-6 -mb-6 mt-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-[#64748b] m-0 flex-1 break-words">
              When ready to apply, please click the button to open the chat with this job poster on Viber.
              Send your CV or ask them anything. (Make sure you have Viber installed!)
            </p>
            <Button onClick={handleApply} className="rounded-none shrink-0">APPLY</Button>
          </div>
        </div>
      </div>

      {/* Description Modal */}
      <Dialog open={showDescription} onOpenChange={setShowDescription}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{jobTitle}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {businessName}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 whitespace-pre-wrap text-foreground">
            {description}
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Modal */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Report this Job Post</DialogTitle>
            <DialogDescription>
              Tell us briefly why this post should be reviewed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Type your reason here..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="min-h-32"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowReport(false)}
                disabled={submittingReport}
                className="rounded-none"
              >
                Cancel
              </Button>
              <Button
                onClick={submitReport}
                disabled={submittingReport}
                className="rounded-none"
              >
                {submittingReport ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
