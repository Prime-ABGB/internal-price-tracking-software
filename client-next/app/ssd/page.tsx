'use client'

import { useState, useMemo } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductTable, type Column } from '@/components/product-table'
import { ProductFilter } from '@/components/product-filter'
import { useProducts } from '@/hooks/use-products'
import type { Product } from '@/lib/types'
import { CpuProductDetails } from '@/components/cpu-product-details'

export default function SSDPage() {
  const { products: ssdProducts, loading, error } = useProducts('ssd')
  const [searchQuery, setSearchQuery] = useState('')
  const [priceRange] = useState({ min: 0, max: 200000 })

  const filteredProducts = useMemo(() => {
    return ssdProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max
      return matchesSearch && matchesPrice
    })
  }, [ssdProducts, searchQuery, priceRange])

  const columns: Column<Product>[] = [
    {
      key: 'name',
      label: 'Product Name',
      sortable: true,
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'sku',
      label: 'Product SKU',
      sortable: true,
      render: (_, item) => item.sku ?? '',
    },
    {
      key: 'price',
      label: 'Price (Prime)',
      sortable: true,
      render: (value) => <span>{value}</span>,
    },
    {
      key: 'difference',
      label: 'Difference',
      sortable: true,
      render: (_, item) => item.difference ?? 0,
    },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="container py-8 sm:py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">SSD Price Tracker</h1>
            <p className="mt-2 text-muted-foreground">
              Compare storage drive prices and specifications
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
                <p className="text-muted-foreground">Loading SSD data...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              <p className="font-semibold">Error loading data</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <ProductFilter
                onSearch={setSearchQuery}
              />

              <ProductTable
                columns={columns}
                data={filteredProducts}
                renderExpandedRow={(product: Product) => (
                  <CpuProductDetails product={product} />
                )}
              />
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
