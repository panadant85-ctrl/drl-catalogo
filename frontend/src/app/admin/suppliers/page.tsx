import SuppliersPage from "@/components/admin/suppliers/SuppliersPage";
import AdminPermissionGuard from "@/components/admin/AdminPermissionGuard";

export default function Page() {
  return (
    <AdminPermissionGuard permissions={["suppliers.view"]}>
      <SuppliersPage />
    </AdminPermissionGuard>
  );
}