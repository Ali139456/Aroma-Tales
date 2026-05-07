import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { products as staticProducts } from '../data/products'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { mapRowToStoreProduct } from '../lib/productMapper'

const ProductsContext = createContext(null)

function normalizeStaticProduct(p) {
  return {
    ...p,
    salePrice: null,
    images: [p.image],
    uuid: null,
    status: 'published',
    stockQuantity: null,
    lowStockThreshold: 5,
  }
}

export function ProductsProvider({ children }) {
  const [catalogAll, setCatalogAll] = useState(() =>
    staticProducts.map(normalizeStaticProduct)
  )
  const [loading, setLoading] = useState(true)
  const [remoteLoaded, setRemoteLoaded] = useState(false)
  const [loadError, setLoadError] = useState(null)

  const refreshProducts = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setCatalogAll(staticProducts.map(normalizeStaticProduct))
      setRemoteLoaded(false)
      setLoadError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setLoadError(null)

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('title', { ascending: true })

    if (error) {
      console.error('[products]', error.message)
      setLoadError(error.message)
      setCatalogAll(staticProducts.map(normalizeStaticProduct))
      setRemoteLoaded(false)
      setLoading(false)
      return
    }

    if (!data?.length) {
      setCatalogAll(staticProducts.map(normalizeStaticProduct))
      setRemoteLoaded(false)
      setLoading(false)
      return
    }

    setCatalogAll(data.map((row) => mapRowToStoreProduct(row)))
    setRemoteLoaded(true)
    setLoading(false)
  }, [])

  useEffect(() => {
    refreshProducts()
  }, [refreshProducts])

  const products = useMemo(
    () =>
      catalogAll.filter((p) => (p.status ?? 'published') === 'published'),
    [catalogAll]
  )

  const value = useMemo(
    () => ({
      products,
      catalogAll,
      loading,
      remoteLoaded,
      loadError,
      refreshProducts,
    }),
    [products, catalogAll, loading, remoteLoaded, loadError, refreshProducts]
  )

  return (
    <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) {
    throw new Error('useProducts must be used within ProductsProvider')
  }
  return ctx
}
