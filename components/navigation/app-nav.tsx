import Link from "next/link";

type AppNavProps = {
  current: "home" | "learner" | "reviewer" | "admin";
};

const navItems = [
  { href: "/", label: "Home", id: "home" },
  { href: "/learner", label: "Learner", id: "learner" },
  { href: "/reviewer", label: "Reviewer", id: "reviewer" },
  { href: "/admin", label: "Admin", id: "admin" }
] as const;

export function AppNav({ current }: AppNavProps) {
  return (
    <nav className="app-nav">
      <Link className="app-nav__brand" href="/">
        DIFY Assessment Platform
      </Link>

      <div className="app-nav__links">
        {navItems.map((item) => (
          <Link
            className={`app-nav__link${current === item.id ? " app-nav__link--active" : ""}`}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
