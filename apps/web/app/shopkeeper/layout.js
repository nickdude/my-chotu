// Shopkeeper dashboard uses client hooks (usePathname, localStorage) — disable static prerender
export const dynamic = "force-dynamic";

import ShopkeeperShell from "./ShopkeeperShell";

export default function ShopkeeperLayout({ children }) {
  return <ShopkeeperShell>{children}</ShopkeeperShell>;
}
