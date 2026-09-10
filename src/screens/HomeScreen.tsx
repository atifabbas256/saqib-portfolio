import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../config';
import { Product } from '../types';
import { fetchProducts, searchProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadInitial = useCallback(async () => {
    try {
      setError(null);
      const result = await fetchProducts(20);
      setProducts(result.products);
      setCursor(result.endCursor);
      setHasNextPage(result.hasNextPage);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const onRefresh = () => {
    setRefreshing(true);
    loadInitial();
  };

  const loadMore = async () => {
    if (!hasNextPage || loadingMore || searchTerm.trim()) return;
    setLoadingMore(true);
    try {
      const result = await fetchProducts(20, cursor);
      setProducts((prev) => [...prev, ...result.products]);
      setCursor(result.endCursor);
      setHasNextPage(result.hasNextPage);
    } catch (e) {
      // Silently ignore pagination errors, keep existing list intact.
    } finally {
      setLoadingMore(false);
    }
  };

  const onSubmitSearch = async () => {
    if (!searchTerm.trim()) {
      loadInitial();
      return;
    }
    setLoading(true);
    try {
      const results = await searchProducts(searchTerm.trim());
      setProducts(results);
      setHasNextPage(false);
    } catch (e: any) {
      setError(e.message ?? 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Streetwear Shop" />

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={COLORS.textSecondary} />
        <TextInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={onSubmitSearch}
          placeholder="Search products"
          placeholderTextColor={COLORS.textSecondary}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <ActivityIndicator style={styles.centerFill} color={COLORS.accent} />
      ) : error ? (
        <View style={styles.centerFill}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() =>
                navigation.navigate('ProductDetail' as never, { handle: item.handle } as never)
              }
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 16 }} /> : null
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No products found.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
  },
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
