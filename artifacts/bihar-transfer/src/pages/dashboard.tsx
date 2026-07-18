import { useGetTransferStats, useGetAuthMe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle, Search, FileText, Users } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetTransferStats();
  const { data: user } = useGetAuthMe();

  if (statsLoading || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-xl mt-6" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your mutual transfer applications.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/teachers">
            <Button variant="outline" className="gap-2 bg-card">
              <Search className="w-4 h-4" /> Find Partners
            </Button>
          </Link>
          <Link href="/transfers">
            <Button className="gap-2">
              <FileText className="w-4 h-4" /> View Requests
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Requests Sent</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSent}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingSent} pending
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Requests Received</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReceived}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingReceived} pending
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accepted}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully matched
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Declined requests
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest transfer request updates</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No recent activity</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                  You haven't sent or received any transfer requests recently.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => {
                  const isIncoming = activity.targetId === user?.id;
                  const partner = isIncoming ? activity.requester : activity.target;
                  
                  return (
                    <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-card hover:bg-accent/50 transition-colors">
                      <div className={`p-2 rounded-full ${isIncoming ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'}`}>
                        {isIncoming ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">
                            {isIncoming ? `Request from ${partner?.name}` : `Sent request to ${partner?.name}`}
                          </p>
                          <Badge variant={
                            activity.status === 'accepted' ? 'success' :
                            activity.status === 'rejected' ? 'destructive' :
                            activity.status === 'cancelled' ? 'outline' : 'warning'
                          }>
                            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {partner?.designation} • {partner?.district}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Updated {new Date(activity.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/transfers/${activity.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm border-border/50 bg-secondary/5 border-secondary/20">
          <CardHeader>
            <CardTitle>System Stats</CardTitle>
            <CardDescription>Platform overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Registered Teachers</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalTeachersRegistered}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border/50">
              <h4 className="text-sm font-semibold mb-3">Quick Guide</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-primary font-bold">1.</span> Complete your profile to become visible to others.</li>
                <li className="flex gap-2"><span className="text-primary font-bold">2.</span> Search for compatible partners in your desired district.</li>
                <li className="flex gap-2"><span className="text-primary font-bold">3.</span> Send a mutual transfer request.</li>
                <li className="flex gap-2"><span className="text-primary font-bold">4.</span> Once accepted, proceed with departmental procedures.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
