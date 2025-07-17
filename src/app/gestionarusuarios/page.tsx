import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import UsersTable from "@/components/Users/UsersTable";

const ManageUsersPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Gestionar Usuarios"
        links={[{ href: "/", label: "Dashboard" }]}
      />

      <div className="flex flex-col gap-10">
        <UsersTable />
      </div>
    </>
  );
};

export default ManageUsersPage;
