import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";

export const metadata: Metadata = {
  title: "Gestionar Usuarios",
};

export default function GestionarUsuarios() {
  return (
    <>
      <div className="">
        <Breadcrumb
          pageName="Gestionar Usuarios"
          links={[{ href: "/", label: "Home" }]}
        />
      </div>
      <ShowcaseSection title="Usuarios:" className="!p-7">
        <></>
      </ShowcaseSection>
    </>
  );
}
