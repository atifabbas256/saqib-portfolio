import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Dimensions } from 'react-native';
import { COLORS } from '../config';
import { Product } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 16 * 3) / 2;

interface Props {
  product: Product;
  onPress: () => void;
}

export default function ProductCard({ product, onPress }: Props) {
  const price = product.priceRange.minVariantPrice;
  const isSoldOut = !product.variants.some((v) => v.availableForSale);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageWrap}>
        {product.featuredImage ? (
          <Image source={{ uri: product.featuredImage.url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}
        {isSoldOut && (
          <View style={styles.soldOutBadge}>
            <Text style={styles.soldOutText}>SOLD OUT</Text>
          </View>
        )}
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {product.title}
      </Text>
      <Text style={styles.price}>
        {formatMoney(price.amount, price.currencyCode)}
      </Text>
    </TouchableOpacity>
  );
}

export function formatMoney(amount: string, currencyCode: string) {
  const num = parseFloat(amount);
  const symbol = currencyCode === 'USD' ? '$' : `${currencyCode} `;
  return `${symbol}${num.toFixed(2)}`;
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: 20,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 0.85,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: COLORS.surfaceAlt,
  },
  soldOutBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  soldOutText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  price: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
});
