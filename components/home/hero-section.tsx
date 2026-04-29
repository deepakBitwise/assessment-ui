import { ProfileCard } from "@/components/home/profile-card";
import type { HeroContent, Profile } from "@/types/assessment";

type HeroSectionProps = {
  hero: HeroContent;
  profile: Profile;
};

export function HeroSection({ hero, profile }: HeroSectionProps) {
  return (
    <section className="hero">
      <div className="hero__copy">
        <p className="eyebrow">{hero.eyebrow}</p>
        <h1>{hero.title}</h1>
        <p className="hero__text">{hero.description}</p>
        <div className="hero__actions">
          <button className="button button--primary">{hero.primaryAction}</button>
          <button className="button button--ghost">{hero.secondaryAction}</button>
        </div>
      </div>

      <ProfileCard profile={profile} />
    </section>
  );
}
