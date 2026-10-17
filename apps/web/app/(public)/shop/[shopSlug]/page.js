import { Suspense } from "react";
import { PublicNav } from "@/components/layout/PublicNav";
import ShopStorefront from "./ShopStorefront";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";

export async function generateMetadata({ params }) {
  return { title: `Shop | My Chotu` };
}

export default function ShopPage({ params, searchParams }) {
  return (
    <main className="min-h-screen flex flex-col">
      <PublicNav />
      <Suspense fallback={<PageSkeleton />}>
        <ShopStorefront shopSlug={params.shopSlug} refParam={searchParams?.ref} />
      </Suspense>
    </main>
  );
}
