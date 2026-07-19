import { notFound } from "next/navigation";

import { EventProfile } from "@/components/event-profile";
import { getEventById } from "@/lib/events";

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const event = getEventById(id);

  if (!event) {
    notFound();
  }

  const backHref =
    from === "explore"
      ? "/explore?category=events"
      : "/discover?category=events";

  return <EventProfile event={event} backHref={backHref} />;
}
