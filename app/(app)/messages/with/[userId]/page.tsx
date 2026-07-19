import { Suspense } from "react";
import { redirect } from "next/navigation";

import { OnboardingFallback } from "@/components/onboarding-fallback";
import { getOrCreateConversation } from "@/lib/chat";
import { getSessionUser } from "@/lib/profile";

export default function StartChatWithUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  return (
    <Suspense fallback={<OnboardingFallback />}>
      <StartChatWithUserContent params={params} />
    </Suspense>
  );
}

async function StartChatWithUserContent({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login");
  }

  let conversationId: string;
  try {
    conversationId = await getOrCreateConversation(userId);
  } catch (error) {
    console.error("start chat:", error);
    redirect("/chats");
  }

  redirect(`/messages/${conversationId}`);
  return null;
}
