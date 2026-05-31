import UserManagementPage from "../components/user-management-page";

export default function Teachers() {
  return (
    <UserManagementPage
      role="teacher"
      title="Teachers"
      totalLabel="Total teachers"
      emptyMessage="No teachers found."
      includeRoleColumn={false}
      includeTeacherColumns
    />
  );
}
