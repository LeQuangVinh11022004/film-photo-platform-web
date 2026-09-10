import Link from "next/link";

const providerLinks = [
  ["Dashboard", "/dashboard"],
  ["Creative spaces", "/creative-spaces"],
  ["Equipment", "/equipment"],
  ["Reservations", "/reservations"],
  ["Packages", "/packages"],
];

const adminLinks = [["Dashboard", "/admin/dashboard"], ["Users", "/users"], ["Reports", "/reports"]];
const moderatorLinks = [
  ["Dashboard", "/moderator/dashboard"],
  ["Creative spaces", "/moderator/creative-spaces"],
  ["Equipment", "/moderator/equipment"],
  ["Reservations", "/moderator/reservations"],
  ["Packages", "/moderator/packages"],
];

export function Sidebar({ role }: { role: "provider" | "moderator" | "admin" }) {
  const links = role === "provider" ? providerLinks : role === "moderator" ? moderatorLinks : adminLinks;

  return (
    <aside className="border-b border-stone-200 bg-white px-5 py-5 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <Link href="/" className="text-lg font-bold tracking-tight text-stone-900">Film Photo</Link>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">{role} workspace</p>
      <nav className="mt-8 flex gap-2 overflow-x-auto lg:flex-col">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900">{label}</Link>
        ))}
      </nav>
    </aside>
  );
}
