import UserManagementPage from "../components/user-management-page";

export default function Admins() {
  return (
    <UserManagementPage
      role="admin"
      title="Admins"
      totalLabel="Total admins"
      emptyMessage="No admins found."
    />
  );
}
