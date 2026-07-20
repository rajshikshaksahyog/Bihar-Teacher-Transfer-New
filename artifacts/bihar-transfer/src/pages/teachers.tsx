import { useListTeachers, useGetAuthMe } from "@workspace/api-client-react";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Briefcase, Building2, UserPlus } from "lucide-react";
import { Link } from "wouter";
import { BIHAR_DISTRICTS, getBlocks, getPanchayats } from "@/lib/bihar-location-data";
import { SUBJECTS } from "@/lib/schemas";

const SUBJECT_OPTIONS = SUBJECTS.filter((s) => s !== "Others");

export default function Teachers() {
  const { data: user } = useGetAuthMe();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [districtFilter, setDistrictFilter] = useState("");
  const [blockFilter, setBlockFilter] = useState("");
  const [panchayatFilter, setPanchayatFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");

  const blocks = districtFilter ? getBlocks(districtFilter) : [];
  const panchayats = districtFilter && blockFilter ? getPanchayats(districtFilter, blockFilter) : [];

  const { data: response, isLoading } = useListTeachers({
    search: debouncedSearch || undefined,
    district: districtFilter || undefined,
    block: blockFilter || undefined,
    panchayat: panchayatFilter || undefined,
    subject: subjectFilter || undefined,
    limit: 50,
  });

  const teachers = response?.teachers || [];

  const hasFilters = !!(searchTerm || districtFilter || blockFilter || panchayatFilter || subjectFilter);

  function clearFilters() {
    setSearchTerm("");
    setDistrictFilter("");
    setBlockFilter("");
    setPanchayatFilter("");
    setSubjectFilter("");
  }

  function handleDistrictChange(val: string) {
    setDistrictFilter(val === "__all__" ? "" : val);
    setBlockFilter("");
    setPanchayatFilter("");
  }

  function handleBlockChange(val: string) {
    setBlockFilter(val === "__all__" ? "" : val);
    setPanchayatFilter("");
  }

  function handlePanchayatChange(val: string) {
    setPanchayatFilter(val === "__all__" ? "" : val);
  }

  function handleSubjectChange(val: string) {
    setSubjectFilter(val === "__all__" ? "" : val);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Find Partners</h1>
          <p className="text-muted-foreground mt-1">Search for compatible teachers for mutual transfer.</p>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Cascading dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* District */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> जिला (District)
              </label>
              <Select value={districtFilter || "__all__"} onValueChange={handleDistrictChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Districts</SelectItem>
                  {BIHAR_DISTRICTS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Block */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Building2 className="w-3 h-3" /> ब्लॉक (Block)
              </label>
              <Select
                value={blockFilter || "__all__"}
                onValueChange={handleBlockChange}
                disabled={!districtFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder={districtFilter ? "All Blocks" : "Select district first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Blocks</SelectItem>
                  {blocks.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Panchayat */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> पंचायत (Panchayat)
              </label>
              <Select
                value={panchayatFilter || "__all__"}
                onValueChange={handlePanchayatChange}
                disabled={!blockFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder={blockFilter ? "All Panchayats" : "Select block first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Panchayats</SelectItem>
                  {panchayats.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> विषय (Subject)
              </label>
              <Select value={subjectFilter || "__all__"} onValueChange={handleSubjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Subjects</SelectItem>
                  {SUBJECT_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear filters */}
          {hasFilters && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                Clear all filters
              </Button>
            </div>
          )}
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
                  {teacher.panchayat && (
                    <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate text-xs" title={teacher.panchayat}>{teacher.panchayat} · {teacher.block}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span className="truncate" title={teacher.school}>{teacher.school}</span>
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
