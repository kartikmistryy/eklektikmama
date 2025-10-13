import { createStorefrontApiClient } from '@shopify/storefront-api-client';

// Initialize Shopify Storefront API client
const client = createStorefrontApiClient({
  storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
  apiVersion: '2025-01',
  publicAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
});

// Check if environment variables are configured
if (!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || !process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
  console.error('❌ Shopify environment variables are missing!');
  console.error('Please create a .env.local file with:');
  console.error('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store-name.myshopify.com');
  console.error('NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-access-token');
}

// GraphQL queries for products
export const PRODUCTS_QUERY = `
  query getProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          description
          handle
          tags
          productType
          vendor
          createdAt
          updatedAt
          availableForSale
          totalInventory
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
          images(first: 10) {
            edges {
              node {
                id
                url
                altText
                width
                height
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                selectedOptions {
                  name
                  value
                }
                image {
                  id
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const PRODUCT_QUERY = `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      handle
      tags
      productType
      vendor
      createdAt
      updatedAt
      availableForSale
      totalInventory
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
      images(first: 10) {
        edges {
          node {
            id
            url
            altText
            width
            height
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
            image {
              id
              url
              altText
              width
              height
            }
          }
        }
      }
      options {
        id
        name
        values
      }
    }
  }
`;

export const COLLECTIONS_QUERY = `
  query getCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          description
          handle
          image {
            id
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;

// Helper functions
export async function getProducts(first = 20, after = null) {
  try {
    const response = await client.request(PRODUCTS_QUERY, {
      variables: { first, after }
    });
    return response.data?.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function getProduct(handle) {
  try {
    const response = await client.request(PRODUCT_QUERY, {
      variables: { handle }
    });
    return response.data?.product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

export async function getCollections(first = 10) {
  try {
    const response = await client.request(COLLECTIONS_QUERY, {
      variables: { first }
    });
    return response.data?.collections;
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
}

// Cart operations
export const CREATE_CART_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
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
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const ADD_TO_CART_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
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
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const UPDATE_CART_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
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
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const REMOVE_FROM_CART_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
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
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const APPLY_DISCOUNT_MUTATION = `
  mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart {
        id
        checkoutUrl
        totalQuantity
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
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
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
        discountCodes {
          code
          applicable
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const UPDATE_CART_ATTRIBUTES_MUTATION = `
  mutation cartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {
    cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
      cart {
        id
        checkoutUrl
        attributes {
          key
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function createCart() {
  try {
    const response = await client.request(CREATE_CART_MUTATION, {
      variables: { input: {} }
    });
    return response.data?.cartCreate;
  } catch (error) {
    console.error('Error creating cart:', error);
    throw error;
  }
}

export async function addToCart(cartId, lines) {
  try {
    const response = await client.request(ADD_TO_CART_MUTATION, {
      variables: { cartId, lines }
    });
    return response.data?.cartLinesAdd;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

export async function updateCart(cartId, lines) {
  try {
    const response = await client.request(UPDATE_CART_MUTATION, {
      variables: { cartId, lines }
    });
    return response.data?.cartLinesUpdate;
  } catch (error) {
    console.error('Error updating cart:', error);
    throw error;
  }
}

export async function removeFromCart(cartId, lineIds) {
  try {
    console.log('🔄 Shopify: Removing from cart:', { cartId, lineIds });
    const response = await client.request(REMOVE_FROM_CART_MUTATION, {
      variables: { cartId, lineIds }
    });
    console.log('📊 Shopify remove response:', response.data?.cartLinesRemove);
    return response.data?.cartLinesRemove;
  } catch (error) {
    console.error('❌ Shopify: Error removing from cart:', error);
    throw error;
  }
}

export async function applyDiscountCode(cartId, discountCode) {
  try {
    console.log('🔄 Applying discount code to cart:', discountCode);
    
    const response = await client.request(APPLY_DISCOUNT_MUTATION, {
      variables: { 
        cartId, 
        discountCodes: [discountCode] 
      }
    });
    
    const result = response.data?.cartDiscountCodesUpdate;
    console.log('📊 Discount application result:', result);
    
    if (result?.cart?.discountCodes) {
      console.log('✅ Discount codes applied:', result.cart.discountCodes);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error applying discount code:', error);
    throw error;
  }
}

// Helper function to get checkout URL with discount
export function getCheckoutUrlWithDiscount(cart, discountCode) {
  if (!cart?.checkoutUrl) return null;
  
  let checkoutUrl = cart.checkoutUrl;
  
  // Add discount code to URL if provided
  if (discountCode) {
    const separator = checkoutUrl.includes('?') ? '&' : '?';
    checkoutUrl = `${checkoutUrl}${separator}discount=${discountCode}`;
  }
  
  return checkoutUrl;
}

// Update cart attributes to store discount information
export async function updateCartAttributes(cartId, attributes) {
  try {
    console.log('🔄 Updating cart attributes:', attributes);
    
    const response = await client.request(UPDATE_CART_ATTRIBUTES_MUTATION, {
      variables: { 
        cartId, 
        attributes 
      }
    });
    
    const result = response.data?.cartAttributesUpdate;
    console.log('📊 Cart attributes update result:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error updating cart attributes:', error);
    throw error;
  }
}

export default client;
