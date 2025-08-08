import Link from "next/link";

interface BreadcrumbProps {
  pageName: string;
  links: { href: string; label: string }[];
}

const Breadcrumb = ({ pageName, links = [] }: BreadcrumbProps) => {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <nav>
        <ol className="flex items-center gap-2">
          {links.map((link, index) => (
            <li key={index}>
              <Link className="font-medium" href={link.href}>
                {link.label} /
              </Link>
            </li>
          ))}
          <li className="font-medium text-primary">{pageName}</li>
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
