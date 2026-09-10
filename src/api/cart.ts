import { shopifyRequest } from './shopifyClient';
import { Cart } from '../types';

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount { amount currencyCode }
    totalAmount { amount currencyCode }
    totalTaxAmount { amount currencyCode }
  }
  lines(first: 100) {
    edges {
      node {
        id
        quantity
        cost { totalAmount { amount currencyCode } }
        merchandise {
          ... on ProductVariant {
            id
            title
            price { amount currencyCode }
            image { url altText }
            selectedOptions { name value }
            product { title handle }
          }
        }
      }
    }
  }
`;

function normalizeCart(node: any): Cart {
  return {
    id: node.id,
    checkoutUrl: node.checkoutUrl,
    totalQuantity: node.totalQuantity,
    cost: node.cost,
    lines: (node.lines?.edges ?? []).map((e: any) => ({
      id: e.node.id,
      quantity: e.node.quantity,
      cost: e.node.cost,
      merchandise: e.node.merchandise,
    })),
  };
}

/** Creates a brand-new cart, optionally seeded with one line item. */
export async function createCart(variantId?: string, quantity = 1): Promise<Cart> {
  const query = `
    mutation CartCreate($input: CartInput) {
      cartCreate(input: $input) {
        cart { ${CART_FIELDS} }
        userErrors { field message }
      }
    }
  `;
  const input = variantId ? { lines: [{ merchandiseId: variantId, quantity }] } : {};
  const data = await shopifyRequest<{ cartCreate: any }>(query, { input });
  if (data.cartCreate.userErrors?.length) {
    throw new Error(data.cartCreate.userErrors[0].message);
  }
  return normalizeCart(data.cartCreate.cart);
}

/** Fetches an existing cart by id — used to rehydrate cart on app launch. */
export async function fetchCart(cartId: string): Promise<Cart | null> {
  const query = `
    query CartQuery($id: ID!) {
      cart(id: $id) { ${CART_FIELDS} }
    }
  `;
  const data = await shopifyRequest<{ cart: any }>(query, { id: cartId });
  return data.cart ? normalizeCart(data.cart) : null;
}

export async function addCartLine(cartId: string, variantId: string, quantity = 1): Promise<Cart> {
  const query = `
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ${CART_FIELDS} }
        userErrors { field message }
      }
    }
  `;
  const data = await shopifyRequest<{ cartLinesAdd: any }>(query, {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }],
  });
  if (data.cartLinesAdd.userErrors?.length) {
    throw new Error(data.cartLinesAdd.userErrors[0].message);
  }
  return normalizeCart(data.cartLinesAdd.cart);
}

export async function updateCartLineQuantity(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<Cart> {
  const query = `
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ${CART_FIELDS} }
        userErrors { field message }
      }
    }
  `;
  const data = await shopifyRequest<{ cartLinesUpdate: any }>(query, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });
  if (data.cartLinesUpdate.userErrors?.length) {
    throw new Error(data.cartLinesUpdate.userErrors[0].message);
  }
  return normalizeCart(data.cartLinesUpdate.cart);
}

export async function removeCartLine(cartId: string, lineId: string): Promise<Cart> {
  const query = `
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ${CART_FIELDS} }
        userErrors { field message }
      }
    }
  `;
  const data = await shopifyRequest<{ cartLinesRemove: any }>(query, { cartId, lineIds: [lineId] });
  if (data.cartLinesRemove.userErrors?.length) {
    throw new Error(data.cartLinesRemove.userErrors[0].message);
  }
  return normalizeCart(data.cartLinesRemove.cart);
}
