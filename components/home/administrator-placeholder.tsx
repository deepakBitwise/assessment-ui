import type { AdminPlaceholder } from "@/types/assessment";

type AdministratorPlaceholderProps = {
  content: AdminPlaceholder;
};

export function AdministratorPlaceholder({
  content
}: AdministratorPlaceholderProps) {
  return (
    <section className="admin-placeholder">
      <div className="panel admin-placeholder__panel">
        <p className="eyebrow">Administrator Profile</p>
        <h1>{content.title}</h1>
        <p className="hero__text">{content.description}</p>
        <div className="brief-card">
          <p className="eyebrow">Planned Areas</p>
          <ul>
            {content.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
