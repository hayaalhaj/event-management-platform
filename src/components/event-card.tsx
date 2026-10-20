import Link from "next/link";
import type { EventItem } from "@/types";
import { formatEventDate, isFullEvent, isPastEvent } from "@/lib/events";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function EventCard({ event }: { event: EventItem }) {
  const past = isPastEvent(event);
  const full = isFullEvent(event);

  return (
    <Card className={past ? "opacity-60" : ""}>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{event.event_type}</Badge>
          {past && <Badge variant="outline">Past</Badge>}
          {full && <Badge variant="destructive">Full</Badge>}
        </div>
        <CardTitle className="mt-2">{event.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {event.description}
        </p>
        <p className="text-sm">{formatEventDate(event.event_date)}</p>
        <p className="text-sm">
          {event.registrationCount !== undefined
            ? `${event.registrationCount} / ${event.max_attendees} registered`
            : `Capacity: ${event.max_attendees}`}
        </p>
                <Link
          href={`/events/${event.id}`}
          className={buttonVariants({ className: "w-full" })}
        >
          View details
        </Link>
      </CardContent>
    </Card>
  );
}