# Streetwear Shop — Bare React Native + Shopify

A complete **bare React Native CLI** storefront (no Expo) powered by the
**Shopify Storefront API**: product listing with search & infinite scroll,
product detail with variant/size picker, a persistent cart, and checkout via
Shopify's secure hosted checkout — styled after streetwear drop apps like
Limelight (dark theme, bold grid layout, sold-out badges, size chips).

This project was generated with the official React Native CLI (`react-native
init`), so it includes real native `android/` and `ios/` projects — open them
directly in Android Studio / Xcode, no Expo tooling involved.

## Stack

- **React Native CLI** (bare workflow), TypeScript
- **React Navigation** (native-stack) for screen flow
- **Shopify Storefront API** (GraphQL) for products, collections, search, and cart
- **Shopify Cart API** (`cartCreate` / `cartLinesAdd` / `cartLinesUpdate` / `cartLinesRemove`)
- **react-native-webview** to hand off to Shopify's hosted checkout for payment
- **react-native-vector-icons** for the icon set
- **AsyncStorage** to persist the cart ID across app restarts
- **Yarn** as the package manager

## Why hosted checkout instead of a custom payment screen?

Shopify deprecated the standalone Checkout API. The supported pattern for
headless/custom storefronts is: build the cart yourself with the **Cart API**,
then send the shopper to the `checkoutUrl` returned on the cart object. That
URL is Shopify's own checkout — it already handles PCI compliance, payment
methods, shipping-rate calculation, taxes, and discount codes. This app opens
that URL in an in-app WebView so it still feels native, and detects the
`/thank_you` order-confirmation page to know when an order completed.

If you want a fully native checkout (e.g. for Shop Pay), that requires
Shopify's separate Checkout Kit / Mobile Buy SDK — ask if you'd like that
wired in instead of the WebView.

## Setup

### 1. Get your Storefront API credentials

In your Shopify admin: `Settings → Apps and sales channels → Develop apps →
Create an app` → enable **Storefront API** → select scopes
(`unauthenticated_read_product_listings`, `unauthenticated_write_checkouts`,
`unauthenticated_read_checkouts`, etc.) → install the app → copy the
**Storefront API access token**. This token is safe to embed client-side —
it only grants the storefront scopes you picked, never your Admin API token.

### 2. Configure the app

Edit `src/config.ts`:

```ts
export const SHOPIFY_STORE_DOMAIN = 'your-store.myshopify.com';
export const SHOPIFY_STOREFRONT_TOKEN = 'your-storefront-access-token';
```

### 3. Install JS dependencies

```bash
yarn install
```

### 4. iOS native setup (macOS only)

CocoaPods installs the native modules (react-native-webview, vector-icons,
async-storage, screens, safe-area-context) via autolinking:

```bash
cd ios
bundle install        # first time only, installs the pinned CocoaPods version
bundle exec pod install
cd ..
```

### 5. Run the app

```bash
# Metro bundler (leave running in its own terminal)
yarn start

# iOS (macOS + Xcode required)
yarn ios

# Android (Android Studio / SDK + emulator or device required)
yarn android
```

## Native linking notes

Because this is bare RN, a couple of things are already wired up for you in
this repo so `react-native-vector-icons` renders correctly:

- **Android**: `android/app/build.gradle` applies
  `react-native-vector-icons/fonts.gradle`, which copies the icon fonts into
  the APK automatically on build.
- **iOS**: `ios/StreetwearShop/Info.plist` declares `Ionicons.ttf` under
  `UIAppFonts`; `pod install` pulls in the font resource itself.

Everything else (`react-native-webview`, `@react-native-async-storage/async-storage`,
`react-native-screens`, `react-native-safe-area-context`) is linked automatically
via React Native's autolinking — no manual native code edits needed for those.

## Project structure

```
index.js                        Native entry point (AppRegistry)
App.tsx                          Root component, providers
android/                         Native Android project (Gradle)
ios/                             Native iOS project (Xcode, CocoaPods)
src/
  config.ts                      Shopify credentials + theme colors
  types/index.ts                 Shared TypeScript types
  api/
    shopifyClient.ts              GraphQL client + error handling
    products.ts                   Product listing, search, product-by-handle, collections
    cart.ts                        Cart create/add/update/remove mutations
  context/
    CartContext.tsx                Global cart state, persisted cart ID
  components/
    ProductCard.tsx                 Grid card (image, title, price, sold-out badge)
    Header.tsx                      Shared header with cart badge
  screens/
    HomeScreen.tsx                   Product grid, search, pagination
    ProductDetailScreen.tsx          Gallery, size/variant picker, add to bag
    CartScreen.tsx                    Line items, quantity stepper, subtotal
    CheckoutScreen.tsx                WebView handoff to Shopify checkout
  navigation/
    AppNavigator.tsx                  Stack navigator
```

## Extending this further

- **Collections / home rails**: `fetchCollectionByHandle()` is already in
  `src/api/products.ts` — wire it into `HomeScreen` for "New Arrivals" /
  "Best Sellers" horizontal rails, Limelight-style.
- **Push notifications for drops**: add `@react-native-firebase/messaging` or
  `notifee` and pair with a scheduled job that pings when a new collection publishes.
- **Customer accounts / order history**: use the Storefront API's
  `customerAccessTokenCreate` and `customer` queries.
- **Wishlist / favorites**: store variant IDs locally (AsyncStorage) or sync
  via Shopify metafields if you want it cross-device.
