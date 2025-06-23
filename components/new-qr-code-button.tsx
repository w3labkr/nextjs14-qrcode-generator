import Link from "next/link";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewQrCodeButtonProps {
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "link"
    | "destructive"
    | "secondary";
  className?: string;
}

export function NewQrCodeButton({
  variant = "outline",
  className,
}: NewQrCodeButtonProps) {
  return (
    <Button asChild variant={variant} className={className}>
      <Link href="/qrcode">
        <QrCode className="h-4 w-4 mr-2" />새 QR 코드 만들기
      </Link>
    </Button>
  );
}
