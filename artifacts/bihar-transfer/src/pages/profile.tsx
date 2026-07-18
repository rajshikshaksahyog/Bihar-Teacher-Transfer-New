import { useGetMyProfile, useUpdateMyProfile, getGetMyProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { profileSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, UserCircle } from "lucide-react";
import * as z from "zod";
import { useEffect } from "react";

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useGetMyProfile();
  const updateProfile = useUpdateMyProfile();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      employeeId: "",
      designation: "",
      subject: "",
      district: "",
      block: "",
      school: "",
      schoolCode: "",
      serviceYears: undefined,
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || "",
        employeeId: profile.employeeId || "",
        designation: profile.designation || "",
        subject: profile.subject || "",
        district: profile.district || "",
        block: profile.block || "",
        school: profile.school || "",
        schoolCode: profile.schoolCode || "",
        serviceYears: profile.serviceYears ?? undefined,
      });
    }
  }, [profile, form]);

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    updateProfile.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          queryClient.setQueryData(getGetMyProfileQueryKey(), data);
          toast({
            title: "Profile Updated",
            description: "Your profile has been saved successfully.",
          });
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Update Failed",
            description: err.message || "Failed to update profile.",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
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
          <Card className="shadow-md border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your identity within the department.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Rajesh Kumar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID / Teacher ID</FormLabel>
                    <FormControl>
                      <Input placeholder="BR-T-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Primary Teacher, High School Teacher" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Mathematics, Hindi" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>Leave blank if general</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serviceYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Service</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-md border-t-4 border-t-secondary">
            <CardHeader>
              <CardTitle>Current Posting</CardTitle>
              <CardDescription>Details about your current school and location.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Patna, Gaya" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="block"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Block</FormLabel>
                    <FormControl>
                      <Input placeholder="Block name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="school"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>School Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full school name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="schoolCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School UDISE Code (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="UDISE code" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="bg-muted/30 pt-6 flex justify-end">
              <Button type="submit" size="lg" className="gap-2" disabled={updateProfile.isPending}>
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
