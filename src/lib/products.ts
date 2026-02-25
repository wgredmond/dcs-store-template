export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number; // in cents
  image: string;
  category: string;
  details: string[];
}

export const products: Product[] = [
  {
    id: "1",
    slug: "classic-hoodie",
    name: "Classic Hoodie",
    description:
      "A comfortable, everyday hoodie made from 80% cotton, 20% polyester fleece. Perfect for layering in any season.",
    price: 6500,
    image: "https://picsum.photos/seed/hoodie/800/800",
    category: "Tops",
    details: [
      "80% cotton, 20% polyester fleece",
      "Unisex relaxed fit",
      "Kangaroo front pocket",
      "Ribbed cuffs and hem",
      "Machine washable",
    ],
  },
  {
    id: "2",
    slug: "graphic-tee",
    name: "Graphic Tee",
    description:
      "A lightweight, 100% cotton tee with a bold front graphic. Soft, breathable, and built for daily wear.",
    price: 3500,
    image: "https://picsum.photos/seed/graphictee/800/800",
    category: "Tops",
    details: [
      "100% ring-spun cotton",
      "Regular unisex fit",
      "Crew neck",
      "Pre-shrunk fabric",
      "Machine washable",
    ],
  },
  {
    id: "3",
    slug: "canvas-tote",
    name: "Canvas Tote Bag",
    description:
      "A sturdy 12 oz canvas tote with reinforced handles. Holds your groceries, books, or beach gear with ease.",
    price: 2500,
    image: "https://picsum.photos/seed/canvastote/800/800",
    category: "Accessories",
    details: [
      "12 oz natural canvas",
      "22\" drop handles",
      "Open top with interior pocket",
      "Approx. 15\" × 16\" × 4\"",
      "Spot clean recommended",
    ],
  },
  {
    id: "4",
    slug: "baseball-cap",
    name: "Baseball Cap",
    description:
      "A structured 6-panel cap with an embroidered logo and adjustable strap. One size fits most.",
    price: 3000,
    image: "https://picsum.photos/seed/baseballcap/800/800",
    category: "Accessories",
    details: [
      "100% chino cotton twill",
      "Structured 6-panel",
      "Embroidered eyelets",
      "Plastic snap closure",
      "One size fits most",
    ],
  },
  {
    id: "5",
    slug: "crewneck-sweatshirt",
    name: "Crewneck Sweatshirt",
    description:
      "A mid-weight crewneck built for comfort. Clean lines, no hood — pairs well with everything.",
    price: 7500,
    image: "https://picsum.photos/seed/crewneck/800/800",
    category: "Tops",
    details: [
      "80% cotton, 20% polyester",
      "300 gsm fleece",
      "Ribbed neckline, cuffs, and hem",
      "Relaxed fit",
      "Machine washable",
    ],
  },
  {
    id: "6",
    slug: "sticker-pack",
    name: "Sticker Pack",
    description:
      "Five die-cut vinyl stickers. Weatherproof, UV-resistant, and dishwasher safe. Stick 'em anywhere.",
    price: 1500,
    image: "https://picsum.photos/seed/stickerpack/800/800",
    category: "Accessories",
    details: [
      "5 stickers per pack",
      "Weatherproof vinyl",
      "UV and scratch resistant",
      "Dishwasher safe",
      "Sizes range from 2\" to 4\"",
    ],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
