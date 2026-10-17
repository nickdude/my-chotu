import { Suspense } from "react";
import { PublicNav } from "@/components/layout/PublicNav";
import DiscoverySection from "./DiscoverySection";
import { Mascot } from "@/components/brand/Mascot";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#FFF0EB] to-[#FFFDF9] py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-8">
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#152744] leading-tight">
              Your neighbourhood.<br />
              <span className="text-[#F4512C]">Just a tap away.</span>
            </h1>
            <p className="mt-3 text-muted-foreground max-w-sm">
              Order from kirana stores, bakeries, pharmacies and more. Fast local delivery.
            </p>
            <div className="mt-5 flex gap-3 justify-center sm:justify-start">
              <Link href="/register?role=shopkeeper">
                <Button variant="outline" size="sm" className="border-[#152744] text-[#152744] hover:bg-[#152744] hover:text-white">
                  Register your shop
                </Button>
              </Link>
            </div>
          </div>
          <Mascot size={140} className="flex-shrink-0" />
        </div>
      </section>

      {/* Discovery */}
      <section className="flex-1 py-8 px-4 bg-[#FFFDF9]">
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
            </div>
          }>
            <DiscoverySection />
          </Suspense>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#152744] text-white/70 py-6 px-4 text-center text-sm">
        <p>© 2025 My Chotu. All rights reserved.</p>
      </footer>
    </main>
  );
}
