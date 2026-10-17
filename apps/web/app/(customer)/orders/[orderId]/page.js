import { PublicNav } from "@/components/layout/PublicNav";
import OrderDetail from "./OrderDetail";

export const metadata = { title: "Order details" };

export default function OrderDetailPage({ params }) {
  return (
    <main className="min-h-screen flex flex-col">
      <PublicNav />
      <div className="flex-1 bg-[#FFFDF9] py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <OrderDetail orderId={params.orderId} />
        </div>
      </div>
    </main>
  );
}
