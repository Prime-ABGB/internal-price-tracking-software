export interface Product {
  id: string
  name: string
  sku?: string
  brand?: string
  price: number
  priceChange?: number
  specs: Record<string, string | number>
  difference?: number | null
  priceHistory?: PricePoint[]
  retailers?: {
    name: string
    price: number | null | undefined
    stock: string | null | undefined
  }[]
}

export interface PricePoint {
  date: string
  price: number
}

export interface CategoryData {
  category: 'cpu' | 'gpu' | 'ram' | 'ssd'
  products: Product[]
}
