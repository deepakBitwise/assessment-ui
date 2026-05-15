import type { Profile } from "@/types/assessment";

type ProfileCardProps = {
  profile: Profile;
};

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <aside className="profile-card">
      <div className="profile-card__top">
        <div>
          <p className="profile-card__label">{profile.program}</p>
          <h2>{profile.name}</h2>
          <p className="profile-card__muted">{profile.role}</p>
        </div>
        <div className="profile-card__badges">
          {profile.username ? (
            <span className="username-pill">@{profile.username}</span>
          ) : null}
          <span className="status-pill">{profile.status}</span>
        </div>
      </div>

      <div className="profile-card__metrics">
        {profile.metrics.map((metric) => (
          <div key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>

      <div className="profile-card__mentor">
        <div className="avatar">{profile.mentorInitials}</div>
        <div>
          <p>Mentor: {profile.mentorName}</p>
          <span>{profile.mentorNote}</span>
        </div>
      </div>
    </aside>
  );
}
