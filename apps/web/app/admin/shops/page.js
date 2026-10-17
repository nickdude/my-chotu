import { Suspense } from "react";
import ShopsManager from "./ShopsManager";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
export const metadata = { title: "Shops" };
export default function AdminShopsPage() {
  return <Suspense fallback={<TableSkeleton rows={6} />}><ShopsManager /></Suspense>;
}
