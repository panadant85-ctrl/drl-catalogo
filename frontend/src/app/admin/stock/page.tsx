
"use client";

import StockPage from "@/components/admin/stock/StockPage";
import AdminPermissionGuard from "@/components/admin/AdminPermissionGuard";

export default function Page() {
  return (
    <AdminPermissionGuard permissions={["products.view"]}>
      <StockPage />
    </AdminPermissionGuard>
  );
}
