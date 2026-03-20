'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

interface CategoryCardProps {
  href: string
  icon: ReactNode
  title: string
  description: string
  count?: number
}

export function CategoryCard({ href, icon, title, description, count }: CategoryCardProps) {
  return (
    <Link href={href}>
      <div className="group h-full rounded-lg border border-border bg-card p-6 hover:border-primary hover:shadow-lg transition-all duration-300 cursor-pointer">
        <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
          {icon}
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="mb-4 text-sm text-muted-foreground">{description}</p>
        {count !== undefined && (
          <p className="mb-4 text-xs text-muted-foreground font-medium">
            {count} products tracked
          </p>
        )}
        <div className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
          View Products
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  )
}
