import { Suspense } from "react";
import { PublicNav } from "@/components/layout/PublicNav";
import CheckoutForm from "./CheckoutForm";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <PublicNav />
      <Suspense fallback={<PageSkeleton />}>
        <CheckoutForm />
      </Suspense>
    </main>
  );
}
