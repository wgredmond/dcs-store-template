const RUNTIME_URL = process.env.WALLEYONE_URL?.replace(/\/$/, "");
const API_KEY = process.env.WALLEYONE_API_KEY ?? "";

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
      "x-api-key": API_KEY,
    },
  });
}
