"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/lib/api";
import { clearAuthSession, getStoredAccessToken, getStoredUser } from "@/lib/auth";
import type { CurrentUserResponse } from "@/lib/api";

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
  const router = useRouter();
  const [user, setUser] = useState<CurrentUserResponse | null>(null);
  const visibleNavItems = user
    ? navItems.filter((item) => {
        if (item.id === "home") {
          return true;
        }

        if (user.role === "LEARNER") {
          return item.id === "learner";
        }

        if (user.role === "REVIEWER") {
          return item.id === "reviewer";
        }

        return item.id === "admin";
      })
    : navItems;

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  async function handleSignOut() {
    const accessToken = getStoredAccessToken();

    if (accessToken) {
      try {
        await logout(accessToken);
      } catch {
        // Local sign-out should still complete if the server session is gone.
      }
    }

    clearAuthSession();
    setUser(null);
    router.push("/");
  }

  return (
    <nav className="app-nav">
      <Link className="app-nav__brand" href="/">
        DIFY Assessment Platform
      </Link>

      <div className="app-nav__links">
        {visibleNavItems.map((item) => (
          <Link
            className={`app-nav__link${current === item.id ? " app-nav__link--active" : ""}`}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
        {user ? (
          <>
            {/* <span className="app-nav__user">{user.full_name || user.email}</span> */}
            <button className="app-nav__button" onClick={handleSignOut} type="button">
              Sign out
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
}