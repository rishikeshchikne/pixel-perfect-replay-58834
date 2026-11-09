import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Artifact } from "@/lib/artifacts";

export function ArtifactCard({ a }: { a: Artifact }) {
  return (
    <Link
      to="/artifact/$id"
      params={{ id: a.id }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={a.image.src}
          alt={a.image.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 overlay-fade" />
        <span className="absolute left-4 top-4 eyebrow rounded-full glass px-3 py-1 text-science">
          {a.destination}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="eyebrow text-primary">{a.mission}</p>
        <h3 className="text-xl font-semibold leading-tight">{a.name}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{a.short}</p>
        <p className="mt-auto flex items-start gap-2 border-t pt-4 text-xs text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-science" />
          <span>{a.status}</span>
        </p>
        <span className="eyebrow inline-flex items-center gap-1 text-primary">
          Explore story <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
