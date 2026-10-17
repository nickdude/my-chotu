import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import RegisterForm from "./RegisterForm";

export const metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<Skeleton className="w-full max-w-md h-96" />}>
      <RegisterForm />
    </Suspense>
  );
}
