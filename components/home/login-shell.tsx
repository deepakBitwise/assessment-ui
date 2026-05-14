"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { login, getCurrentUser } from "@/lib/api";
import { DEMO_CREDENTIALS, ROLE_ROUTES, storeAuthSession } from "@/lib/auth";

type LoginShellProps = {
  routes: Array<{
    href: "/learner" | "/reviewer" | "/admin";
    label: string;
    description: string;
    status?: string;
  }>;
};

export function LoginShell({ routes }: LoginShellProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const tokenData = await login(email, password);
      const user = await getCurrentUser(tokenData.access_token);

      storeAuthSession(tokenData, user);

      const roleRoute = ROLE_ROUTES[user.role];
      const nextPath = new URLSearchParams(window.location.search).get("next");
      const targetPath = nextPath?.startsWith(roleRoute) ? nextPath : roleRoute;

      router.push(targetPath as Parameters<typeof router.push>[0]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleQuickLogin(email: string, password: string) {
    setEmail(email);
    setPassword(password);
  }

  return (
    <section className="login-layout">
      <div className="hero__copy login-hero">
        <p className="eyebrow">Enterprise Sign-In</p>
        <h1>Assessment access with a future-ready AD login entry.</h1>
        <p className="hero__text">
          This login screen authenticates with the backend, stores the issued session, and opens the correct workspace for learner, reviewer, or admin users.
        </p>

        <div className="login-benefits">
          <div className="detail-stat">
            <span>Auth method</span>
            <strong>Email & Password</strong>
          </div>
          <div className="detail-stat">
            <span>Target behavior</span>
            <strong>Role-aware landing after sign-in</strong>
          </div>
          <div className="detail-stat">
            <span>Current mode</span>
            <strong>Test credentials with real backend</strong>
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
          {error && (
            <div className="error-message" style={{ 
              color: '#dc2626', 
              padding: '12px', 
              backgroundColor: '#fee2e2', 
              borderRadius: '4px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          <div className="form-card">
            <label htmlFor="email">Work email</label>
            <input
              className="input-field"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              type="email"
              value={email}
              required
              disabled={loading}
            />
          </div>

          <div className="form-card">
            <label htmlFor="password">Password</label>
            <input
              className="input-field"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              type="password"
              value={password}
              required
              disabled={loading}
            />
          </div>

          <div className="login-form__actions">
            <button 
              className="button button--primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <p>
              Submit will authenticate with the backend and route you to your workspace based on your role.
            </p>
          </div>
        </form>

        <div className="login-routes">
          <p className="eyebrow">Demo Credentials</p>
          <div className="route-hub__grid">
            {DEMO_CREDENTIALS.map((cred) => (
              <div 
                className="route-card route-card--static" 
                key={cred.email}
                onClick={() => handleQuickLogin(cred.email, cred.password)}
                style={{ cursor: 'pointer' }}
              >
                <div className="route-card__head">
                  <strong>{cred.role} Workspace</strong>
                </div>
                <p>{cred.email}</p>
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
                  Password: {cred.password}
                </p>
              </div>
            ))}
          </div>
        </div>

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
