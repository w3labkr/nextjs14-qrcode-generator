"use client";

import DataManager from "./components/data-manager";
import { ServiceInfo } from "./components/service-info";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <DataManager />
      <ServiceInfo />
    </div>
  );
}
