import { handleAssistantRequest } from "@/features/assistant/handler";
import { getAssistantDependencies } from "@/features/assistant/server";

export async function POST(request: Request): Promise<Response> {
  return handleAssistantRequest(request, getAssistantDependencies());
}
