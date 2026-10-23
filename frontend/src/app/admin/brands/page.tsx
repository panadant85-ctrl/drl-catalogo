import BrandsPage from "@/components/admin/brands/BrandsPage";
import AdminPermissionGuard from "@/components/admin/AdminPermissionGuard";

export default function Page() {
  return (
    <AdminPermissionGuard permissions={["brands.view"]}>
      <BrandsPage />
    </AdminPermissionGuard>
  );
}