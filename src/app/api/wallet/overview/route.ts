import { NextRequest, NextResponse } from "next/server";

import { callRuntime } from "@/lib/runtime";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const res = await callRuntime(`/wallet/overview?${searchParams}`);
  return NextResponse.json(await res.json(), { status: res.status });
}
