import { redirect } from "next/navigation";

/** Events live under Discover as a category — no dedicated tab. */
export default function EventsPage() {
  redirect("/discover?category=events");
}
