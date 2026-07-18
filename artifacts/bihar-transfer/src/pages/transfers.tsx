import { useListTransfers, useGetAuthMe, getListTransfersQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownLeft, Clock, MapPin, Building2, Eye, CalendarClock } from "lucide-react";
import { format } from "date-fns";

export default function Transfers() {
  const { data: user } = useGetAuthMe();
  const [tab, setTab] = useState<"sent" | "received">("received");

  const { data: transfers, isLoading } = useListTransfers(
    { type: tab },
    { query: { queryKey: getListTransfersQueryKey({ type: tab }) } }
  );

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "accepted":
        return <Badge variant="success">Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="warning">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Requests</h1>
          <p className="text-muted-foreground mt-1">Manage your mutual transfer applications.</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(val) => setTab(val as "sent" | "received")} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-12 mb-6">
          <TabsTrigger value="received" className="text-sm font-semibold flex items-center gap-2">
            <ArrowDownLeft className="w-4 h-4" /> Received
          </TabsTrigger>
          <TabsTrigger value="sent" className="text-sm font-semibold flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4" /> Sent
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-0">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          ) : !transfers || transfers.length === 0 ? (
            <Card className="border-dashed bg-transparent">
              <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  {tab === "received" ? (
                    <ArrowDownLeft className="w-8 h-8 text-muted-foreground" />
                  ) : (
                    <ArrowUpRight className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <h3 className="text-xl font-medium">No {tab} requests</h3>
                <p className="text-muted-foreground max-w-md mt-2">
                  {tab === "received" 
                    ? "You haven't received any transfer requests yet. Make sure your profile is complete to be visible to others."
                    : "You haven't sent any transfer requests. Search for teachers to find a compatible partner."}
                </p>
                {tab === "sent" && (
                  <Link href="/teachers">
                    <Button className="mt-6">Find Partners</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {transfers.map((request) => {
                const partner = tab === "received" ? request.requester : request.target;
                
                return (
                  <Card key={request.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row">
                      <div className="p-6 flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-semibold flex items-center gap-2">
                              {partner?.name}
                            </h3>
                            <p className="text-sm font-mono text-muted-foreground mt-1">
                              {partner?.employeeId} • {partner?.designation}
                            </p>
                          </div>
                          <StatusBadge status={request.status} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4 shrink-0" />
                            <span className="truncate">{partner?.district} ({partner?.block})</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="w-4 h-4 shrink-0" />
                            <span className="truncate">{partner?.school}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                            <CalendarClock className="w-4 h-4 shrink-0" />
                            <span>Requested on {format(new Date(request.createdAt), 'PPpp')}</span>
                          </div>
                        </div>

                        {request.message && (
                          <div className="mt-4 p-3 bg-muted/50 rounded-md border text-sm italic text-muted-foreground border-l-4 border-l-primary/50">
                            "{request.message}"
                          </div>
                        )}
                      </div>
                      <div className="bg-muted/20 border-t sm:border-t-0 sm:border-l border-border p-6 flex sm:flex-col items-center justify-center sm:w-48 gap-3">
                        <Link href={`/transfers/${request.id}`} className="w-full">
                          <Button className="w-full gap-2" variant="default">
                            <Eye className="w-4 h-4" /> View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
