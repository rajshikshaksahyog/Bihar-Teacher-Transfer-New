import { useGetTransfer, useAcceptTransfer, useRejectTransfer, useCancelTransfer, getGetTransferQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Building2, User, Phone, Mail, ArrowLeft, Check, X, Ban, ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";

export default function TransferDetail() {
  const params = useParams();
  const id = Number(params.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: transfer, isLoading } = useGetTransfer(id, {
    query: { enabled: !!id, queryKey: ["/api/transfers", id] }
  });

  const acceptTransfer = useAcceptTransfer();
  const rejectTransfer = useRejectTransfer();
  const cancelTransfer = useCancelTransfer();

  const handleAction = (action: 'accept' | 'reject' | 'cancel') => {
    const mutation = action === 'accept' ? acceptTransfer : 
                     action === 'reject' ? rejectTransfer : 
                     cancelTransfer;
    
    mutation.mutate(
      action === 'accept' ? { id } : { data: { id } } as any, // Adhering to generated signature types
      {
        onSuccess: (data) => {
          queryClient.setQueryData(getGetTransferQueryKey(id), data);
          toast({
            title: `Transfer ${action}ed`,
            description: `The request has been ${action}ed successfully.`,
          });
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Action Failed",
            description: err.message || `Failed to ${action} transfer.`,
          });
        }
      }
    );
  };

  if (isLoading || !transfer) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-md" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Determine role
  const isRequester = transfer.requesterId === transfer.requester?.id; // Simplify by relying on API returned structure which resolves nested entities

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "accepted":
        return <Badge variant="success" className="text-sm px-3 py-1">Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="text-sm px-3 py-1">Rejected</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="text-sm px-3 py-1">Cancelled</Badge>;
      default:
        return <Badge variant="warning" className="text-sm px-3 py-1">Pending Validation</Badge>;
    }
  };

  const TeacherCard = ({ teacher, role }: { teacher: any, role: string }) => (
    <Card className={`border-t-4 ${role === 'Requester' ? 'border-t-blue-500' : 'border-t-orange-500'}`}>
      <CardHeader>
        <CardDescription className="uppercase tracking-wider font-bold text-xs">{role}</CardDescription>
        <CardTitle className="text-xl">{teacher?.name}</CardTitle>
        <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm font-mono">
          <User className="w-4 h-4" /> {teacher?.employeeId}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-start gap-3">
            <Briefcase className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Designation</p>
              <p className="text-sm font-medium">{teacher?.designation}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Location</p>
              <p className="text-sm font-medium">{teacher?.district}, {teacher?.block}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Building2 className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">School</p>
              <p className="text-sm font-medium">{teacher?.school}</p>
            </div>
          </div>
        </div>

        {transfer.status === 'accepted' && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-semibold">Contact Details Shared</h4>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-primary" />
              <span>{teacher?.phone || "Not provided"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-primary" />
              <span>{teacher?.email || "Not provided"}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/transfers">
          <Button variant="outline" size="icon" className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Transfer Request #{transfer.id}</h1>
            <p className="text-muted-foreground text-sm">Initiated on {format(new Date(transfer.createdAt), 'PPP')}</p>
          </div>
          <StatusBadge status={transfer.status} />
        </div>
      </div>

      {transfer.status === 'pending' && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">Action Required</h3>
              <p className="text-muted-foreground text-sm">
                {isRequester 
                  ? "Waiting for the target teacher to accept your request. You can cancel it if needed." 
                  : "You have received a transfer request. Please review and accept or reject it."}
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              {!isRequester ? (
                <>
                  <Button variant="destructive" className="flex-1 sm:flex-none gap-2" onClick={() => handleAction('reject')} disabled={rejectTransfer.isPending}>
                    <X className="w-4 h-4" /> Reject
                  </Button>
                  <Button variant="default" className="flex-1 sm:flex-none gap-2 bg-green-600 hover:bg-green-700" onClick={() => handleAction('accept')} disabled={acceptTransfer.isPending}>
                    <Check className="w-4 h-4" /> Accept Match
                  </Button>
                </>
              ) : (
                <Button variant="outline" className="flex-1 sm:flex-none gap-2 text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleAction('cancel')} disabled={cancelTransfer.isPending}>
                  <Ban className="w-4 h-4" /> Cancel Request
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {transfer.message && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Message from Requester</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base italic border-l-4 border-primary pl-4 py-1">{transfer.message}</p>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none hidden md:flex">
          <div className="w-12 h-12 bg-background border-4 border-border rounded-full flex items-center justify-center z-10 shadow-sm text-muted-foreground">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          <TeacherCard teacher={transfer.requester} role="Requester" />
          <TeacherCard teacher={transfer.target} role="Target" />
        </div>
      </div>
      
      {transfer.status === 'accepted' && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-6 text-center space-y-2 mt-8">
          <Check className="w-10 h-10 text-green-600 mx-auto mb-2" />
          <h3 className="text-xl font-bold text-green-800 dark:text-green-400">Match Confirmed!</h3>
          <p className="text-green-700 dark:text-green-500 max-w-2xl mx-auto">
            Both parties have agreed to the mutual transfer. Contact details are now visible to both of you. You may now proceed with the formal offline departmental application process using the shared information.
          </p>
        </div>
      )}
    </div>
  );
}
