import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CategoryCard } from '@/components/category-card'
import { Cpu, HardDrive, MemoryStick } from 'lucide-react' 
import { Monitor } from 'lucide-react'

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="container py-12 sm:py-20">
          <div className="mb-12 space-y-4">
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
              Track Hardware Prices
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Monitor real-time prices for CPUs, GPUs, RAM, and SSDs. Compare specs and find the best deals on the components you need.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <CategoryCard
              href="/cpu"
              icon={<Cpu className="h-6 w-6" />}
              title="CPUs"
              description="Processors from Intel and AMD with real-time pricing"
              count={12}
            />
            <CategoryCard
              href="/gpu"
              icon={<Monitor className="h-6 w-6" />}
              title="GPUs"
              description="Graphics cards from NVIDIA and AMD in stock"
              count={8}
            />
            <CategoryCard
              href="/ram"
              icon={<MemoryStick className="h-6 w-6" />}
              title="RAM"
              description="DDR4 and DDR5 memory modules tracked"
              count={10}
            />
            <CategoryCard
              href="/ssd"
              icon={<HardDrive className="h-6 w-6" />}
              title="SSDs"
              description="NVMe and SATA drives with performance specs"
              count={9}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
