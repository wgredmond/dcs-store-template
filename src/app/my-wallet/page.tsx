"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";

import { paymentChainConfig } from "@/config/payments";

type PaymentOrder = {
  id: string;
  status: string;
  amountCents: number;
  paymentTxHash: string | null;
  chainId: number;
  tokenAddress: string;
  orderNumber: string | null;
  shipTo: string | null;
  items: Array<{ sku?: string; name?: string; quantity?: number }> | null;
  createdAt: string;
};

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  data?: Record<string, unknown> | null;
  source: string | null;
  sourceId: string | null;
  chainId: number;
  txHash: string | null;
  blockNumber: string | null;
  sequence: string | null;
  createdAt: string;
};

type WalletOverview = {
  paymentOrders?: PaymentOrder[];
  notifications?: Notification[];
  preOrders?: unknown[];
  payments?: unknown[];
  refunds?: unknown[];
};

const STATUS_COLORS: Record<string, string> = {
  PAID: "bg-green-100 text-green-800",
  CONFIRMED: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  FAILED: "bg-red-100 text-red-700",
};

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export default function MyWalletPage() {
  const { address, isConnected } = useAccount();
  const [overview, setOverview] = useState<WalletOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "notifications">(
    "orders",
  );

  useEffect(() => {
    if (!isConnected || !address) {
      setOverview(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/wallet/overview?address=${address}`)
      .then((r) => r.json())
      .then((data) => {
        setOverview(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [isConnected, address]);

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-6">My Wallet</h1>

      {!isConnected ? (
        <div className="text-center py-16">
          <p className="text-gray-600 mb-6">
            Connect your wallet to view your orders and notifications.
          </p>
          <ConnectKitButton />
        </div>
      ) : (
        <div>
          {/* Connected wallet info */}
          <div className="flex items-center justify-between mb-6 p-4 rounded-lg border border-gray-200">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Connected wallet</p>
              <p className="font-mono text-sm text-gray-900">
                {address?.slice(0, 6)}…{address?.slice(-4)}
              </p>
            </div>
            <ConnectKitButton />
          </div>

          {loading && (
            <p className="text-sm text-gray-500 text-center py-8">
              Loading wallet data…
            </p>
          )}
          {error && (
            <p className="text-sm text-red-600 text-center py-8">{error}</p>
          )}

          {overview && !loading && (
            <>
              {/* Tabs */}
              <div className="flex gap-4 border-b border-gray-200 mb-6">
                {(["orders", "notifications"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? "border-b-2 border-gray-900 text-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                    {tab === "orders" && overview.paymentOrders?.length
                      ? ` (${overview.paymentOrders.length})`
                      : ""}
                    {tab === "notifications" && overview.notifications?.length
                      ? ` (${overview.notifications.length})`
                      : ""}
                  </button>
                ))}
              </div>

              {/* Orders tab */}
              {activeTab === "orders" && (
                <div>
                  {!overview.paymentOrders?.length ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No orders found.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {overview.paymentOrders.map((order) => (
                        <li
                          key={order.id}
                          className="rounded-lg border border-gray-200 p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-mono text-xs text-gray-500 mb-1">
                                {order.orderNumber ?? order.id}
                              </p>
                              <p className="font-medium text-gray-900">
                                {formatCents(order.amountCents)}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <StatusBadge status={order.status} />
                          </div>
                          {order.paymentTxHash && (
                            <a
                              href={`${paymentChainConfig.explorerTxUrlPrefix}${order.paymentTxHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-block text-xs text-blue-600 hover:underline font-mono"
                            >
                              {order.paymentTxHash.slice(0, 10)}…{order.paymentTxHash.slice(-8)} ↗
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Notifications tab */}
              {activeTab === "notifications" && (
                <div>
                  {!overview.notifications?.length ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No notifications.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {overview.notifications.map((notif) => (
                        <li
                          key={notif.id}
                          className="rounded-lg border border-gray-200 p-4"
                        >
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-xs font-medium">
                              {notif.type}
                            </span>
                            {notif.createdAt && (
                              <span className="text-xs text-gray-400">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-0.5">{notif.title}</p>
                          {notif.message && (
                            <p className="text-xs text-gray-600 mb-1">{notif.message}</p>
                          )}
                          {notif.txHash && (
                            <a
                              href={`${paymentChainConfig.explorerTxUrlPrefix}${notif.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline font-mono"
                            >
                              {notif.txHash.slice(0, 10)}…{notif.txHash.slice(-8)} ↗
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
