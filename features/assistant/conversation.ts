import type { IAssistantMessage } from "@/engine/assistant";

const MERGED_MESSAGE_SEPARATOR = "\n\n";

export function normalizeConversation(
  messages: readonly IAssistantMessage[],
): readonly IAssistantMessage[] {
  const firstUserIndex = messages.findIndex(
    (message) => message.role === "user",
  );
  if (firstUserIndex === -1) {
    return [];
  }

  const normalized: IAssistantMessage[] = [];
  for (const message of messages.slice(firstUserIndex)) {
    const previous = normalized.at(-1);
    if (previous?.role === message.role) {
      normalized[normalized.length - 1] = {
        role: message.role,
        content: `${previous.content}${MERGED_MESSAGE_SEPARATOR}${message.content}`,
      };
    } else {
      normalized.push(message);
    }
  }
  return normalized;
}
