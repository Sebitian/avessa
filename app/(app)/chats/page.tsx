import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { OnboardingFallback } from "@/components/onboarding-fallback";
import { listConversations } from "@/lib/chat";
import { getCurrentProfile, getSessionUser } from "@/lib/profile";

export default function ChatsPage() {
  return (
    <Suspense fallback={<OnboardingFallback />}>
      <ChatsContent />
    </Suspense>
  );
}

function formatTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

async function ChatsContent() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getCurrentProfile();
  if (!profile?.onboarding_complete) {
    redirect("/onboarding/profile");
  }

  const conversations = await listConversations();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <header className="safe-top px-5 pb-3">
        <h1 className="text-2xl font-bold tracking-tight">Chats</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your conversations
        </p>
      </header>

      {conversations.length > 0 ? (
        <ul className="divide-y divide-border/70">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <Link
                href={`/messages/${conversation.id}`}
                className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-muted/50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={conversation.peer.avatarUrl || ""}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/15"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold">
                      {conversation.peer.firstName}
                    </p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatTime(conversation.lastMessageAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {conversation.lastMessagePreview || "Say hi"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MessageCircle className="h-6 w-6" aria-hidden />
          </div>
          <p className="font-semibold">No chats yet</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Open someone on Discover or Explore, then tap Message to start a
            conversation.
          </p>
        </div>
      )}
    </div>
  );
}
