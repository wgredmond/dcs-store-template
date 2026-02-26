"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";

import { paymentChainConfig } from "@/config/payments";

type PaymentOrder = {
  id: string;
  status: string;
  amountCents: number;
  txHash?: string;
  createdAt?: string;
};

type Notification = {
  id: string;
  type: string;
  orderId?: string;
  txHash?: string;
  createdAt?: string;
  details?: Record<string, unknown>;
};

type WalletOverview = {
  orders?: PaymentOrder[];
  notifications?: Notification[];
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
                    {tab === "orders" && overview.orders?.length
                      ? ` (${overview.orders.length})`
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
                  {!overview.orders?.length ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No orders found.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {overview.orders.map((order) => (
                        <li
                          key={order.id}
                          className="rounded-lg border border-gray-200 p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-mono text-xs text-gray-500 mb-1">
                                {order.id}
                              </p>
                              <p className="font-medium text-gray-900">
                                {formatCents(order.amountCents)}
                              </p>
                              {order.createdAt && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <StatusBadge status={order.status} />
                          </div>
                          {order.txHash && (
                            <a
                              href={`${paymentChainConfig.explorerTxUrlPrefix}${order.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-block text-xs text-blue-600 hover:underline font-mono"
                            >
                              {order.txHash.slice(0, 10)}…{order.txHash.slice(-8)} ↗
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
                          {notif.orderId && (
                            <p className="text-xs text-gray-500 mb-1">
                              Order: <span className="font-mono">{notif.orderId}</span>
                            </p>
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
