"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const qrCodeTypes = [
  { value: "url", label: "URL", href: "/qrcode/url" },
  { value: "text", label: "텍스트", href: "/qrcode/text" },
  { value: "wifi", label: "Wi-Fi", href: "/qrcode/wifi" },
  { value: "email", label: "이메일", href: "/qrcode/email" },
  { value: "sms", label: "SMS", href: "/qrcode/sms" },
  { value: "vcard", label: "연락처", href: "/qrcode/vcard" },
  { value: "location", label: "지도", href: "/qrcode/location" },
];

export function QrCodeTypeNavigation() {
  const pathname = usePathname();

  return (
    <div className="w-full mb-6">
      <div className="w-full overflow-x-auto">
        <div className="inline-flex w-max min-w-full justify-start gap-1 h-auto p-1 bg-muted rounded-lg">
          {qrCodeTypes.map((type) => (
            <Link
              key={type.value}
              href={type.href}
              className={cn(
                "flex-shrink-0 px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm rounded-md transition-all duration-200 hover:bg-background/80",
                pathname === type.href
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {type.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
