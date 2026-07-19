import { useLocation } from "wouter";
import { useSendMobileOtp, useVerifyMobileOtp, useSendEmailOtp, useVerifyEmailOtp, getGetAuthMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { mobileLoginSchema, mobileVerifySchema, emailLoginSchema, emailVerifySchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Phone, Mail, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import * as z from "zod";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [step, setStep] = useState<"phone" | "email" | "verifyPhone" | "verifyEmail">("phone");
  const [identifier, setIdentifier] = useState("");

  const sendMobileOtp = useSendMobileOtp();
  const verifyMobileOtp = useVerifyMobileOtp();
  const sendEmailOtp = useSendEmailOtp();
  const verifyEmailOtp = useVerifyEmailOtp();

  useEffect(() => {
    if (user && !isAuthLoading) {
      setLocation("/dashboard");
    }
  }, [user, isAuthLoading, setLocation]);

  const phoneForm = useForm<z.infer<typeof mobileLoginSchema>>({
    resolver: zodResolver(mobileLoginSchema),
    defaultValues: { phone: "" },
  });

  const verifyPhoneForm = useForm<z.infer<typeof mobileVerifySchema>>({
    resolver: zodResolver(mobileVerifySchema),
    defaultValues: { phone: "", otp: "" },
  });

  const emailForm = useForm<z.infer<typeof emailLoginSchema>>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: { email: "" },
  });

  const verifyEmailForm = useForm<z.infer<typeof emailVerifySchema>>({
    resolver: zodResolver(emailVerifySchema),
    defaultValues: { email: "", otp: "" },
  });

  const onPhoneSubmit = (values: z.infer<typeof mobileLoginSchema>) => {
    sendMobileOtp.mutate(
      { data: values },
      {
        onSuccess: () => {
          setIdentifier(values.phone);
          verifyPhoneForm.setValue("phone", values.phone);
          setStep("verifyPhone");
          toast({ title: "OTP Sent", description: "Please check your mobile messages." });
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Failed to send OTP", description: err.message || "An error occurred" });
        },
      }
    );
  };

  const onVerifyPhoneSubmit = (values: z.infer<typeof mobileVerifySchema>) => {
    verifyMobileOtp.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          queryClient.setQueryData(getGetAuthMeQueryKey(), data.teacher);
          setLocation("/dashboard");
          toast({ title: "Login Successful", description: "Welcome to the Mutual Transfer Portal." });
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Verification Failed", description: err.message || "Invalid OTP" });
        },
      }
    );
  };

  const onEmailSubmit = (values: z.infer<typeof emailLoginSchema>) => {
    sendEmailOtp.mutate(
      { data: values },
      {
        onSuccess: () => {
          setIdentifier(values.email);
          verifyEmailForm.setValue("email", values.email);
          setStep("verifyEmail");
          toast({ title: "OTP Sent", description: "Please check your email inbox." });
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Failed to send OTP", description: err.message || "An error occurred" });
        },
      }
    );
  };

  const onVerifyEmailSubmit = (values: z.infer<typeof emailVerifySchema>) => {
    verifyEmailOtp.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          queryClient.setQueryData(getGetAuthMeQueryKey(), data.teacher);
          setLocation("/dashboard");
          toast({ title: "Login Successful", description: "Welcome to the Mutual Transfer Portal." });
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Verification Failed", description: err.message || "Invalid OTP" });
        },
      }
    );
  };

  if (isAuthLoading) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left side branding */}
      <div className="w-full md:w-1/2 bg-secondary text-secondary-foreground p-8 md:p-16 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
        <div className="relative z-10 max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-lg">
            SSP
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Shikshak Sahyog Portal
            </h1>
            <h2 className="text-2xl font-light opacity-90">
              Teacher Mutual Transfer Network
            </h2>
          </div>
          <p className="text-lg opacity-80 mt-8 max-w-sm leading-relaxed">
            A community-driven platform where teachers connect, find compatible transfer partners, and coordinate mutual transfers — entirely peer-to-peer.
          </p>
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full md:w-1/2 p-4 flex items-center justify-center relative">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-2xl bg-card">
            <CardHeader className="space-y-3 pb-6">
              <CardTitle className="text-2xl font-bold">
                {step === "phone" || step === "email" ? "Sign In to Your Account" : "Verify Your Identity"}
              </CardTitle>
              <CardDescription className="text-base">
                {step === "phone" || step === "email"
                  ? "Select a method to receive your One-Time Password."
                  : `Enter the 6-digit code sent to ${identifier}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === "phone" || step === "email" ? (
                <Tabs value={step} onValueChange={(val) => setStep(val as "phone" | "email")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
                    <TabsTrigger value="phone" className="text-sm font-semibold flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Mobile
                    </TabsTrigger>
                    <TabsTrigger value="email" className="text-sm font-semibold flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="phone" className="animate-in fade-in-50 zoom-in-95 duration-300">
                    <Form {...phoneForm}>
                      <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-6">
                        <FormField
                          control={phoneForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mobile Number</FormLabel>
                              <FormControl>
                                <Input placeholder="10-digit number" {...field} className="h-12 text-lg" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full h-12 text-base font-semibold gap-2" disabled={sendMobileOtp.isPending}>
                          Send Mobile OTP <ArrowRight className="w-5 h-5" />
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="email" className="animate-in fade-in-50 zoom-in-95 duration-300">
                    <Form {...emailForm}>
                      <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
                        <FormField
                          control={emailForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input placeholder="teacher@example.com" type="email" {...field} className="h-12 text-lg" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full h-12 text-base font-semibold gap-2" disabled={sendEmailOtp.isPending}>
                          Send Email OTP <ArrowRight className="w-5 h-5" />
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              ) : step === "verifyPhone" ? (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300 space-y-6">
                  <Form {...verifyPhoneForm}>
                    <form onSubmit={verifyPhoneForm.handleSubmit(onVerifyPhoneSubmit)} className="space-y-6">
                      <FormField
                        control={verifyPhoneForm.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>One-Time Password</FormLabel>
                            <FormControl>
                              <Input placeholder="000000" maxLength={6} {...field} className="h-14 text-center text-2xl tracking-widest font-mono" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-3">
                        <Button type="button" variant="outline" className="h-12 px-4" onClick={() => setStep("phone")}>
                          <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <Button type="submit" className="w-full h-12 text-base font-semibold gap-2" disabled={verifyMobileOtp.isPending}>
                          <ShieldCheck className="w-5 h-5" /> Verify & Login
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300 space-y-6">
                  <Form {...verifyEmailForm}>
                    <form onSubmit={verifyEmailForm.handleSubmit(onVerifyEmailSubmit)} className="space-y-6">
                      <FormField
                        control={verifyEmailForm.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>One-Time Password</FormLabel>
                            <FormControl>
                              <Input placeholder="000000" maxLength={6} {...field} className="h-14 text-center text-2xl tracking-widest font-mono" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-3">
                        <Button type="button" variant="outline" className="h-12 px-4" onClick={() => setStep("email")}>
                          <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <Button type="submit" className="w-full h-12 text-base font-semibold gap-2" disabled={verifyEmailOtp.isPending}>
                          <ShieldCheck className="w-5 h-5" /> Verify & Login
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
