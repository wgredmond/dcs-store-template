"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount, useWriteContract } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { parseUnits } from "viem";

import { getProductBySlug, formatPrice } from "@/lib/products";
import { paymentChainConfig } from "@/config/payments";

const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

type OrderState =
  | { phase: "idle" }
  | { phase: "creating" }
  | { phase: "awaiting_payment"; orderId: string; amountCents: number; payToAddress: string; tokenAddress: string }
  | { phase: "submitting_tx"; orderId: string }
  | { phase: "polling"; orderId: string; txHash: string }
  | { phase: "error"; message: string };

export default function DcsCheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get("product") ?? "";
  const product = getProductBySlug(slug);

  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [state, setState] = useState<OrderState>({ phase: "idle" });
  const createdRef = useRef(false);

  // Create order on mount
  useEffect(() => {
    if (!product || createdRef.current) return;
    createdRef.current = true;

    setState({ phase: "creating" });

    const body = {
      cartLines: [
        {
          productId: product.id,
          sku: product.slug,
          name: product.name,
          quantity: 1,
          unitPriceCents: product.price,
        },
      ],
      amountCents: product.price,
      tokenAddress: paymentChainConfig.assetAddress,
      shippingSummary: null,
    };

    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.orderId) throw new Error(data.error ?? "Order creation failed");
        return fetch(`/api/orders/${data.orderId}/payment-intent`, {
          method: "POST",
        }).then((r) => r.json().then((pi) => ({ orderId: data.orderId, pi })));
      })
      .then(({ orderId, pi }) => {
        setState({
          phase: "awaiting_payment",
          orderId,
          amountCents: pi.amountCents ?? product!.price,
          payToAddress: pi.payToAddress ?? paymentChainConfig.payToAddress,
          tokenAddress: pi.tokenAddress ?? paymentChainConfig.assetAddress,
        });
      })
      .catch((err) => {
        setState({ phase: "error", message: err.message });
      });
  }, [product]);

  // Poll for confirmation
  useEffect(() => {
    if (state.phase !== "polling") return;
    const { orderId } = state;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.status === "PAID" || data.status === "CONFIRMED") {
          clearInterval(interval);
          router.push(`/checkout/dcs/success?orderId=${orderId}`);
        }
      } catch {
        // continue polling
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [state, router]);

  async function handlePay() {
    if (state.phase !== "awaiting_payment" || !address) return;
    const { orderId, amountCents, payToAddress, tokenAddress } = state;

    setState({ phase: "submitting_tx", orderId });

    try {
      const amountUnits = parseUnits(
        (amountCents / 100).toFixed(paymentChainConfig.assetDecimals),
        paymentChainConfig.assetDecimals,
      );

      const txHash = await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [payToAddress as `0x${string}`, amountUnits],
        chainId: paymentChainConfig.chainId,
      });

      await fetch(`/api/orders/${orderId}/attachTx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash }),
      });

      setState({ phase: "polling", orderId, txHash });
    } catch (err) {
      setState({
        phase: "error",
        message: err instanceof Error ? err.message : "Transaction failed",
      });
    }
  }

  if (!product) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <p className="text-gray-600">Product not found.</p>
        <a href="/" className="mt-4 inline-block text-sm text-gray-500 hover:underline">
          ← Back to store
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-2">DCS Checkout</h1>
      <p className="text-gray-600 mb-6">
        Pay with USDC on {paymentChainConfig.networkName}
      </p>

      {/* Order summary */}
      <div className="rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="font-medium">{product.name}</span>
          <span className="font-medium">{formatPrice(product.price)}</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">Qty: 1</p>
      </div>

      {/* Network info */}
      <div className="text-sm text-gray-500 mb-6 space-y-1">
        <p>Network: <span className="font-medium text-gray-700">{paymentChainConfig.networkName}</span></p>
        <p>Token: <span className="font-medium text-gray-700">{paymentChainConfig.assetSymbol}</span></p>
      </div>

      {/* Status */}
      {state.phase === "creating" && (
        <p className="text-sm text-gray-500 mb-4">Creating order…</p>
      )}
      {state.phase === "error" && (
        <p className="text-sm text-red-600 mb-4">{state.message}</p>
      )}
      {state.phase === "submitting_tx" && (
        <p className="text-sm text-gray-500 mb-4">Waiting for wallet confirmation…</p>
      )}
      {state.phase === "polling" && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">Transaction submitted. Waiting for on-chain confirmation…</p>
          <a
            href={`${paymentChainConfig.explorerTxUrlPrefix}${state.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            View on {paymentChainConfig.networkName}
          </a>
        </div>
      )}

      {/* Connect / Pay button */}
      {!isConnected ? (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">Connect your wallet to pay.</p>
          <ConnectKitButton />
        </div>
      ) : (
        <button
          onClick={handlePay}
          disabled={
            state.phase !== "awaiting_payment" ||
            !paymentChainConfig.payToAddress
          }
          className="w-full rounded-lg bg-blue-600 px-6 py-4 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {state.phase === "awaiting_payment"
            ? `Pay ${formatPrice(state.amountCents)} USDC`
            : state.phase === "creating"
            ? "Preparing order…"
            : state.phase === "submitting_tx"
            ? "Confirm in wallet…"
            : state.phase === "polling"
            ? "Confirming…"
            : "Pay with USDC"}
        </button>
      )}

      <a
        href={`/products/${slug}`}
        className="mt-4 block text-center text-sm text-gray-500 hover:underline"
      >
        ← Back to product
      </a>
    </div>
  );
}
