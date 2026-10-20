"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { registerForEvent } from "@/services/registrations";
import { getErrorMessage } from "@/lib/errors";
import { EDUCATION_LEVELS } from "@/lib/events";
import type { EducationLevel } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const educationValues = EDUCATION_LEVELS.map((l) => l.value) as [
  EducationLevel,
  ...EducationLevel[],
];

const registrationSchema = z.object({
  linkedinProfile: z
    .string()
    .refine(
      (v) => v === "" || /^https?:\/\/\S+$/.test(v),
      "Enter a valid URL starting with http:// or https://"
    ),
  educationLevel: z.enum(["", ...educationValues]),
  motivation: z.string().max(500, "Maximum 500 characters"),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  eventId: number;
  onSuccess: () => void;
}

export function RegistrationForm({ eventId, onSuccess }: RegistrationFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { linkedinProfile: "", educationLevel: "", motivation: "" },
  });

  const onSubmit = async (values: RegistrationFormValues) => {
    setSubmitting(true);
    try {
      await registerForEvent(eventId, {
        linkedinProfile: values.linkedinProfile || undefined,
        educationLevel: values.educationLevel || undefined,
        motivation: values.motivation || undefined,
      });
      toast.success("Registration submitted. Waiting for admin approval.");
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1">
        <Label htmlFor="linkedinProfile">LinkedIn profile (optional)</Label>
        <Input
          id="linkedinProfile"
          placeholder="https://linkedin.com/in/your-name"
          {...register("linkedinProfile")}
        />
        {errors.linkedinProfile && (
          <p className="text-sm text-destructive">
            {errors.linkedinProfile.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="educationLevel">Education level (optional)</Label>
        <select
          id="educationLevel"
          {...register("educationLevel")}
          className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm"
        >
          <option value="">Select...</option>
          {EDUCATION_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
        {errors.educationLevel && (
          <p className="text-sm text-destructive">
            {errors.educationLevel.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="motivation">Why do you want to attend? (optional)</Label>
        <Textarea id="motivation" rows={4} {...register("motivation")} />
        {errors.motivation && (
          <p className="text-sm text-destructive">
            {errors.motivation.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Submitting..." : "Register for this event"}
      </Button>
    </form>
  );
}