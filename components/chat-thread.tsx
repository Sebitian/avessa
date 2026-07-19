"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { sendMessage } from "@/lib/chat-client";
import type { ChatMessage, ChatPeer } from "@/lib/chat";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type ChatThreadProps = {
  conversationId: string;
  currentUserId: string;
  peer: ChatPeer;
  initialMessages: ChatMessage[];
};

export function ChatThread({
  conversationId,
  currentUserId,
  peer,
  initialMessages,
}: ChatThreadProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, row];
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    setError(null);
    setDraft("");

    const optimistic: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUserId,
      body,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const saved = await sendMessage(conversationId, body);
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? saved : m)),
      );
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(body);
      setError(err instanceof Error ? err.message : "Could not send");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <header className="safe-top flex items-center gap-3 border-b border-border/70 px-4 pb-3">
        <Link
          href="/chats"
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-muted"
          aria-label="Back to chats"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={peer.avatarUrl || ""}
          alt=""
          className="h-9 w-9 rounded-full object-cover"
        />
        <div className="min-w-0">
          <p className="truncate font-semibold">{peer.firstName}</p>
          <p className="truncate text-xs text-muted-foreground">{peer.area}</p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <p className="text-base font-semibold">
              Say hi to {peer.firstName}
            </p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Be kind, make a plan, meet in a public place.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {messages.map((message) => {
              const mine = message.sender_id === currentUserId;
              return (
                <li
                  key={message.id}
                  className={cn("flex", mine ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                      mine
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md bg-muted text-foreground",
                    )}
                  >
                    {message.body}
                  </div>
                </li>
              );
            })}
            <div ref={bottomRef} />
          </ul>
        )}
      </div>

      <form
        onSubmit={(e) => void onSend(e)}
        className="border-t border-border/70 bg-background px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
      >
        {error && (
          <p className="mb-2 px-1 text-xs text-destructive">{error}</p>
        )}
        <div className="flex items-end gap-2">
          <label className="sr-only" htmlFor="chat-draft">
            Message
          </label>
          <textarea
            id="chat-draft"
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message ${peer.firstName}…`}
            className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !draft.trim()}
            className="h-11 w-11 shrink-0 rounded-xl"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
