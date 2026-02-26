import { NextRequest, NextResponse } from "next/server";

import { callRuntime } from "@/lib/runtime";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const res = await callRuntime(`/orders/${id}`, { method: "GET" });
  return NextResponse.json(await res.json(), { status: res.status });
}
