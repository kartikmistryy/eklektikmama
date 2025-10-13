# Shopify Storefront Setup

This document explains how to set up Shopify Storefront API integration for the Eklektik Mama shop.

## Environment Variables Required

Add the following environment variables to your `.env.local` file:

```bash
# Shopify Storefront API Configuration
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store-name.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-access-token
```

## How to Get Shopify Credentials

### 1. Create a Shopify Store
- Go to [shopify.com](https://www.shopify.com)
- Sign up for a Shopify account
- Create a new store

### 2. Get Store Domain
- Your store domain will be: `your-store-name.myshopify.com`
- This is your `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`

### 3. Create Storefront Access Token
1. In your Shopify admin, go to **Apps** → **App and sales channel settings**
2. Click **Develop apps**
3. Click **Create an app**
4. Give your app a name (e.g., "Eklektik Mama Storefront")
5. Click **Configure Storefront API scopes**
6. Enable the following scopes:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_read_product_tags`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
   - `unauthenticated_write_customers`
   - `unauthenticated_read_customers`
7. Click **Save**
8. Click **Install app**
9. Go to **API credentials** tab
10. Copy the **Storefront access token**
11. This is your `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN`

## Features Implemented

### ✅ Product Display
- Product grid with images, titles, and prices
- Product detail pages with variants and options
- Responsive design with mobile optimization
- Loading states and error handling

### ✅ Shopping Cart
- Add/remove items from cart
- Update quantities
- Persistent cart using localStorage
- Real-time cart count in navbar

### ✅ Checkout Integration
- Direct integration with Shopify checkout
- Secure payment processing
- Order management through Shopify admin

### ✅ Components Created
- `ProductCard.jsx` - Individual product display
- `Cart.jsx` - Shopping cart sidebar
- `CartCount.jsx` - Cart item counter
- `useCart.js` - Cart state management hook

## File Structure

```
lib/
├── shopify.js              # Shopify API client and queries
└── hooks/
    └── useCart.js          # Cart state management

app/
├── shop/
│   ├── page.js            # Main shop page
│   └── [handle]/
│       └── page.js        # Product detail page
└── components/
    ├── ProductCard.jsx    # Product card component
    ├── Cart.jsx          # Cart sidebar
    └── CartCount.jsx     # Cart counter
```

## Usage

### Adding Products to Shopify
1. Go to your Shopify admin
2. Navigate to **Products**
3. Click **Add product**
4. Add product details, images, variants, and pricing
5. Set product status to **Active**
6. Products will automatically appear on your shop page

### Customizing the Shop
- Modify `app/shop/page.js` to change the shop layout
- Update `app/components/ProductCard.jsx` for product card styling
- Customize `app/components/Cart.jsx` for cart appearance

## Troubleshooting

### Products Not Loading
- Check that your environment variables are set correctly
- Verify your Shopify store has products
- Ensure products are set to "Active" status
- Check browser console for API errors

### Cart Not Working
- Verify Storefront API scopes are enabled
- Check that checkout permissions are granted
- Ensure your store has a payment provider configured

### Checkout Issues
- Make sure your Shopify store is properly configured
- Verify payment methods are set up
- Check that shipping zones are configured

## Security Notes

- Storefront access tokens are safe to use in client-side code
- They only allow read access to products and write access to checkouts
- Never expose Admin API tokens in client-side code
- Use HTTPS in production

## Support

For Shopify-specific issues:
- [Shopify Storefront API Documentation](https://shopify.dev/api/storefront)
- [Shopify Community Forums](https://community.shopify.com/)

For implementation issues:
- Check the browser console for errors
- Verify all environment variables are set
- Ensure all dependencies are installed
