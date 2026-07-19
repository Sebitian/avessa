"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StartChatButtonProps = {
  otherUserId: string;
  className?: string;
  label?: string;
};

export function StartChatButton({
  otherUserId,
  className,
  label = "Message",
}: StartChatButtonProps) {
  return (
    <Button
      asChild
      size="lg"
      className={cn(
        "h-12 w-full rounded-xl text-base font-semibold shadow-md shadow-primary/20",
        className,
      )}
    >
      <Link href={`/messages/with/${otherUserId}`}>
        <MessageCircle className="h-5 w-5" />
        {label}
      </Link>
    </Button>
  );
}
