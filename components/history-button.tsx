import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import Link from "next/link";

export async function HistoryButton() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return (
    <Button asChild variant="outline">
      <Link href="/dashboard/history">
        <History className="h-4 w-4 mr-2" />
        히스토리
      </Link>
    </Button>
  );
}
