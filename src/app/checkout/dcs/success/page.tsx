"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { paymentChainConfig } from "@/config/payments";

type OrderData = {
  orderId?: string;
  status?: string;
  txHash?: string;
  amountCents?: number;
};

export default function DcsSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";

  const [order, setOrder] = useState<OrderData | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data: OrderData = await res.json();
        setOrder(data);
        if (data.status === "CONFIRMED" || data.status === "PAID") {
          setConfirmed(true);
        }
      } catch {
        // continue
      }
    };

    poll();
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data: OrderData = await res.json();
        setOrder(data);
        if (data.status === "CONFIRMED" || data.status === "PAID") {
          setConfirmed(true);
          clearInterval(interval);
        }
      } catch {
        // continue
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  return (
    <div className="max-w-lg mx-auto py-20 text-center">
      <div className="text-5xl mb-4">{confirmed ? "✓" : "⏳"}</div>
      <h1 className="text-2xl font-semibold mb-2">
        {confirmed ? "Payment Confirmed!" : "Payment Submitted"}
      </h1>
      <p className="text-gray-600 mb-6">
        {confirmed
          ? "Your order has been confirmed on-chain."
          : "Waiting for on-chain confirmation…"}
      </p>

      {orderId && (
        <p className="text-sm text-gray-500 mb-2">
          Order ID: <span className="font-mono">{orderId}</span>
        </p>
      )}

      {order?.status && (
        <p className="text-sm text-gray-500 mb-2">
          Status: <span className="font-medium">{order.status}</span>
        </p>
      )}

      {order?.txHash && (
        <a
          href={`${paymentChainConfig.explorerTxUrlPrefix}${order.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline block mb-6"
        >
          View transaction on {paymentChainConfig.networkName} ↗
        </a>
      )}

      <a
        href="/"
        className="inline-block rounded-lg bg-gray-900 px-6 py-3 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
      >
        Continue Shopping
      </a>
    </div>
  );
}
