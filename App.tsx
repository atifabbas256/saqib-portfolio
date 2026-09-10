import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { CartProvider } from './src/context/CartContext';
import { COLORS } from './src/config';

export default function App() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <AppNavigator />
      </CartProvider>
    </SafeAreaProvider>
  );
}
