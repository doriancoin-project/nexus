import {createStorefrontApiClient} from '@shopify/storefront-api-client';

const SHOPIFY_PUBLIC_ACCESS_TOKEN = '';

export const shopifyClient = createStorefrontApiClient({
  storeDomain: '',
  apiVersion: '2025-10',
  publicAccessToken: SHOPIFY_PUBLIC_ACCESS_TOKEN,
});

export const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
              }
            }
          }
        }
      }
    }
  }
`;

export const COLLECTIONS_QUERY = `
  query GetCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
            altText
          }
          products(first: 20) {
            edges {
              node {
                id
                title
                handle
                description
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                }
                variants(first: 1) {
                  edges {
                    node {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      availableForSale
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const CART_CREATE_MUTATION = `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        createdAt
        updatedAt
        checkoutUrl
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  priceV2 {
                    amount
                    currencyCode
                  }
                  product {
                    id
                    title
                    handle
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
          totalDutyAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        createdAt
        updatedAt
        checkoutUrl
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  priceV2 {
                    amount
                    currencyCode
                  }
                  product {
                    id
                    title
                    handle
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
          totalDutyAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  priceV2 {
                    amount
                    currencyCode
                  }
                  product {
                    id
                    title
                    handle
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_QUERY = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      createdAt
      updatedAt
      checkoutUrl
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                priceV2 {
                  amount
                  currencyCode
                }
                product {
                  id
                  title
                  handle
                  images(first: 1) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      cost {
        totalAmount {
          amount
          currencyCode
        }
        subtotalAmount {
          amount
          currencyCode
        }
        totalTaxAmount {
          amount
          currencyCode
        }
        totalDutyAmount {
          amount
          currencyCode
        }
      }
    }
  }
`;

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string;
      };
    }>;
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: {
          amount: string;
          currencyCode: string;
        };
        availableForSale: boolean;
      };
    }>;
  };
}

export interface ProductsResponse {
  products: {
    edges: Array<{
      node: Product;
    }>;
  };
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description: string;
  image?: {
    url: string;
    altText: string;
  };
  products: {
    edges: Array<{
      node: Product;
    }>;
  };
}

export interface CollectionsResponse {
  collections: {
    edges: Array<{
      node: Collection;
    }>;
  };
}

export interface CategoryWithProducts {
  collection: Collection;
  products: Product[];
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    priceV2: {
      amount: string;
      currencyCode: string;
    };
    product: {
      id: string;
      title: string;
      handle: string;
      images: {
        edges: Array<{
          node: {
            url: string;
            altText: string;
          };
        }>;
      };
    };
  };
}

export interface CartCost {
  totalAmount: {
    amount: string;
    currencyCode: string;
  };
  subtotalAmount: {
    amount: string;
    currencyCode: string;
  };
  totalTaxAmount?: {
    amount: string;
    currencyCode: string;
  };
  totalDutyAmount?: {
    amount: string;
    currencyCode: string;
  };
}

export interface Cart {
  id: string;
  createdAt: string;
  updatedAt: string;
  checkoutUrl: string;
  lines: {
    edges: Array<{
      node: CartLine;
    }>;
  };
  cost: CartCost;
}

export interface CartCreateResponse {
  cartCreate: {
    cart: Cart;
    userErrors: Array<{
      field: string[];
      message: string;
    }>;
  };
}

export interface CartLinesAddResponse {
  cartLinesAdd: {
    cart: Cart;
    userErrors: Array<{
      field: string[];
      message: string;
    }>;
  };
}

export interface CartLinesUpdateResponse {
  cartLinesUpdate: {
    cart: Cart;
    userErrors: Array<{
      field: string[];
      message: string;
    }>;
  };
}

export interface CartQueryResponse {
  cart: Cart;
}

export async function fetchProducts(first: number = 20): Promise<Product[]> {
  // Shopify integration disabled
  return [];
}

export async function fetchCollectionsWithProducts(
  first: number = 10,
): Promise<CategoryWithProducts[]> {
  // Shopify integration disabled
  return [];
}

export async function createCart(
  merchandiseId: string,
  quantity: number = 1,
): Promise<Cart> {
  // Shopify integration disabled
  return {} as Cart;
}

export async function addToCart(
  cartId: string,
  merchandiseId: string,
  quantity: number = 1,
): Promise<Cart> {
  // Shopify integration disabled
  return {} as Cart;
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<Cart> {
  // Shopify integration disabled
  return {} as Cart;
}

export async function getCart(cartId: string): Promise<Cart> {
  // Shopify integration disabled
  return {} as Cart;
}

export async function getCheckoutUrl(cartId: string): Promise<string> {
  // Shopify integration disabled
  return '';
}
