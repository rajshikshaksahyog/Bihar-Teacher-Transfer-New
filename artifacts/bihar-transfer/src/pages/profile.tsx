import { useRef, useState, useEffect } from "react";
import { useGetMyProfile, useUpdateMyProfile, getGetMyProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { profileSchema, TEACHER_CATEGORIES, CASTE_CATEGORIES, DESIGNATIONS } from "@/lib/schemas";
import { BIHAR_DISTRICTS, getBlocks, getPanchayats } from "@/lib/bihar-location-data";
import { useUpload } from "@workspace/object-storage-web";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, UserCircle, Camera, Loader2 } from "lucide-react";
import * as z from "zod";

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useGetMyProfile();
  const updateProfile = useUpdateMyProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profilePicturePath, setProfilePicturePath] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      setProfilePicturePath(response.objectPath);
      toast({ title: "Photo uploaded", description: "Save your profile to keep the change." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Upload failed", description: "Could not upload photo. Please try again." });
    },
  });

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      phone: "",
      designation: undefined,
      subject: "",
      teacherCategory: undefined,
      casteCategory: undefined,
      district: "",
      block: "",
      panchayat: "",
      school: "",
      schoolCode: "",
      serviceYears: undefined,
    },
  });

  // Watch district and block to drive cascading dropdowns
  const watchedDistrict = form.watch("district");
  const watchedBlock = form.watch("block");

  const availableBlocks = watchedDistrict ? getBlocks(watchedDistrict) : [];
  const availablePanchayats = watchedDistrict && watchedBlock ? getPanchayats(watchedDistrict, watchedBlock) : [];

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || "",
        phone: (profile as any).phone || "",
        designation: (profile as any).designation || undefined,
        subject: profile.subject || "",
        teacherCategory: (profile as any).teacherCategory || undefined,
        casteCategory: (profile as any).casteCategory || undefined,
        district: profile.district || "",
        block: profile.block || "",
        panchayat: (profile as any).panchayat || "",
        school: profile.school || "",
        schoolCode: profile.schoolCode || "",
        serviceYears: profile.serviceYears ?? undefined,
      });
      const pic = (profile as any).profilePicture;
      if (pic) {
        setProfilePicturePath(pic);
        setPreviewUrl(`/api/storage${pic}`);
      }
    }
  }, [profile, form]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Invalid file", description: "Please select an image file." });
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    await uploadFile(file);
    e.target.value = "";
  };

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    updateProfile.mutate(
      { data: { ...values, profilePicture: profilePicturePath } as any },
      {
        onSuccess: (data) => {
          queryClient.setQueryData(getGetMyProfileQueryKey(), data);
          toast({ title: "Profile Updated", description: "Your profile has been saved successfully." });
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Update Failed", description: err.message || "Failed to update profile." });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48 mb-6" />
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-full text-primary">
          <UserCircle className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your teacher credentials and current posting details.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* ── Profile Photo ── */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>Upload a clear passport-size photo. JPEG or PNG recommended.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div
                  className="w-28 h-28 rounded-full border-4 border-primary/20 overflow-hidden bg-muted flex items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="w-20 h-20 text-muted-foreground/40" />
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {isUploading
                      ? <Loader2 className="w-7 h-7 text-white animate-spin" />
                      : <Camera className="w-7 h-7 text-white" />}
                  </div>
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" className="gap-2"
                disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
                {isUploading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading…</>
                  : <><Camera className="w-4 h-4" />{previewUrl ? "Change Photo" : "Upload Photo"}</>}
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </CardContent>
          </Card>

          {/* ── Personal Information ── */}
          <Card className="shadow-md border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your identity within the department.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Full Name */}
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="Rajesh Kumar" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Mobile Number */}
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="10-digit mobile number" maxLength={10} {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Designation — dropdown */}
              <FormField control={form.control} name="designation" render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select designation" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DESIGNATIONS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Teacher Category */}
              <FormField control={form.control} name="teacherCategory" render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher Category <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select your category" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TEACHER_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Caste Category */}
              <FormField control={form.control} name="casteCategory" render={({ field }) => (
                <FormItem>
                  <FormLabel>Joining Caste Category (आरक्षित श्रेणी) <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select caste category" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CASTE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Subject */}
              <FormField control={form.control} name="subject" render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Mathematics, Hindi, Science" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Years of Service */}
              <FormField control={form.control} name="serviceYears" render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Service</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="5" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

            </CardContent>
          </Card>

          {/* ── Current Posting ── */}
          <Card className="shadow-md border-t-4 border-t-secondary">
            <CardHeader>
              <CardTitle>Current Posting</CardTitle>
              <CardDescription>
                Select your district, block, and panchayat from the cascading menus below.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* District — drives block list */}
              <FormField control={form.control} name="district" render={({ field }) => (
                <FormItem>
                  <FormLabel>District <span className="text-destructive">*</span></FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      form.setValue("block", "");
                      form.setValue("panchayat", "");
                    }}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BIHAR_DISTRICTS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Block — depends on district */}
              <FormField control={form.control} name="block" render={({ field }) => (
                <FormItem>
                  <FormLabel>Block <span className="text-destructive">*</span></FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      form.setValue("panchayat", "");
                    }}
                    value={field.value || ""}
                    disabled={!watchedDistrict}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={watchedDistrict ? "Select block" : "Select district first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableBlocks.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Panchayat — depends on block */}
              <FormField control={form.control} name="panchayat" render={({ field }) => (
                <FormItem>
                  <FormLabel>Panchayat <span className="text-destructive">*</span></FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    disabled={!watchedBlock}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={watchedBlock ? "Select panchayat" : "Select block first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availablePanchayats.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {/* School Name */}
              <FormField control={form.control} name="school" render={({ field }) => (
                <FormItem>
                  <FormLabel>School Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="Full school name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* UDISE Code */}
              <FormField control={form.control} name="schoolCode" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>School UDISE Code (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="UDISE code" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

            </CardContent>
            <CardFooter className="bg-muted/30 pt-6 flex justify-end">
              <Button type="submit" size="lg" className="gap-2" disabled={updateProfile.isPending || isUploading}>
                <Save className="w-5 h-5" />
                {updateProfile.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </CardFooter>
          </Card>

        </form>
      </Form>
    </div>
  );
}
