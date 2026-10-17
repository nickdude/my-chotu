import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import ShopOnboarding from "./ShopOnboarding";

export const metadata = { title: "Register your shop" };

export default function ShopOnboardingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <header className="p-4 flex justify-center sm:justify-start sm:px-8">
        <Link href="/"><Logo size="md" /></Link>
      </header>
      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <ShopOnboarding />
      </main>
    </div>
  );
}
