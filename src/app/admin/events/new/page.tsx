"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/navbar";
import { createEvent } from "@/services/events";
import { getErrorMessage } from "@/lib/errors";
import { EVENT_TYPES } from "@/lib/events";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const createEventSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  max_attendees: z
    .number({ message: "Max attendees is required" })
    .int("Must be a whole number")
    .min(1, "Must be at least 1"),
  event_date: z.string().min(1, "Date and time are required"),
  event_type: z.enum(EVENT_TYPES, { message: "Please select a type" }),
});

type CreateEventForm = z.infer<typeof createEventSchema>;

function CreateEventContent() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventForm>({
    resolver: zodResolver(createEventSchema),
  });

  const onSubmit = async (values: CreateEventForm) => {
    setSubmitting(true);
    try {
      await createEvent({
        ...values,
        event_date: new Date(values.event_date).toISOString(),
      });
      toast.success("Event created");
      router.push("/admin");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <Link
        href="/admin"
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        ← Back to dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create event</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} {...register("description")} />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="event_type">Type</Label>
                <select
                  id="event_type"
                  defaultValue=""
                  {...register("event_type")}
                  className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm"
                >
                  <option value="" disabled>
                    Select...
                  </option>
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.event_type && (
                  <p className="text-sm text-destructive">
                    {errors.event_type.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="max_attendees">Max attendees</Label>
                <Input
                  id="max_attendees"
                  type="number"
                  min={1}
                  {...register("max_attendees", { valueAsNumber: true })}
                />
                {errors.max_attendees && (
                  <p className="text-sm text-destructive">
                    {errors.max_attendees.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="event_date">Date and time</Label>
              <Input
                id="event_date"
                type="datetime-local"
                {...register("event_date")}
              />
              {errors.event_date && (
                <p className="text-sm text-destructive">
                  {errors.event_date.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating..." : "Create event"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default function CreateEventPage() {
  return (
    <AuthGuard requiredRole="ADMIN">
      <Navbar />
      <CreateEventContent />
    </AuthGuard>
  );
}