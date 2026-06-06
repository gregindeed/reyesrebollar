// components/sections/TeamSection.tsx
// Propframe section: team member cards.
// Enable by adding "team" to siteConfig.sections and populating siteConfig.team.

import Image from "next/image";
import { siteConfig } from "@/site.config";

export function TeamSection() {
  if (!siteConfig.team.length) return null;

  return (
    <div className="border-t border-border/40">
      <div className="container mx-auto px-8 md:px-16 py-20">
        <p className="text-[0.65rem] tracking-[0.22em] uppercase text-terracotta mb-2">
          The Team
        </p>
        <h2
          className="font-display text-foreground mb-12 leading-tight"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
        >
          The people behind the properties
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10">
          {siteConfig.team.map((member) => (
            <div key={member.name} className="flex flex-col gap-4">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-muted">
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{member.name}</p>
                <p className="text-[0.65rem] tracking-[0.14em] uppercase text-terracotta mt-0.5">
                  {member.role}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
