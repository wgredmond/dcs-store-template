import { NextRequest, NextResponse } from "next/server";

import { callRuntime } from "@/lib/runtime";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const res = await callRuntime(`/orders/${id}/payment-intent`, {
    method: "POST",
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
