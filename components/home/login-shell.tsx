"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { login, getCurrentUser, signup } from "@/lib/api";
import { ROLE_ROUTES, storeAuthSession } from "@/lib/auth";

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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [revealSigninPassword, setRevealSigninPassword] = useState(false);
  const [revealSignupPassword, setRevealSignupPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const tokenData = await login(username.trim(), password);
      const user = await getCurrentUser(tokenData.access_token);

      storeAuthSession(tokenData, user);

      const roleRoute = ROLE_ROUTES[user.role];
      const nextPath = new URLSearchParams(window.location.search).get("next");
      const targetPath = nextPath?.startsWith(roleRoute) ? nextPath : roleRoute;

      router.push(targetPath as Parameters<typeof router.push>[0]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signup({
        full_name: signupName.trim(),
        username: signupUsername.trim(),
        email: signupEmail.trim(),
        password: signupPassword
      });

      const tokenData = await login(signupUsername.trim(), signupPassword);
      const user = await getCurrentUser(tokenData.access_token);
      storeAuthSession(tokenData, user);
      router.push(ROLE_ROUTES[user.role]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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
            <label htmlFor="username">{"Email or USERNAME"}</label>
            <input
              className="input-field"
              id="username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="learner"
              type="email"
              value={username}
              required
              disabled={loading}
            />
          </div>

          <div className="form-card">
            <label htmlFor="password">Password</label>
            <div
              className={`password-field${revealSigninPassword ? " password-field--revealed" : ""}`}
            >
              <input
                className="input-field password-field__input"
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                type={revealSigninPassword ? "text" : "password"}
                value={password}
                required
                disabled={loading}
              />
              <button
                aria-label="Hold to reveal sign-in password"
                className="password-field__reveal"
                disabled={loading}
                onBlur={() => setRevealSigninPassword(false)}
                onFocus={() => setRevealSigninPassword(true)}
                onMouseDown={() => setRevealSigninPassword(true)}
                onMouseEnter={() => setRevealSigninPassword(true)}
                onMouseLeave={() => setRevealSigninPassword(false)}
                onMouseUp={() => setRevealSigninPassword(false)}
                type="button"
              >
                👀
              </button>
            </div>
          </div>

          <div className="login-form__actions">
            <button
              className="button button--primary"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <button
              className="button button--secondary"
              disabled={loading}
              onClick={() => {
                setShowSignup((current) => !current);
                setError(null);
              }}
              type="button"
            >
              Sign Up
            </button>
          </div>
          <div className="login-form__hint">
            <p>
              Submit will authenticate with the backend and route you to your workspace based on your role.
            </p>
          </div>
        </form>

        {showSignup ? (
          <form className="signup-window" onSubmit={handleSignup}>
            <div className="panel__header">
              <div>
                <p className="eyebrow">Learner Sign Up</p>
                <h2>Create your account</h2>
              </div>
            </div>

            <div className="form-card">
              <label htmlFor="signup-name">Name</label>
              <input
                className="input-field"
                disabled={loading}
                id="signup-name"
                onChange={(event) => setSignupName(event.target.value)}
                placeholder="Your full name"
                required
                type="text"
                value={signupName}
              />
            </div>

            <div className="form-card">
              <label htmlFor="signup-username">Username</label>
              <input
                className="input-field"
                disabled={loading}
                id="signup-username"
                minLength={3}
                onChange={(event) => setSignupUsername(event.target.value)}
                placeholder="choose-a-username"
                required
                type="text"
                value={signupUsername}
              />
            </div>

            <div className="form-card">
              <label htmlFor="signup-email">Email</label>
              <input
                className="input-field"
                disabled={loading}
                id="signup-email"
                onChange={(event) => setSignupEmail(event.target.value)}
                placeholder="name@company.com"
                required
                type="email"
                value={signupEmail}
              />
            </div>

            <div className="form-card">
              <label htmlFor="signup-password">New password</label>
              <div
                className={`password-field${revealSignupPassword ? " password-field--revealed" : ""}`}
              >
                <input
                  className="input-field password-field__input"
                  disabled={loading}
                  id="signup-password"
                  minLength={8}
                  onChange={(event) => setSignupPassword(event.target.value)}
                  placeholder="Create a password"
                  required
                  type={revealSignupPassword ? "text" : "password"}
                  value={signupPassword}
                />
                <button
                  aria-label="Hold to reveal sign-up password"
                  className="password-field__reveal"
                  disabled={loading}
                  onBlur={() => setRevealSignupPassword(false)}
                  onFocus={() => setRevealSignupPassword(true)}
                  onMouseDown={() => setRevealSignupPassword(true)}
                  onMouseEnter={() => setRevealSignupPassword(true)}
                  onMouseLeave={() => setRevealSignupPassword(false)}
                  onMouseUp={() => setRevealSignupPassword(false)}
                  type="button"
                >
                  👀
                </button>
              </div>
            </div>

            <button className="button button--primary" disabled={loading} type="submit">
              {loading ? "Creating account..." : "Create Learner Account"}
            </button>
          </form>
        ) : null}

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