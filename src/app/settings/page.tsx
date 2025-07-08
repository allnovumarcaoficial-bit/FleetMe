import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { PersonalInfoForm } from "./_components/personal-info";

export const metadata: Metadata = {
  title: "Settings Page",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <Breadcrumb
        pageName="Settings"
        links={[
          { href: "/", label: "Home" },
          { href: "/settings", label: "Settings" },
        ]}
      />

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-5 xl:col-span-3">
          <PersonalInfoForm />
        </div>
      </div>
    </div>
  );
}
