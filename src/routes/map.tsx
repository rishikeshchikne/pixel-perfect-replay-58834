import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Info, Minus, Pause, Play, Plus, RotateCcw, X } from "lucide-react";
import { PageHeader } from "@/components/museum/PageHeader";
import { SchematicMap } from "@/components/museum/space/SchematicMap";
import { SceneErrorBoundary } from "@/components/museum/space/SceneErrorBoundary";
import { ARTIFACTS, TIMELINE, getArtifact, type Destination } from "@/lib/artifacts";
import { TEXTURE_CREDITS, type MapPin } from "@/lib/space";
import type { SceneApi } from "@/components/museum/space/SpaceScene";
import { cn } from "@/lib/utils";

const SpaceScene = lazy(() => import("@/components/museum/space/SpaceScene"));

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "3D Ghost Map & Mission Timeline — RE:SPACE" },
      { name: "description", content: "Explore a 3D Moon and Mars built from NASA surface maps and see where NASA machines remain today." },
      { property: "og:title", content: "3D Ghost Map & Mission Timeline — RE:SPACE" },
      { property: "og:description", content: "Fly between the Moon and Mars and find where humanity left its footprints." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MapPage,
});

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const fmtCoord = (p: MapPin) =>
  `${Math.abs(p.lat).toFixed(2)}°${p.lat >= 0 ? "N" : "S"}, ${Math.abs(p.lon).toFixed(2)}°${p.lon >= 0 ? "E" : "W"}`;

function CtrlButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-10 place-items-center rounded-full glass text-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
    >
      {children}
    </button>
  );
}

function MapPage() {
  const [world, setWorld] = useState<Destination>("Moon");
  const [selected, setSelected] = useState<MapPin | null>(null);
  const [activeEvent, setActiveEvent] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [sceneFailed, setSceneFailed] = useState(false);
  const flat = webgl === false || sceneFailed;
  const apiRef = useRef<SceneApi | null>(null);

  useEffect(() => setWebgl(hasWebGL()), []);

  const allPins: MapPin[] = useMemo(
    () => ARTIFACTS.flatMap((a) => a.coords.map((c, i) => ({ key: `${a.id}-${i}`, artifactId: a.id, ...c }))),
    [],
  );
  const pins = allPins.filter((p) => getArtifact(p.artifactId)?.destination === world);
  const sel = selected ? getArtifact(selected.artifactId) : null;

  const chooseWorld = (w: Destination) => {
    setWorld(w);
    setSelected(null);
  };
  const selectPin = (p: MapPin) => {
    setSelected(p);
    apiRef.current?.focusPin(p);
  };

  return (
    <>
      <PageHeader
        eyebrow="Ghost Map"
        title={<>Where humanity left its <span className="text-primary">footprints</span></>}
        sub="Drag to turn the globe, scroll or pinch to zoom, and fly between the Moon and Mars to find the machines that stayed behind."
      />

      <section className="mx-auto max-w-7xl px-5">
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Choose a world">
          {(["Moon", "Mars"] as const).map((w) => (
            <button
              key={w}
              role="tab"
              aria-selected={world === w}
              onClick={() => chooseWorld(w)}
              className={cn(
                "eyebrow rounded-full border px-6 py-3 transition-all",
                world === w ? "border-science bg-science/15 text-science" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {w === "Moon" ? "Fly to the Moon" : "Fly to Mars"}
            </button>
          ))}
        </div>

        <div className="relative mt-6 h-[68vh] min-h-[420px] w-full overflow-hidden rounded-2xl border bg-background md:aspect-[16/9] md:h-auto md:max-h-[78vh]">
          {webgl === false ? (
            <SchematicMap world={world} pins={pins} selectedKey={selected?.key ?? null} onSelect={selectPin} />
          ) : (
            <ClientOnly fallback={<div className="absolute inset-0 bg-background" />}>
              {webgl && (
                <SceneErrorBoundary
                  onError={() => setSceneFailed(true)}
                  fallback={
                    <>
                      <SchematicMap world={world} pins={pins} selectedKey={selected?.key ?? null} onSelect={selectPin} />
                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="eyebrow absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full glass px-4 py-2 text-science hover:text-foreground"
                      >
                        3D view couldn't load · Try again
                      </button>
                    </>
                  }
                >
                <Suspense fallback={<div className="absolute inset-0 grid place-items-center bg-background"><p className="eyebrow text-science">Preparing 3D space…</p></div>}>
                  <SpaceScene
                    world={world}
                    paused={paused}
                    pins={allPins}
                    selectedKey={selected?.key ?? null}
                    onSelectPin={selectPin}
                    apiRef={apiRef}
                    onReady={() => {}}
                  />
                </Suspense>
                </SceneErrorBoundary>
              )}
            </ClientOnly>
          )}

          <span className="eyebrow pointer-events-none absolute left-4 top-4 z-20 text-muted-foreground">
            {world} · {flat ? "schematic" : "3D view"}
          </span>

          {!flat && (
            <div className="absolute right-3 top-3 z-20 flex flex-col gap-2">
              <CtrlButton label="Zoom in" onClick={() => apiRef.current?.zoom(0.75)}><Plus className="size-4" /></CtrlButton>
              <CtrlButton label="Zoom out" onClick={() => apiRef.current?.zoom(1.33)}><Minus className="size-4" /></CtrlButton>
              <CtrlButton label={paused ? "Resume rotation" : "Pause rotation"} onClick={() => setPaused((p) => !p)}>
                {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
              </CtrlButton>
              <CtrlButton label="Reset view" onClick={() => { setSelected(null); apiRef.current?.reset(); }}><RotateCcw className="size-4" /></CtrlButton>
            </div>
          )}

          {sel && selected && (
            <div className="absolute bottom-3 left-3 right-3 z-20 max-w-sm rounded-xl glass p-5 animate-rise sm:left-auto">
              <button onClick={() => setSelected(null)} aria-label="Close" className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
              <p className="eyebrow text-science">{sel.destination} · {sel.mission}</p>
              <h3 className="mt-2 text-lg font-semibold">{sel.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{selected.note} · approx. {fmtCoord(selected)}</p>
              <p className="mt-3 text-sm text-muted-foreground">{sel.short}</p>
              <Link to="/artifact/$id" params={{ id: sel.id }} className="eyebrow mt-4 inline-flex items-center gap-1 text-primary">
                Read its story <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          )}
        </div>

        <div className="mt-4">
          <p className="eyebrow text-muted-foreground">Landing sites on {world === "Moon" ? "the Moon" : "Mars"}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {pins.map((p) => (
              <button
                key={p.key}
                onClick={() => selectPin(p)}
                className={cn(
                  "rounded-full border px-4 py-2 text-left text-xs transition-colors",
                  selected?.key === p.key ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="font-semibold">{getArtifact(p.artifactId)?.name}</span> · {p.note}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-2 text-xs text-muted-foreground">
          <p className="flex items-start gap-2">
            <Info className="mt-0.5 size-3.5 shrink-0 text-science" />
            Surfaces are real NASA and USGS global maps. Body sizes keep their true proportions, but distances between worlds,
            lighting direction and rotation speed are compressed for viewing and are not to scale. Markers use rounded,
            published landing-site coordinates, so positions are approximate. Relief is exaggerated so craters and volcanoes are visible.
          </p>
          <details className="rounded-xl border bg-card/50 p-4">
            <summary className="eyebrow cursor-pointer text-science">Surface map credits</summary>
            <ul className="mt-3 space-y-2">
              {TEXTURE_CREDITS.map((c) => (
                <li key={c.dataset}>
                  <span className="text-foreground">{c.body}:</span> {c.dataset} — {c.credit}.{" "}
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="break-all text-primary underline-offset-2 hover:underline">
                    {c.url}
                  </a>
                </li>
              ))}
              <li>Stars, Milky Way, nebulae, galaxies and the Sun are artistic illustrations, not real sky positions.</li>
            </ul>
          </details>
        </div>
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
