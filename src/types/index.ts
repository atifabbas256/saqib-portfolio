export interface MoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface ProductImage {
  url: string;
  altText: string | null;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable?: number;
  price: MoneyV2;
  selectedOptions: { name: string; value: string }[];
  image?: ProductImage | null;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  featuredImage: ProductImage | null;
  images: ProductImage[];
  priceRange: {
    minVariantPrice: MoneyV2;
    maxVariantPrice: MoneyV2;
  };
  variants: ProductVariant[];
  tags: string[];
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: ProductVariant & { product: { title: string; handle: string } };
  cost: {
    totalAmount: MoneyV2;
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: MoneyV2;
    totalAmount: MoneyV2;
    totalTaxAmount: MoneyV2 | null;
  };
  lines: CartLine[];
}
