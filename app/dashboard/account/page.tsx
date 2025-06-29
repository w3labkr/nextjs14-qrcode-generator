import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { AccountInfo } from "./components/account-info";
import { OAuthConnections } from "./components/oauth-connections";
import { PrivacyAndSecurity } from "./components/privacy-and-security";
import { AccountDeletion } from "./components/account-deletion";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="space-y-6">
      <AccountInfo session={session} />
      <OAuthConnections session={session} />
      <PrivacyAndSecurity />
      <AccountDeletion />
    </div>
  );
}
