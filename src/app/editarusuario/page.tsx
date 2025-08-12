import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import UsersTableNotAdmin from "@/components/Users/notAdminUser";
import UsersTable from "@/components/Users/UsersTable";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const EditarUsuarioPage = async () => {
  const session = await getServerSession(authOptions);
  console.log(session?.user.id);
  return (
    <>
      <Breadcrumb
        pageName="Editar Usuario"
        links={[{ href: "/", label: "Dashboard" }]}
      />

      <div className="flex flex-col gap-6">
        <UsersTableNotAdmin userId={session?.user.id ?? null} />
      </div>
    </>
  );
};

export default EditarUsuarioPage;
