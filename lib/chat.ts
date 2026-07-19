import { createClient } from "@/lib/supabase/server";

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type ChatPeer = {
  id: string;
  firstName: string;
  avatarUrl: string | null;
  area: string;
};

export type ConversationListItem = {
  id: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  peer: ChatPeer;
};

function avatarFallback(id: string) {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(id)}`;
}

function toPeer(row: {
  id: string;
  first_name: string | null;
  avatar_url: string | null;
  area_label: string | null;
  current_city: string | null;
}): ChatPeer {
  return {
    id: row.id,
    firstName: row.first_name?.trim() || "Traveler",
    avatarUrl: row.avatar_url || avatarFallback(row.id),
    area: row.area_label || row.current_city || "Nearby",
  };
}

export async function getOrCreateConversation(
  otherUserId: string,
): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_or_create_conversation", {
    other_user_id: otherUserId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as string;
}

export async function listConversations(): Promise<ConversationListItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: memberships, error: memberError } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("user_id", user.id);

  if (memberError) {
    console.error("list conversations members:", memberError.message);
    return [];
  }

  const conversationIds = (memberships ?? []).map((m) => m.conversation_id);
  if (conversationIds.length === 0) return [];

  const [{ data: conversations, error: convError }, { data: peers, error: peersError }] =
    await Promise.all([
      supabase
        .from("conversations")
        .select("id, last_message_at, last_message_preview")
        .in("id", conversationIds)
        .order("last_message_at", { ascending: false, nullsFirst: false }),
      supabase
        .from("conversation_members")
        .select("conversation_id, user_id")
        .in("conversation_id", conversationIds)
        .neq("user_id", user.id),
    ]);

  if (convError) {
    console.error("list conversations:", convError.message);
    return [];
  }
  if (peersError) {
    console.error("list conversation peers:", peersError.message);
    return [];
  }

  const peerIds = [...new Set((peers ?? []).map((p) => p.user_id))];
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, first_name, avatar_url, area_label, current_city")
    .in("id", peerIds);

  if (profileError) {
    console.error("list conversation profiles:", profileError.message);
    return [];
  }

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const peerByConversation = new Map<string, ChatPeer>();
  for (const row of peers ?? []) {
    const profile = profileById.get(row.user_id);
    if (!profile) continue;
    peerByConversation.set(row.conversation_id, toPeer(profile));
  }

  return (conversations ?? [])
    .map((conv) => {
      const peer = peerByConversation.get(conv.id);
      if (!peer) return null;
      return {
        id: conv.id,
        lastMessageAt: conv.last_message_at,
        lastMessagePreview: conv.last_message_preview,
        peer,
      } satisfies ConversationListItem;
    })
    .filter((item): item is ConversationListItem => item != null);
}

export async function getConversationPeer(
  conversationId: string,
): Promise<ChatPeer | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: member, error } = await supabase
    .from("conversation_members")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .neq("user_id", user.id)
    .maybeSingle();

  if (error || !member) {
    if (error) console.error("conversation peer:", error.message);
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, first_name, avatar_url, area_label, current_city")
    .eq("id", member.user_id)
    .maybeSingle();

  if (profileError || !profile) {
    if (profileError) console.error("peer profile:", profileError.message);
    return null;
  }

  return toPeer(profile);
}

export async function listMessages(
  conversationId: string,
): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, body, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) {
    console.error("list messages:", error.message);
    return [];
  }

  return (data ?? []) as ChatMessage[];
}

export async function userIsConversationMember(
  conversationId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("membership check:", error.message);
    return false;
  }

  return !!data;
}
