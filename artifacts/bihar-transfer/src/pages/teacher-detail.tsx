import { useGetTeacher, useCreateTransfer, useGetAuthMe } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { MapPin, Briefcase, GraduationCap, Building2, Calendar, User, Phone, Mail, Send, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function TeacherDetail() {
  const params = useParams();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: user } = useGetAuthMe();
  const { data: teacher, isLoading } = useGetTeacher(id, { 
    query: { enabled: !!id, queryKey: ["/api/teachers", id] } 
  });
  
  const createTransfer = useCreateTransfer();
  const [message, setMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRequestTransfer = () => {
    if (!user?.isProfileComplete) {
      toast({
        variant: "destructive",
        title: "Profile Incomplete",
        description: "You must complete your profile before requesting a transfer.",
      });
      setLocation("/profile");
      return;
    }

    createTransfer.mutate(
      { data: { targetTeacherId: id, message } },
      {
        onSuccess: () => {
          setDialogOpen(false);
          toast({
            title: "Request Sent",
            description: `Transfer request sent to ${teacher?.name}.`,
          });
          setLocation("/transfers");
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Request Failed",
            description: err.message || "Unable to send transfer request.",
          });
        }
      }
    );
  };

  if (isLoading || !teacher) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-md" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSelf = user?.id === teacher.id;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/teachers">
          <Button variant="outline" size="icon" className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teacher Profile</h1>
          <p className="text-muted-foreground text-sm">Review profile details before requesting a transfer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-t-4 border-t-secondary shadow-md">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{teacher.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2 font-mono text-base">
                    <User className="w-4 h-4" /> {teacher.employeeId}
                  </CardDescription>
                </div>
                {teacher.subject && (
                  <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 text-sm py-1 px-3">
                    {teacher.subject}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Designation</span>
                  <p className="flex items-center gap-2 font-medium">
                    <Briefcase className="w-4 h-4 text-primary" /> {teacher.designation}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Years of Service</span>
                  <p className="flex items-center gap-2 font-medium">
                    <Calendar className="w-4 h-4 text-primary" /> {teacher.serviceYears ?? "Not specified"}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">District</span>
                  <p className="flex items-center gap-2 font-medium">
                    <MapPin className="w-4 h-4 text-primary" /> {teacher.district}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Block</span>
                  <p className="flex items-center gap-2 font-medium">
                    <MapPin className="w-4 h-4 text-primary" /> {teacher.block}
                  </p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Current School</span>
                  <p className="flex items-center gap-2 font-medium">
                    <Building2 className="w-4 h-4 text-primary shrink-0" /> 
                    {teacher.school} {teacher.schoolCode ? `(${teacher.schoolCode})` : ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 border rounded-md">
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Mobile Number</p>
                    <p className="font-medium">{teacher.phone || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-md">
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email Address</p>
                    <p className="font-medium truncate">{teacher.email || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1 space-y-6">
          <Card className="sticky top-24 shadow-md bg-secondary/5 border-secondary/20">
            <CardHeader>
              <CardTitle className="text-lg">Action</CardTitle>
              <CardDescription>Initiate mutual transfer process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white dark:bg-black/20 rounded-md border text-sm text-muted-foreground">
                By requesting a mutual transfer, you agree to share your contact details and profile information with this teacher.
              </div>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full gap-2 py-6 text-lg" disabled={isSelf}>
                    <Send className="w-5 h-5" />
                    {isSelf ? "This is your profile" : "Request Transfer"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Transfer Request</DialogTitle>
                    <DialogDescription>
                      You are about to send a mutual transfer request to <strong>{teacher.name}</strong>.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="message">Personal Message (Optional)</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Hello, I am interested in a mutual transfer to your district..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="h-32"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleRequestTransfer} disabled={createTransfer.isPending}>
                      {createTransfer.isPending ? "Sending..." : "Send Request"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
