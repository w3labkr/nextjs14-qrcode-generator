"use client";

import DataManager from "./components/data-manager";
import { ServiceInfo } from "./components/service-info";
import HistoryClearSection from "./components/history-clear-section";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <DataManager />
      <HistoryClearSection />
      <ServiceInfo />
    </div>
  );
}
