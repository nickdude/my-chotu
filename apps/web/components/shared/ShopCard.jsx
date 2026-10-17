import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Truck } from "lucide-react";

function isShopOpen(operatingHours) {
  if (!operatingHours?.length) return true;
  const now = new Date();
  const day = now.getDay();
  const hours = operatingHours.find((h) => h.dayOfWeek === day);
  if (!hours || hours.isClosed) return false;
  if (!hours.openTime || !hours.closeTime) return true;
  const [oh, om] = hours.openTime.split(":").map(Number);
  const [ch, cm] = hours.closeTime.split(":").map(Number);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return nowMinutes >= oh * 60 + om && nowMinutes < ch * 60 + cm;
}

export function ShopCard({ shop }) {
  const open = shop.isOpen && isShopOpen(shop.operatingHours);

  return (
    <Link
      href={`/shop/${shop.slug}`}
      className="group block rounded-xl border border-border bg-card overflow-hidden hover:shadow-md hover:border-[#F4512C]/40 transition-all duration-200"
    >
      {/* Cover */}
      <div className="h-36 bg-[#F1F3F5] relative overflow-hidden">
        {shop.coverImageUrl ? (
          <img
            src={shop.coverImageUrl}
            alt={shop.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FFF0EB] to-[#F1F3F5]">
            <span className="text-4xl">🛒</span>
          </div>
        )}
        {/* Logo */}
        <div className="absolute -bottom-5 left-4 w-12 h-12 rounded-xl border-2 border-white bg-white shadow-sm overflow-hidden">
          {shop.logoUrl ? (
            <img src={shop.logoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#FFF0EB] flex items-center justify-center text-lg">
              🏪
            </div>
          )}
        </div>
        {/* Open/closed badge */}
        <div className="absolute top-3 right-3">
          <Badge
            variant="secondary"
            className={open ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-600"}
          >
            {open ? "Open" : "Closed"}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="pt-7 pb-4 px-4">
        <h3 className="font-semibold text-[#152744] truncate group-hover:text-[#F4512C] transition-colors">
          {shop.name}
        </h3>
        {shop.category && (
          <p className="text-xs text-muted-foreground mt-0.5">{shop.category.name}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {shop.city && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {shop.city}
            </span>
          )}
          {shop.isDeliveryEnabled && (
            <span className="flex items-center gap-1">
              <Truck className="w-3 h-3" />
              Delivery
            </span>
          )}
          {shop.minOrderAmount > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Min ₹{shop.minOrderAmount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
