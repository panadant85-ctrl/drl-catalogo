"use client";

import type { ReactNode } from "react";
import DashboardShell from "@/components/admin/dashboard/DashboardShell";

type AdminPageProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export default function AdminPage({
  children,
}: AdminPageProps) {
  return <DashboardShell>{children}</DashboardShell>;
}
