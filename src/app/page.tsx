import Link from "next/link";
import Image from "next/image";
import { products, formatPrice } from "@/lib/products";

export default function ProductListingPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-8">All Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group block"
          >
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={product.image}
                alt={product.name}
                width={800}
                height={800}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="mt-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {product.category}
              </p>
              <h2 className="mt-1 font-medium group-hover:underline">
                {product.name}
              </h2>
              <p className="mt-1 text-gray-700">{formatPrice(product.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
