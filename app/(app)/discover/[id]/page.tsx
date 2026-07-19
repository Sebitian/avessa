import { notFound } from "next/navigation";

import { TravelerProfile } from "@/components/traveler-profile";
import { getTravelerById } from "@/lib/mock-data";
import {
  discoverTravelerToCard,
  getDiscoverTravelerById,
} from "@/lib/profile";

export default async function TravelerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const live = await getDiscoverTravelerById(id);
  if (live) {
    return <TravelerProfile traveler={discoverTravelerToCard(live)} />;
  }

  const mock = getTravelerById(id);
  if (!mock) {
    notFound();
  }

  return <TravelerProfile traveler={mock} />;
}
