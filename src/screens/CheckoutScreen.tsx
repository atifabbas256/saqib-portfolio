import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../config';
import Header from '../components/Header';
import { useCart } from '../context/CartContext';

/**
 * Shopify's hosted checkout handles all payment, address, shipping, and
 * fraud/PCI-compliance concerns. Headless apps should not attempt to
 * re-implement payment collection themselves — this WebView hands off to
 * Shopify's own checkout.liquid pages (or a custom-domain checkout if the
 * store has one configured), then detects the "Thank you" order-status page
 * to know the order completed successfully.
 */
export default function CheckoutScreen() {
  const navigation = useNavigation();
  const { cart, refreshCart } = useCart();
  const [loading, setLoading] = useState(true);

  const handleNavigationChange = async (navState: WebViewNavigation) => {
    // Shopify's order confirmation page URL contains "/thank_you" (or "/thank-you").
    const isThankYouPage = /\/(thank[_-]you)/i.test(navState.url);
    if (isThankYouPage) {
      // Order placed — the cart is now consumed, clear it locally and
      // let the user know via the confirmation screen (Shopify's own page).
      await AsyncStorage.removeItem('shopify_cart_id');
      // Give the user a moment to see the confirmation before returning.
      setTimeout(() => {
        navigation.navigate('Home' as never);
      }, 4000);
    }
  };

  if (!cart?.checkoutUrl) {
    return (
      <View style={styles.container}>
        <Header title="Checkout" showBack />
        <View style={styles.centerFill}>
          <ActivityIndicator color={COLORS.accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Checkout" showBack />
      <WebView
        source={{ uri: cart.checkoutUrl }}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationChange}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.centerFill}>
            <ActivityIndicator color={COLORS.accent} />
          </View>
        )}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={COLORS.accent} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
