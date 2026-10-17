import ShopOrderDetail from "./ShopOrderDetail";
export const metadata = { title: "Order detail" };
export default function OrderDetailPage({ params }) { return <ShopOrderDetail orderId={params.orderId} />; }
