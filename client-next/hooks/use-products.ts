import { useState, useEffect } from 'react'
import type { Product } from '@/lib/types'

type UseProductsResult = {
  products: Product[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useProducts(category: string): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/${category}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${category} data`);
        }

        const { data } = await response.json()

        // Transform API data to match Product type
        const transformedProducts = data.map((item: any): Product => {
          const primePrice = item.prime_price || item.price;
          const retailerPrices = [
            item.prime_price,
            item.vedant_price,
            item.mdcomp_price,
            item.pcstudio_price,
            item.clarion_price,
            item.ehubs_price,
          ].filter((p: number | null | undefined) => typeof p === 'number' && p > 0) as number[];
          const lowestPrice =
            retailerPrices.length > 0 ? Math.min(...retailerPrices) : primePrice;
          const difference =
            primePrice != null && lowestPrice != null
              ? primePrice - lowestPrice
              : null;
          return {
            id: item.product_sku || item.id,
            name: item.product_name || item.name,
            sku: item.product_sku,
            price: primePrice,
            difference,
            brand: item.brand || '',
            specs: {
              cores: item.cores || '-',
              clock: item.clock || '-',
              memory: item.memory || '-',
              storage: item.storage || '-',
            },
            priceHistory: item.price_history || [],
            retailers: [
              { name: 'Prime', price: item.prime_price, stock: item.prime_stock },
              { name: 'Vedant', price: item.vedant_price, stock: item.vedant_stock },
              { name: 'MD Computers', price: item.mdcomp_price, stock: item.mdcomp_stock },
              { name: 'PC Studio', price: item.pcstudio_price, stock: item.pcstudio_stock },
              { name: 'Clarion', price: item.clarion_price, stock: item.clarion_stock },
              { name: 'EHub', price: item.ehubs_price, stock: item.ehubs_stock },
              { name: 'Amazon', price: item.amazon_price, stock: item.amazon_stock },
            ].filter((r) => r.price != null && r.price > 0),
          };
        });

        setProducts(transformedProducts)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
        setProducts([])
      } finally {
        setLoading(false)
      }
  }

  useEffect(() => {
    fetchProducts()
  }, [category])

  const refetch = async () => {
    await fetchProducts()
  }

  return { products, loading, error, refetch }
}
