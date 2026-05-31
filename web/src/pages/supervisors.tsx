import UserManagementPage from "../components/user-management-page";

export default function Supervisors() {
  return (
    <UserManagementPage
      role="supervisor"
      title="Supervisors"
      totalLabel="Total supervisors"
      emptyMessage="No supervisors found."
    />
  );
}
