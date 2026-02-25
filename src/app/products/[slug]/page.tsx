"use client";

import { notFound } from "next/navigation";
import Image from "next/image";
import { use, useState } from "react";
import { getProductBySlug, formatPrice } from "@/lib/products";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const product = getProductBySlug(slug);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!product) notFound();

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: product!.slug }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Checkout failed");
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Image */}
      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          width={800}
          height={800}
          className="w-full h-full object-cover"
          priority
        />
      </div>

      {/* Info */}
      <div className="flex flex-col justify-center">
        <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">
          {product.category}
        </p>
        <h1 className="text-3xl font-semibold">{product.name}</h1>
        <p className="mt-3 text-2xl font-medium text-gray-900">
          {formatPrice(product.price)}
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed">
          {product.description}
        </p>

        <ul className="mt-6 space-y-1">
          {product.details.map((detail) => (
            <li key={detail} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="mt-0.5 text-gray-400">—</span>
              {detail}
            </li>
          ))}
        </ul>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="mt-8 w-full rounded-lg bg-gray-900 px-6 py-4 text-white font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Redirecting to checkout…" : "Buy Now"}
        </button>

        <a
          href="/"
          className="mt-4 text-center text-sm text-gray-500 hover:underline"
        >
          ← Back to all products
        </a>
      </div>
    </div>
  );
}
