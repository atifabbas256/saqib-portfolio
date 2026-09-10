import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../config';
import { CartLine } from '../types';
import { formatMoney } from '../components/ProductCard';
import Header from '../components/Header';
import { useCart } from '../context/CartContext';

export default function CartScreen() {
  const navigation = useNavigation();
  const { cart, loading, updateQuantity, removeLine } = useCart();

  const renderLine = ({ item }: { item: CartLine }) => (
    <View style={styles.lineItem}>
      {item.merchandise.image ? (
        <Image source={{ uri: item.merchandise.image.url }} style={styles.lineImage} />
      ) : (
        <View style={[styles.lineImage, { backgroundColor: COLORS.surfaceAlt }]} />
      )}
      <View style={styles.lineInfo}>
        <Text style={styles.lineTitle} numberOfLines={2}>
          {item.merchandise.product.title}
        </Text>
        {item.merchandise.selectedOptions.length > 0 && (
          <Text style={styles.lineVariant}>
            {item.merchandise.selectedOptions.map((o) => o.value).join(' / ')}
          </Text>
        )}
        <Text style={styles.linePrice}>
          {formatMoney(item.merchandise.price.amount, item.merchandise.price.currencyCode)}
        </Text>

        <View style={styles.stepperRow}>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Ionicons name="remove" size={16} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Ionicons name="add" size={16} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => removeLine(item.id)}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const isEmpty = !cart || cart.lines.length === 0;

  return (
    <View style={styles.container}>
      <Header title="Your Bag" showBack />

      {isEmpty ? (
        <View style={styles.centerFill}>
          <Ionicons name="bag-outline" size={48} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>Your bag is empty</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => navigation.navigate('Home' as never)}>
            <Text style={styles.shopButtonText}>START SHOPPING</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart!.lines}
            keyExtractor={(item) => item.id}
            renderItem={renderLine}
            contentContainerStyle={styles.listContent}
          />

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {formatMoney(cart!.cost.subtotalAmount.amount, cart!.cost.subtotalAmount.currencyCode)}
              </Text>
            </View>
            <Text style={styles.summaryNote}>Taxes and shipping calculated at checkout</Text>

            <TouchableOpacity
              style={styles.checkoutButton}
              disabled={loading}
              onPress={() => navigation.navigate('Checkout' as never)}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <Text style={styles.checkoutButtonText}>CHECKOUT</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  emptyText: { color: COLORS.textSecondary, fontSize: 15, marginTop: 12, marginBottom: 20 },
  shopButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  shopButtonText: { color: COLORS.background, fontWeight: '700', letterSpacing: 1, fontSize: 13 },
  listContent: { padding: 16 },
  lineItem: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  lineImage: {
    width: 90,
    height: 100,
    borderRadius: 8,
  },
  lineInfo: { flex: 1 },
  lineTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' },
  lineVariant: { color: COLORS.textSecondary, fontSize: 12, marginTop: 3 },
  linePrice: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
  },
  stepperBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  stepperValue: { color: COLORS.textPrimary, fontSize: 13, minWidth: 20, textAlign: 'center' },
  removeText: { color: COLORS.accent, fontSize: 12, fontWeight: '600' },
  summary: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 16,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  summaryLabel: { color: COLORS.textSecondary, fontSize: 14 },
  summaryValue: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  summaryNote: { color: COLORS.textSecondary, fontSize: 11, marginBottom: 16 },
  checkoutButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: { color: COLORS.background, fontWeight: '700', letterSpacing: 1, fontSize: 14 },
});
