const RUNTIME_URL = process.env.WALLEYONE_URL?.replace(/\/$/, "");
const INTERNAL_TOKEN = process.env.DCS_INTERNAL_TOKEN ?? "";

export async function callRuntime(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  if (!RUNTIME_URL) throw new Error("WALLEYONE_URL is not set");
  return fetch(`${RUNTIME_URL}/api/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string>),
      "x-internal-token": INTERNAL_TOKEN,
    },
  });
}
