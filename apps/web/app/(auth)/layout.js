import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <header className="p-4 flex justify-center sm:justify-start sm:px-8">
        <Link href="/">
          <Logo size="md" />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>
    </div>
  );
}
