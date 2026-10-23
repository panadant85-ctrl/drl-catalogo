import CategoriesPage from "@/components/admin/categories/CategoriesPage";
import AdminPermissionGuard from "@/components/admin/AdminPermissionGuard";

export default function Page() {
  return (
    <AdminPermissionGuard permissions={["categories.view"]}>
      <CategoriesPage />
    </AdminPermissionGuard>
  );
}