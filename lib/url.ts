import { headers } from "next/headers";

const LOCAL_HOST_PREFIXES = ["localhost", "127.0.0.1", "[::1]"];

export async function getSiteUrl(): Promise<string> {
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ??
    headerList.get("host") ??
    "localhost:3000";
  const isLocalHost = LOCAL_HOST_PREFIXES.some((prefix) =>
    host.startsWith(prefix),
  );
  const proto =
    headerList.get("x-forwarded-proto") ?? (isLocalHost ? "http" : "https");
  return `${proto}://${host}`;
}
