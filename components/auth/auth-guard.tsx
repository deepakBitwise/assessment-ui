"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getCurrentUser, refreshAccessToken } from "@/lib/api";
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredRefreshToken,
  ROLE_ROUTES,
  storeAuthSession,
  type UserRole
} from "@/lib/auth";

type AuthGuardProps = {
  allowedRole: UserRole;
  children: ReactNode;
};

export function AuthGuard({ allowedRole, children }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "authorized">("checking");

  useEffect(() => {
    let active = true;

    async function validateSession() {
      const accessToken = getStoredAccessToken();
      const refreshToken = getStoredRefreshToken();

      if (!accessToken && !refreshToken) {
        clearAuthSession();
        router.replace(`/?next=${encodeURIComponent(pathname)}`);
        return;
      }

      try {
        let user = null;

        if (accessToken) {
          try {
            user = await getCurrentUser(accessToken);
          } catch {
            user = null;
          }
        }

        if (!user && refreshToken) {
          const refreshed = await refreshAccessToken(refreshToken);
          user = await getCurrentUser(refreshed.access_token);
          storeAuthSession(refreshed, user);
        }

        if (!user) {
          throw new Error("Session could not be validated.");
        }

        if (user.role !== allowedRole) {
          router.replace(ROLE_ROUTES[user.role]);
          return;
        }

        if (active) {
          setStatus("authorized");
        }
      } catch {
        clearAuthSession();
        router.replace(`/?next=${encodeURIComponent(pathname)}`);
      }
    }

    validateSession();

    return () => {
      active = false;
    };
  }, [allowedRole, pathname, router]);

  if (status !== "authorized") {
    return (
      <section className="auth-check panel">
        <p className="eyebrow">Checking session</p>
        <h1>Opening your workspace...</h1>
      </section>
    );
  }

  return <>{children}</>;
}
