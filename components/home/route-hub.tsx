import Link from "next/link";
import type { RouteCard } from "@/types/assessment";

type RouteHubProps = {
  routes: RouteCard[];
};

export function RouteHub({ routes }: RouteHubProps) {
  return (
    <section className="route-hub">
      <div className="panel route-hub__intro">
        <p className="eyebrow">Workspace Routes</p>
        <h1>Choose the portal surface you want to work in.</h1>
        <p className="hero__text">
          Each profile now has its own route so we can grow learner, reviewer,
          and administrator experiences independently without coupling them into
          one page.
        </p>
      </div>

      <div className="route-hub__grid">
        {routes.map((route) => (
          <Link className="route-card" href={route.href} key={route.href}>
            <div className="route-card__head">
              <strong>{route.label}</strong>
              {route.status ? <span className="panel__badge panel__badge--warm">{route.status}</span> : null}
            </div>
            <p>{route.description}</p>
            <span className="queue-item__link">Open {route.label.toLowerCase()} route</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
