import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Info, X } from "lucide-react";
import { PageHeader } from "@/components/museum/PageHeader";
import { ARTIFACTS, TIMELINE, getArtifact, type Destination } from "@/lib/artifacts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/map")({
  head: () => ({
    meta: [
      { title: "Ghost Map & Mission Timeline — RE:SPACE" },
      { name: "description", content: "See where NASA machines remain on the Moon and Mars, and follow their missions through time." },
      { property: "og:title", content: "Ghost Map & Mission Timeline — RE:SPACE" },
      { property: "og:description", content: "Where humanity left its footprints on other worlds." },
    ],
  }),
  component: MapPage,
});

type Pin = { key: string; artifactId: string; lat: number; lon: number; note: string };

function MapPage() {
  const [world, setWorld] = useState<Destination>("Moon");
  const [selected, setSelected] = useState<Pin | null>(null);
  const [activeEvent, setActiveEvent] = useState<number | null>(null);

  const pins: Pin[] = ARTIFACTS.filter((a) => a.destination === world).flatMap((a) =>
    a.coords.map((c, i) => ({ key: `${a.id}-${i}`, artifactId: a.id, ...c })),
  );
  const sel = selected ? getArtifact(selected.artifactId) : null;
  // Equirectangular projection: lon -180..180 → 0..100%, lat 90..-90 → 0..100%.
  const pos = (p: Pin) => ({ left: `${((p.lon + 180) / 360) * 100}%`, top: `${((90 - p.lat) / 180) * 100}%` });

  return (
    <>
      <PageHeader
        eyebrow="Ghost Map"
        title={<>Where humanity left its <span className="text-primary">footprints</span></>}
        sub="Explore the places where human-made machines became part of another world."
      />

      <section className="mx-auto max-w-7xl px-5">
        <div className="flex gap-2" role="tablist" aria-label="Choose a world">
          {(["Moon", "Mars"] as const).map((w) => (
            <button
              key={w}
              role="tab"
              aria-selected={world === w}
              onClick={() => { setWorld(w); setSelected(null); }}
              className={cn(
                "eyebrow rounded-full border px-6 py-3 transition-all",
                world === w ? "border-science bg-science/15 text-science" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {w}
            </button>
          ))}
        </div>

        <div className="relative mt-6 aspect-[2/1] w-full overflow-hidden rounded-2xl border bg-surface">
          <div
            className={cn(
              "absolute inset-0",
              world === "Moon"
                ? "bg-[radial-gradient(ellipse_at_40%_45%,var(--color-card),var(--color-background)_75%)]"
                : "bg-[radial-gradient(ellipse_at_55%_50%,color-mix(in_oklab,var(--color-primary)_22%,var(--color-card)),var(--color-background)_80%)]",
            )}
          />
          <svg className="absolute inset-0 h-full w-full text-border" aria-hidden>
            {[...Array(11)].map((_, i) => (
              <line key={`v${i}`} x1={`${(i + 1) * (100 / 12)}%`} x2={`${(i + 1) * (100 / 12)}%`} y1="0" y2="100%" stroke="currentColor" />
            ))}
            {[...Array(5)].map((_, i) => (
              <line key={`h${i}`} y1={`${(i + 1) * (100 / 6)}%`} y2={`${(i + 1) * (100 / 6)}%`} x1="0" x2="100%" stroke="currentColor" />
            ))}
          </svg>
          <span className="eyebrow absolute left-3 top-1/2 -translate-y-1/2 text-[0.6rem] text-muted-foreground">0°</span>
          <span className="eyebrow absolute right-4 top-3 text-muted-foreground">{world} · schematic</span>

          {pins.map((p) => (
            <button
              key={p.key}
              style={pos(p)}
              onClick={() => setSelected(p)}
              aria-label={`${getArtifact(p.artifactId)?.name} — ${p.note}`}
              className="group absolute -translate-x-1/2 -translate-y-1/2 p-2"
            >
              <span className="absolute inset-2 rounded-full bg-science animate-pulse-ring" />
              <span className={cn("relative block size-3.5 rounded-full border-2 border-background bg-science", selected?.key === p.key && "bg-primary")} />
              <span className="eyebrow pointer-events-none absolute left-1/2 top-full mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-card px-2 py-1 text-[0.6rem] text-science group-hover:block">
                {p.note}
              </span>
            </button>
          ))}

          {sel && selected && (
            <div className="absolute bottom-3 left-3 right-3 max-w-sm rounded-xl glass p-5 animate-rise sm:left-auto">
              <button onClick={() => setSelected(null)} aria-label="Close" className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
              <p className="eyebrow text-science">{sel.destination} · {sel.mission}</p>
              <h3 className="mt-2 text-lg font-semibold">{sel.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {selected.note} · approx. {Math.abs(selected.lat).toFixed(2)}°{selected.lat >= 0 ? "N" : "S"},{" "}
                {Math.abs(selected.lon).toFixed(2)}°{selected.lon >= 0 ? "E" : "W"}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{sel.short}</p>
              <Link to="/artifact/$id" params={{ id: sel.id }} className="eyebrow mt-4 inline-flex items-center gap-1 text-primary">
                Read its story <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          )}
        </div>
        <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0 text-science" />
          Schematic map, not a real surface image. Markers use rounded, published landing-site coordinates plotted on a simple
          latitude/longitude grid, so positions are approximate.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-28">
        <p className="eyebrow text-primary">Mission timeline</p>
        <h2 className="mt-4 text-4xl font-bold md:text-5xl">Fifty years of leaving things behind</h2>
        <ol className="relative mt-14 border-l pl-8">
          {TIMELINE.map((e, i) => {
            const open = activeEvent === i;
            return (
              <li key={i} className="relative pb-8">
                <span className={cn("absolute -left-[39px] top-1.5 size-3.5 rounded-full border-2 border-background", e.dest === "Moon" ? "bg-foreground" : "bg-primary")} />
                <button onClick={() => setActiveEvent(open ? null : i)} aria-expanded={open} className="group w-full text-left">
                  <p className="eyebrow text-science">{e.date} · {e.dest}</p>
                  <p className="mt-1 font-display text-xl font-semibold transition-colors group-hover:text-primary">{e.title}</p>
                </button>
                {open && (
                  <div className="mt-3 max-w-xl rounded-xl border bg-card p-5 animate-rise">
                    <p className="text-sm text-muted-foreground">{e.body}</p>
                    <Link to="/artifact/$id" params={{ id: e.id }} className="eyebrow mt-3 inline-flex items-center gap-1 text-primary">
                      Explore {getArtifact(e.id)?.name} <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}
