"use client";

import { useSession } from "next-auth/react";
import DataManager from "@/components/data-manager";

import { AccountInfo } from "./components/account-info";
import { PrivacyAndSecurity } from "./components/privacy-and-security";
import { ServiceInfo } from "./components/service-info";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <AccountInfo session={session} />
      <DataManager />
      <PrivacyAndSecurity />
      <ServiceInfo />
    </div>
  );
}
