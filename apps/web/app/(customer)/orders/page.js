import { PublicNav } from "@/components/layout/PublicNav";
import OrdersList from "./OrdersList";

export const metadata = { title: "My Orders" };

export default function OrdersPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <PublicNav />
      <div className="flex-1 bg-[#FFFDF9] py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-[#152744] mb-6">My orders</h1>
          <OrdersList />
        </div>
      </div>
    </main>
  );
}
