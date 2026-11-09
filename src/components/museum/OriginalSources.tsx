import { ExternalLink, Globe2, Orbit, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OFFICIAL_RESOURCES } from "@/lib/resources";
import { Reveal } from "./Reveal";

const ICONS = { website: Globe2, mars: Orbit, youtube: Youtube };

export function OriginalSources() {
  return (
    <section aria-labelledby="original-sources" className="border-y bg-surface py-24">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal>
          <p className="eyebrow text-science">NASA research & official resources</p>
          <h2 id="original-sources" className="mt-4 text-3xl font-bold md:text-4xl">EXPLORE THE ORIGINAL SOURCES</h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Every discovery has a source. Explore the official NASA resources behind the stories of RE:SPACE.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {OFFICIAL_RESOURCES.map((resource, i) => {
            const Icon = ICONS[resource.kind];
            return (
              <Reveal key={resource.url} delay={i * 100}>
                <article className="group flex h-full flex-col rounded-lg border bg-card p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-science/40 motion-reduce:transform-none">
                  <div className="flex items-center justify-between">
                    <Icon className={resource.kind === "youtube" ? "size-8 text-primary" : "size-8 text-science"} />
                    <span className="eyebrow text-muted-foreground">0{i + 1}</span>
                  </div>
                  <h3 className="mt-8 text-xl font-semibold">{resource.title}</h3>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{resource.description}</p>
                  <Button asChild variant="glass" className="mt-8 w-full justify-between">
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.cta}<ExternalLink className="size-4" /></a>
                  </Button>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}