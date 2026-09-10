import { GraphQLClient } from 'graphql-request';
import { SHOPIFY_GRAPHQL_URL, SHOPIFY_STOREFRONT_TOKEN } from '../config';

export const shopifyClient = new GraphQLClient(SHOPIFY_GRAPHQL_URL, {
  headers: {
    'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
    'Content-Type': 'application/json',
  },
});

/**
 * Thin helper so every call site gets consistent error handling
 * instead of raw GraphQL errors bubbling into the UI.
 */
export async function shopifyRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  try {
    return await shopifyClient.request<T>(query, variables);
  } catch (err: any) {
    const message =
      err?.response?.errors?.[0]?.message ?? err?.message ?? 'Unknown Shopify API error';
    throw new Error(`Shopify API error: ${message}`);
  }
}
