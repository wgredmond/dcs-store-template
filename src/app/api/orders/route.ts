import { NextResponse } from "next/server";

import { callRuntime } from "@/lib/runtime";

const ORDER_SESSION_COOKIE = "dcs.order.id";

export async function POST(request: Request) {
  const body = await request.text();
  const res = await callRuntime("/orders", { method: "POST", body });
  const data = await res.json();

  const response = NextResponse.json(data, { status: res.status });

  if (res.ok && data.orderId) {
    response.cookies.set({
      name: ORDER_SESSION_COOKIE,
      value: data.orderId,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}
