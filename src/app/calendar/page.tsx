import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import CalendarBox from "@/components/CalenderBox";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calender Page",
  // other metadata
};

const CalendarPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Calendar"
        links={[
          { href: "/", label: "Home" },
          { href: "/calendar", label: "Calendar" }
        ]}
      />

      <CalendarBox />
    </>
  );
};

export default CalendarPage;
