import { NextRequest, NextResponse } from "next/server";

import { callRuntime } from "@/lib/runtime";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.text();
  const res = await callRuntime(`/orders/${id}/attach-tx`, {
    method: "POST",
    body,
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
