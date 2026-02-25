import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="text-5xl mb-6">✓</div>
      <h1 className="text-3xl font-semibold mb-3">Order Confirmed</h1>
      <p className="text-gray-600 max-w-sm mb-8">
        Thanks for your purchase! You'll receive a confirmation email shortly.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-gray-900 px-6 py-3 text-white font-medium hover:bg-gray-700 transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
