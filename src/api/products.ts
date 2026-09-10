import { shopifyRequest } from './shopifyClient';
import { Product } from '../types';

const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  descriptionHtml
  tags
  featuredImage {
    url
    altText
  }
  images(first: 10) {
    edges { node { url altText } }
  }
  priceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  variants(first: 25) {
    edges {
      node {
        id
        title
        availableForSale
        quantityAvailable
        price { amount currencyCode }
        selectedOptions { name value }
        image { url altText }
      }
    }
  }
`;

function normalizeProduct(node: any): Product {
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description,
    descriptionHtml: node.descriptionHtml,
    tags: node.tags ?? [],
    featuredImage: node.featuredImage ?? null,
    images: (node.images?.edges ?? []).map((e: any) => e.node),
    priceRange: node.priceRange,
    variants: (node.variants?.edges ?? []).map((e: any) => e.node),
  };
}

/** Paginated product listing for the main catalog / home feed. */
export async function fetchProducts(first = 20, after?: string) {
  const query = `
    query Products($first: Int!, $after: String) {
      products(first: $first, after: $after, sortKey: BEST_SELLING) {
        edges {
          cursor
          node { ${PRODUCT_FIELDS} }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  `;
  const data = await shopifyRequest<{ products: any }>(query, { first, after });
  return {
    products: data.products.edges.map((e: any) => normalizeProduct(e.node)),
    hasNextPage: data.products.pageInfo.hasNextPage,
    endCursor: data.products.pageInfo.endCursor,
  };
}

/** Full-text search across the catalog, used by the search bar. */
export async function searchProducts(searchTerm: string, first = 20) {
  const query = `
    query Search($query: String!, $first: Int!) {
      products(first: $first, query: $query) {
        edges { node { ${PRODUCT_FIELDS} } }
      }
    }
  `;
  const data = await shopifyRequest<{ products: any }>(query, { query: searchTerm, first });
  return data.products.edges.map((e: any) => normalizeProduct(e.node));
}

/** Single product detail by handle, for the PDP screen. */
export async function fetchProductByHandle(handle: string): Promise<Product | null> {
  const query = `
    query ProductByHandle($handle: String!) {
      productByHandle(handle: $handle) { ${PRODUCT_FIELDS} }
    }
  `;
  const data = await shopifyRequest<{ productByHandle: any }>(query, { handle });
  return data.productByHandle ? normalizeProduct(data.productByHandle) : null;
}

/** Product collections, e.g. "New Arrivals", "Best Sellers" for home screen rails. */
export async function fetchCollectionByHandle(handle: string, first = 10) {
  const query = `
    query CollectionByHandle($handle: String!, $first: Int!) {
      collectionByHandle(handle: $handle) {
        id
        title
        products(first: $first) {
          edges { node { ${PRODUCT_FIELDS} } }
        }
      }
    }
  `;
  const data = await shopifyRequest<{ collectionByHandle: any }>(query, { handle, first });
  if (!data.collectionByHandle) return null;
  return {
    id: data.collectionByHandle.id,
    title: data.collectionByHandle.title,
    products: data.collectionByHandle.products.edges.map((e: any) => normalizeProduct(e.node)),
  };
}
