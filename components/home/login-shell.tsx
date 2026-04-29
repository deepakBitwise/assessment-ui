"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type LoginShellProps = {
  routes: Array<{
    href: "/learner" | "/reviewer" | "/admin";
    label: string;
    description: string;
    status?: string;
  }>;
};

const roleOptions = [
  { value: "/learner", label: "Learner workspace" },
  { value: "/reviewer", label: "Reviewer workspace" },
  { value: "/admin", label: "Administrator workspace" }
] as const;

export function LoginShell({ routes }: LoginShellProps) {
  const router = useRouter();
  const [email, setEmail] = useState("shivam.rao@company.com");
  const [role, setRole] =
    useState<(typeof roleOptions)[number]["value"]>("/learner");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(role);
  }

  return (
    <section className="login-layout">
      <div className="hero__copy login-hero">
        <p className="eyebrow">Enterprise Sign-In</p>
        <h1>Assessment access with a future-ready AD login entry.</h1>
        <p className="hero__text">
          For now this is a dummy sign-in screen. Later we can replace the form
          action with Azure AD authentication and route users based on their
          assigned role claims.
        </p>

        <div className="login-benefits">
          <div className="detail-stat">
            <span>Planned auth</span>
            <strong>Azure AD / Microsoft Entra ID</strong>
          </div>
          <div className="detail-stat">
            <span>Target behavior</span>
            <strong>Role-aware landing after sign-in</strong>
          </div>
          <div className="detail-stat">
            <span>Current mode</span>
            <strong>Dummy local UI flow only</strong>
          </div>
        </div>
      </div>

      <div className="panel login-panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Sign In</p>
            <h2>Continue to your workspace</h2>
          </div>
          <span className="panel__badge panel__badge--warm">Demo only</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-card">
            <label htmlFor="email">Work email</label>
            <input
              className="input-field"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              type="email"
              value={email}
            />
          </div>

          <div className="form-card">
            <label htmlFor="role">Role preview</label>
            <select
              className="input-field"
              id="role"
              onChange={(event) =>
                setRole(event.target.value as (typeof roleOptions)[number]["value"])
              }
              value={role}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="login-form__actions">
            <button className="button button--primary" type="submit">
              Sign In
            </button>
            <p>
              Submit is intentionally mocked right now and just routes you into
              the selected workspace.
            </p>
          </div>
        </form>

        <div className="login-routes">
          <p className="eyebrow">Available Workspaces</p>
          <div className="route-hub__grid">
            {routes.map((route) => (
              <div className="route-card route-card--static" key={route.href}>
                <div className="route-card__head">
                  <strong>{route.label}</strong>
                  {route.status ? (
                    <span className="panel__badge panel__badge--warm">
                      {route.status}
                    </span>
                  ) : null}
                </div>
                <p>{route.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
