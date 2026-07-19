import { Suspense } from "react";
import { redirect } from "next/navigation";

import { ChatThread } from "@/components/chat-thread";
import { OnboardingFallback } from "@/components/onboarding-fallback";
import {
  getConversationPeer,
  listMessages,
  userIsConversationMember,
} from "@/lib/chat";
import { getSessionUser } from "@/lib/profile";

export default function MessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<OnboardingFallback />}>
      <MessageThreadContent params={params} />
    </Suspense>
  );
}

async function MessageThreadContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: conversationId } = await params;
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login");
  }

  const isMember = await userIsConversationMember(conversationId);
  if (!isMember) {
    console.error("messages: not a member of", conversationId);
    redirect("/chats");
  }

  const [peer, messages] = await Promise.all([
    getConversationPeer(conversationId),
    listMessages(conversationId),
  ]);

  if (!peer) {
    console.error("messages: no peer for", conversationId);
    redirect("/chats");
  }

  return (
    <ChatThread
      conversationId={conversationId}
      currentUserId={user.id}
      peer={peer}
      initialMessages={messages}
    />
  );
}
