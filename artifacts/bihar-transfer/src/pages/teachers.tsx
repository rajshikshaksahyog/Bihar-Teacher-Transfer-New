import { useListTeachers, useGetAuthMe } from "@workspace/api-client-react";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Briefcase, GraduationCap, Building2, UserPlus, Filter } from "lucide-react";
import { Link } from "wouter";

export default function Teachers() {
  const { data: user } = useGetAuthMe();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [districtFilter, setDistrictFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");

  const { data: response, isLoading } = useListTeachers({
    search: debouncedSearch || undefined,
    district: districtFilter || undefined,
    subject: subjectFilter || undefined,
    limit: 50,
  });

  const teachers = response?.teachers || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Find Partners</h1>
          <p className="text-muted-foreground mt-1">Search for compatible teachers for mutual transfer.</p>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or employee ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="District..." 
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="relative flex-1 md:w-48">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Subject..." 
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="pl-9"
              />
            </div>
            {(searchTerm || districtFilter || subjectFilter) && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchTerm("");
                  setDistrictFilter("");
                  setSubjectFilter("");
                }}
                className="px-3"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : teachers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl border-dashed">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium">No teachers found</h3>
          <p className="text-muted-foreground max-w-md mt-2">
            We couldn't find any teachers matching your criteria. Try adjusting your filters or search terms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher, index) => (
            <Card key={teacher.id} className="overflow-hidden hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="h-2 bg-secondary" />
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{teacher.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 font-mono">{teacher.employeeId}</p>
                  </div>
                  {teacher.subject && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {teacher.subject}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    <span className="truncate" title={teacher.designation}>{teacher.designation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate" title={teacher.district}>{teacher.district}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span className="truncate" title={teacher.school}>{teacher.school} ({teacher.block})</span>
                  </div>
                </div>
                
                <div className="pt-4 mt-2 border-t border-border/50">
                  <Link href={`/teachers/${teacher.id}`} className="w-full">
                    <Button className="w-full gap-2" variant={teacher.id === user?.id ? "outline" : "default"} disabled={teacher.id === user?.id}>
                      {teacher.id === user?.id ? "This is you" : <><UserPlus className="w-4 h-4" /> View & Request</>}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
