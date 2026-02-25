# dcs-store-template

Minimal Next.js storefront with product listing, product detail pages, and Stripe credit card checkout.

## Stack

- **Next.js 15** (App Router)
- **Tailwind CSS 4**
- **Stripe Checkout** (hosted)
- **TypeScript**

## Pages

| Route | Description |
|---|---|
| `/` | Product listing grid |
| `/products/[slug]` | Product detail page |
| `/api/checkout` | Creates a Stripe Checkout session |
| `/success` | Post-purchase confirmation |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in your Stripe keys from [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys):

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Customizing Products

Edit `src/lib/products.ts` to add, remove, or modify products. Each product has:

```ts
{
  id: string;
  slug: string;        // used in URL and checkout
  name: string;
  description: string;
  price: number;       // in cents (e.g. 6500 = $65.00)
  image: string;       // absolute URL or /public path
  category: string;
  details: string[];   // bullet points on PDP
}
```

## Deployment

Deploy to Vercel or any Node.js host. Set the environment variables and update `NEXT_PUBLIC_BASE_URL` to your production URL.
