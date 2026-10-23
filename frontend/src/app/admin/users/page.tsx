import UsersPage from "@/components/admin/users/UsersPage";
import AdminPermissionGuard from "@/components/admin/AdminPermissionGuard";

export default function Page() {
  return (
    <AdminPermissionGuard permissions={["users.view"]}>
      <UsersPage />
    </AdminPermissionGuard>
  );
}