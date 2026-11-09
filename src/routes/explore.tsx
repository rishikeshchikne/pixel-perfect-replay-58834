import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArtifactCard } from "@/components/museum/ArtifactCard";
import { PageHeader } from "@/components/museum/PageHeader";
import { ARTIFACTS, filterArtifacts, IMAGES, type Filter } from "@/lib/artifacts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "The Archive of Forgotten Machines — RE:SPACE" },
      { name: "description", content: "Search and filter NASA landers, rovers and equipment left on the Moon and Mars." },
      { property: "og:title", content: "The Archive of Forgotten Machines — RE:SPACE" },
      { property: "og:description", content: "Every machine has a mission. Every mission leaves a story." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: IMAGES.earthrise.src },
      { name: "twitter:image", content: IMAGES.earthrise.src },
    ],
  }),
  component: Explore,
});

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "moon", label: "Moon" },
  { id: "mars", label: "Mars" },
  { id: "rover", label: "Rovers" },
  { id: "lander", label: "Landers" },
  { id: "equipment", label: "Scientific equipment" },
];

function Explore() {
  const [q, setQ] = useState("");
  const [f, setF] = useState<Filter>("all");
  const results = useMemo(() => filterArtifacts(ARTIFACTS, q, f), [q, f]);

  return (
    <>
      <PageHeader
        eyebrow="Explore the archive"
        title={<>The archive of <span className="text-primary">forgotten machines</span></>}
        sub="Every machine has a mission. Every mission leaves a story."
        image={IMAGES.earthrise}
      />
      <section className="mx-auto max-w-7xl px-5 pb-28">
        <div className="flex flex-col gap-4 rounded-2xl glass p-4 md:flex-row md:items-center">
          <div className="relative md:w-80">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input aria-label="Search artifacts by name" placeholder="Search by name…" value={q} onChange={(e) => setQ(e.target.value)} className="h-11 pl-9" />
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter artifacts">
            {FILTERS.map((x) => (
              <button
                key={x.id}
                aria-pressed={f === x.id}
                onClick={() => setF(x.id)}
                className={cn(
                  "eyebrow rounded-full border px-4 py-2.5 transition-all",
                  f === x.id ? "border-primary bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
          {results.length} {results.length === 1 ? "artifact" : "artifacts"} found
        </p>
        {results.length ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((a) => <ArtifactCard key={a.id} a={a} />)}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed p-16 text-center">
            <SearchX className="mx-auto size-10 text-science" />
            <h2 className="mt-4 text-xl font-semibold">No machines found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {f === "equipment"
                ? "Standalone scientific instruments haven't been added to the archive yet."
                : "Try a different name or filter."}
            </p>
            <Button variant="glass" className="mt-6 rounded-full" onClick={() => { setQ(""); setF("all"); }}>Reset search</Button>
          </div>
        )}
      </section>
    </>
  );
}
