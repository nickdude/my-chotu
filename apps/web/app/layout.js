import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { CartProvider } from "@/lib/context/CartContext";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "My Chotu — Your neighbourhood. Just a tap away.",
    template: "%s | My Chotu",
  },
  description:
    "Order from your favourite local shops. My Chotu connects you with neighbourhood stores for fast, convenient delivery.",
  keywords: ["local delivery", "neighbourhood shopping", "My Chotu", "kirana delivery"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <CartProvider>
          {children}
        </CartProvider>
        <Toaster />
      </body>
    </html>
  );
}
