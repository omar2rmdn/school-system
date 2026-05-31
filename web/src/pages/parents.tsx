import UserManagementPage from "../components/user-management-page";

export default function Parents() {
  return (
    <UserManagementPage
      role="parent"
      title="Parents"
      totalLabel="Total parents"
      emptyMessage="No parents found."
    />
  );
}
