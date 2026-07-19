import { createClient } from "@/lib/supabase/client";

export async function startConversation(otherUserId: string): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_or_create_conversation", {
    other_user_id: otherUserId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as string;
}

export async function sendMessage(
  conversationId: string,
  body: string,
): Promise<{
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not signed in");
  }

  const trimmed = body.trim();
  if (!trimmed) {
    throw new Error("Message is empty");
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body: trimmed,
    })
    .select("id, conversation_id, sender_id, body, created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
