import RolesPage from "@/components/admin/roles/RolesPage";
import AdminPermissionGuard from "@/components/admin/AdminPermissionGuard";

export default function Page() {
  return (
    <AdminPermissionGuard permissions={["roles.view"]}>
      <RolesPage />
    </AdminPermissionGuard>
  );
}