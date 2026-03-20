'use client'

import Link from 'next/link'
import { Github, Twitter, Mail } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-secondary/30 py-12 sm:py-16">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-4 mb-8">
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/cpu" className="hover:text-foreground transition-colors">
                  CPU Tracker
                </Link>
              </li>
              <li>
                <Link href="/gpu" className="hover:text-foreground transition-colors">
                  GPU Tracker
                </Link>
              </li>
              <li>
                <Link href="/ram" className="hover:text-foreground transition-colors">
                  RAM Tracker
                </Link>
              </li>
              <li>
                <Link href="/ssd" className="hover:text-foreground transition-colors">
                  SSD Tracker
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Documentation
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} PriceTracker. All rights reserved. Built with React & Next.js
          </p>
        </div>
      </div>
    </footer>
  )
}
