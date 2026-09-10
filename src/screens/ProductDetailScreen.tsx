import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../config';
import { Product, ProductVariant } from '../types';
import { fetchProductByHandle } from '../api/products';
import { formatMoney } from '../components/ProductCard';
import Header from '../components/Header';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { handle } = route.params as { handle: string };

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [adding, setAdding] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    (async () => {
      try {
        const p = await fetchProductByHandle(handle);
        setProduct(p);
        // Default to the first available variant, falling back to the first variant.
        const defaultVariant =
          p?.variants.find((v) => v.availableForSale) ?? p?.variants[0] ?? null;
        setSelectedVariant(defaultVariant);
      } catch (e: any) {
        setError(e.message ?? 'Failed to load product');
      } finally {
        setLoading(false);
      }
    })();
  }, [handle]);

  // Group selectable options (e.g. Size) across all variants for a picker UI.
  const optionGroups = useMemo(() => {
    if (!product) return [];
    const groups: Record<string, Set<string>> = {};
    product.variants.forEach((v) => {
      v.selectedOptions.forEach((opt) => {
        if (!groups[opt.name]) groups[opt.name] = new Set();
        groups[opt.name].add(opt.value);
      });
    });
    return Object.entries(groups).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }));
  }, [product]);

  const selectOptionValue = (optionName: string, value: string) => {
    if (!product) return;
    const currentSelections = new Map(
      selectedVariant?.selectedOptions.map((o) => [o.name, o.value]) ?? []
    );
    currentSelections.set(optionName, value);

    const match = product.variants.find((v) =>
      v.selectedOptions.every((o) => currentSelections.get(o.name) === o.value)
    );
    if (match) setSelectedVariant(match);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    if (!selectedVariant.availableForSale) {
      Alert.alert('Sold out', 'This size/option is currently unavailable.');
      return;
    }
    setAdding(true);
    try {
      await addToCart(selectedVariant.id, 1);
      Alert.alert('Added to bag', `${product?.title} was added to your bag.`, [
        { text: 'Keep shopping', style: 'cancel' },
        { text: 'View bag', onPress: () => navigation.navigate('Cart' as never) },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="" showBack />
        <ActivityIndicator style={styles.centerFill} color={COLORS.accent} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.container}>
        <Header title="" showBack />
        <View style={styles.centerFill}>
          <Text style={styles.errorText}>{error ?? 'Product not found'}</Text>
        </View>
      </View>
    );
  }

  const displayPrice = selectedVariant?.price ?? product.priceRange.minVariantPrice;

  return (
    <View style={styles.container}>
      <Header title={product.title} showBack />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {(product.images.length ? product.images : [product.featuredImage]).map(
            (img, idx) =>
              img && (
                <Image key={idx} source={{ uri: img.url }} style={styles.galleryImage} />
              )
          )}
        </ScrollView>

        <View style={styles.info}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>
            {formatMoney(displayPrice.amount, displayPrice.currencyCode)}
          </Text>

          {optionGroups.map((group) => (
            <View key={group.name} style={styles.optionGroup}>
              <Text style={styles.optionLabel}>{group.name.toUpperCase()}</Text>
              <View style={styles.optionRow}>
                {group.values.map((value) => {
                  const isSelected = selectedVariant?.selectedOptions.some(
                    (o) => o.name === group.name && o.value === value
                  );
                  return (
                    <TouchableOpacity
                      key={value}
                      style={[styles.optionChip, isSelected && styles.optionChipSelected]}
                      onPress={() => selectOptionValue(group.name, value)}
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          isSelected && styles.optionChipTextSelected,
                        ]}
                      >
                        {value}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          <Text style={styles.sectionLabel}>DESCRIPTION</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.addButton,
            (!selectedVariant?.availableForSale || adding) && styles.addButtonDisabled,
          ]}
          onPress={handleAddToCart}
          disabled={!selectedVariant?.availableForSale || adding}
        >
          {adding ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <Text style={styles.addButtonText}>
              {selectedVariant?.availableForSale ? 'ADD TO BAG' : 'SOLD OUT'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: COLORS.textSecondary },
  scrollContent: { paddingBottom: 100 },
  galleryImage: {
    width,
    height: width * 1.1,
    backgroundColor: COLORS.surface,
  },
  info: { padding: 16 },
  title: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  price: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 6,
    marginBottom: 16,
  },
  optionGroup: { marginBottom: 16 },
  optionLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
  },
  optionChipSelected: {
    backgroundColor: COLORS.textPrimary,
    borderColor: COLORS.textPrimary,
  },
  optionChipText: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600' },
  optionChipTextSelected: { color: COLORS.background },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  addButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: COLORS.surfaceAlt,
  },
  addButtonText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
