'use client'

import Link from 'next/link'
import { Cpu } from 'lucide-react'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Cpu className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline">PriceTracker</span>
        </Link>

        <div className="flex gap-1">
          <Link href="/cpu" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors">
            CPU
          </Link>
          <Link href="/gpu" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors">
            GPU
          </Link>
          <Link href="/ram" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors">
            RAM
          </Link>
          <Link href="/ssd" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors">
            SSD
          </Link>
        </div>
      </div>
    </nav>
  )
}
