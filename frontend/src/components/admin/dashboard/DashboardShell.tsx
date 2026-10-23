
"use client";

import type { ReactNode } from "react";

import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import styles from "./Dashboard.module.css";

type DashboardShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export default function DashboardShell({
  children,
  title: _title,
  subtitle: _subtitle,
}: DashboardShellProps) {
  return (
    <div className={styles.shell}>
      <DashboardSidebar />

      <div className={styles.main}>
        <DashboardHeader />

        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
